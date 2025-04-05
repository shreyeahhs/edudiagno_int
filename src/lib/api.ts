import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Enable sending cookies in cross-origin requests
  validateStatus: function (status) {
    return status >= 200 && status < 300 || status === 204;  // Accept 204 No Content
  }
});

// Add request interceptor for logging
api.interceptors.request.use((config) => {
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
    baseURL: config.baseURL
  });
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data;
          
          // Update tokens in localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    // Create form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token, refresh_token, ...userData } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },
  register: async (userData: any) => {
    try {
      // Split the name into first_name and last_name
      const [first_name, ...lastNameParts] = userData.name.split(' ');
      const last_name = lastNameParts.join(' ') || ''; // Ensure last_name is never null

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password length
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await api.post('/auth/register', {
        email: userData.email.trim(),
        password: userData.password,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        company_name: userData.companyName.trim(),
        company_logo: null,
        phone: null,
        website: null,
        industry: null,
        company_size: null,
        is_profile_complete: userData.is_profile_complete || false
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      return response.data;
    } catch (error) {
      // Log the error details for debugging
      console.error('Registration error details:', error.response?.data);
      
      // If the error is from the API, throw it with the original message
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // For other errors, throw a generic message
      throw new Error('Failed to create account. Please try again.');
    }
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/';  // Redirect to landing page instead of login
    }
  },
};

export const userAPI = {
  updateProfile: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

export const jobAPI = {
  getAll: () => api.get("/jobs"),
  create: (data: any) => api.post("/jobs", data),
  getById: (id: string) => api.get(`/jobs/${id}`),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  delete: async (id: number) => {
    const response = await api.delete(`/jobs/${id}`);
    return response;
  },
  getStats: (id: number) => api.get(`/jobs/${id}/stats`),
  createCandidate: (data: any) => api.post("/candidates", data),
  createInterview: async (data: { job_id: number; candidate_id: number; scheduled_at: string | null }) => {
    const response = await api.post("/interviews", data);
    return response;
  },
  generateDescription: async (title: string, department: string, location: string) => {
    const response = await api.post('/jobs/generate-description', {
      title,
      department,
      location
    });
    return response.data;
  },
  generateRequirements: async (title: string, department: string, location: string, keywords: string = "") => {
    const response = await api.post('/jobs/generate-requirements', {
      title,
      department,
      location,
      keywords
    });
    return response.data;
  },
  generateBenefits: async (title: string, department: string, location: string, keywords: string = "") => {
    const response = await api.post('/jobs/generate-benefits', {
      title,
      department,
      location,
      keywords
    });
    return response.data;
  }
};

export const interviewAPI = {
  create: async (data: any) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },
  getByAccessCode: (accessCode: string) => api.get(`/interviews/by-access-code/${accessCode}`),
};

export const videoAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Interview API
export const interviewApi = {
  // Submit video response
  submitVideoResponse: async (interviewId: number, videoBlob: Blob) => {
    const formData = new FormData();
    formData.append('video', videoBlob);
    
    const response = await api.post(`/videos/${interviewId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Transcribe response
  transcribeResponse: async (questionId: number) => {
    const response = await api.post(`/videos/${questionId}/transcribe`);
    return response.data;
  },

  // Analyze response
  analyzeResponse: async (questionId: number) => {
    const response = await api.post(`/videos/${questionId}/analyze`);
    return response.data;
  },

  // Get interview transcript
  getTranscript: async (interviewId: number) => {
    const response = await api.get(`/videos/${interviewId}/transcript`);
    return response.data;
  },

  // Generate follow-up questions
  generateFollowUpQuestions: async (interviewId: number) => {
    const response = await api.post(`/videos/${interviewId}/follow-up`);
    return response.data;
  },
};

// Resume API
export const resumeApi = {
  // Upload resume
  uploadResume: async (file: File, jobId: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_id', jobId.toString());
      
      console.log('Uploading resume:', file.name);
      const response = await api.post('/candidates/resume-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Resume upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resume upload failed:', error);
      throw error;
    }
  },

  // Analyze resume
  analyzeResume: async (resumePath: string, jobId: number) => {
    try {
      console.log('Analyzing resume:', resumePath);
      const response = await api.post('/candidates/resume/analyze', {
        resume_url: resumePath,
        job_id: jobId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Resume analysis successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resume analysis failed:', error);
      throw error;
    }
  },
};

// Interview Questions API
export const questionsApi = {
  // Get interview questions
  getQuestions: async (interviewId: number) => {
    const response = await api.get(`/interviews/${interviewId}/questions`);
    return response.data;
  },

  // Generate questions
  generateQuestions: async (jobId: number, resumeText: string) => {
    const response = await api.post('/interviews/questions/generate', {
      job_id: jobId,
      resume_text: resumeText,
    });
    return response.data;
  },
};

// Public Interview API
export const publicInterviewApi = {
  createLink: (jobId: number, data: { name: string; expiration?: number; is_active: boolean }) =>
    api.post(`/interviews/public/${jobId}`, data),
  getLinks: (jobId: number) =>
    api.get(`/interviews/public/${jobId}`),
  deleteLink: (jobId: number, linkId: string) =>
    api.delete(`/interviews/public/${jobId}/${linkId}`),
  toggleLinkStatus: (jobId: number, linkId: string, isActive: boolean) =>
    api.patch(`/interviews/public/${jobId}/${linkId}`, { is_active: isActive }),
  getByAccessCode: (accessCode: string) =>
    api.get(`/interviews/public/access/${accessCode}`),
  getJobDetails: (jobId: number) =>
    api.get(`/jobs/${jobId}`)
};

export default api; 