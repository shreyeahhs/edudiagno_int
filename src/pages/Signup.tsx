import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength indicators
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length;
  
  const getPasswordStrengthLabel = () => {
    if (passwordStrengthScore === 0) return "";
    if (passwordStrengthScore <= 2) return "Weak";
    if (passwordStrengthScore <= 4) return "Medium";
    return "Strong";
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrengthScore === 0) return "bg-muted";
    if (passwordStrengthScore <= 2) return "bg-destructive";
    if (passwordStrengthScore <= 4) return "bg-yellow-500";
    return "bg-success";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !companyName.trim() || !password.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordStrengthScore < 3) {
      toast.error("Please use a stronger password");
      return;
    }

    if (!agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(email, password, name, companyName);
      toast.success("Account created successfully");
      navigate("/dashboard/profile", { state: { isNewUser: true } });
    } catch (error) {
      toast.error("Failed to create account");
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full mx-auto glass-card rounded-xl p-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center text-white font-bold">
              EM
            </div>
            <span className="font-bold text-xl">EduDiagno</span>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">
            Start hiring smarter with AI-powered interviews
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Acme Inc"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        getPasswordStrengthColor()
                      )}
                      style={{
                        width: `${(passwordStrengthScore / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li className={passwordStrength.hasMinLength ? "text-success" : ""}>
                    ✓ At least 8 characters
                  </li>
                  <li className={passwordStrength.hasUppercase ? "text-success" : ""}>
                    ✓ At least one uppercase letter
                  </li>
                  <li className={passwordStrength.hasLowercase ? "text-success" : ""}>
                    ✓ At least one lowercase letter
                  </li>
                  <li className={passwordStrength.hasNumber ? "text-success" : ""}>
                    ✓ At least one number
                  </li>
                  <li className={passwordStrength.hasSpecialChar ? "text-success" : ""}>
                    ✓ At least one special character
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive mt-1">Passwords don't match</p>
            )}
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => 
                setAgreedToTerms(checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-brand hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                Create account <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
