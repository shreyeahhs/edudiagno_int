
"""Add company_logo to users table

Revision ID: 89f94e45a7a2
Revises: a1b2c3d4e5f6
Create Date: 2025-03-31 17:57:03.939246+00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '89f94e45a7a2'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('interview_responses')
    op.add_column('candidates', sa.Column('job_id', sa.Integer(), nullable=True))
    op.add_column('candidates', sa.Column('resume_text', sa.Text(), nullable=True))
    op.add_column('candidates', sa.Column('resume_match_score', sa.Float(), nullable=True))
    op.add_column('candidates', sa.Column('resume_match_feedback', sa.Text(), nullable=True))
    op.alter_column('candidates', 'company_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('candidates', 'resume_url',
               existing_type=sa.TEXT(),
               type_=sa.String(),
               existing_nullable=True)
    op.create_index(op.f('ix_candidates_id'), 'candidates', ['id'], unique=False)
    op.create_foreign_key(None, 'candidates', 'jobs', ['job_id'], ['id'])
    op.add_column('interview_questions', sa.Column('question_type', sa.String(), nullable=False))
    op.alter_column('interview_questions', 'interview_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('interview_questions', 'order_number',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.create_index(op.f('ix_interview_questions_id'), 'interview_questions', ['id'], unique=False)
    op.drop_column('interview_questions', 'time_allocation')
    op.alter_column('interview_settings', 'job_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_constraint('interview_settings_job_id_key', 'interview_settings', type_='unique')
    op.add_column('interviews', sa.Column('access_code', sa.String(), nullable=False))
    op.add_column('interviews', sa.Column('overall_score', sa.Float(), nullable=True))
    op.alter_column('interviews', 'job_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.alter_column('interviews', 'candidate_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.create_index(op.f('ix_interviews_access_code'), 'interviews', ['access_code'], unique=True)
    op.create_index(op.f('ix_interviews_id'), 'interviews', ['id'], unique=False)
    op.drop_column('interviews', 'score')
    op.add_column('jobs', sa.Column('type', sa.String(), nullable=True))
    op.add_column('jobs', sa.Column('experience', sa.String(), nullable=True))
    op.add_column('jobs', sa.Column('salary_min', sa.Integer(), nullable=True))
    op.add_column('jobs', sa.Column('salary_max', sa.Integer(), nullable=True))
    op.add_column('jobs', sa.Column('show_salary', sa.Boolean(), nullable=True))
    op.add_column('jobs', sa.Column('requirements', sa.Text(), nullable=True))
    op.add_column('jobs', sa.Column('benefits', sa.Text(), nullable=True))
    op.alter_column('jobs', 'company_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
    op.add_column('users', sa.Column('company_logo', sa.String(), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))
    op.add_column('users', sa.Column('website', sa.String(), nullable=True))
    op.add_column('users', sa.Column('industry', sa.String(), nullable=True))
    op.add_column('users', sa.Column('company_size', sa.String(), nullable=True))
    op.drop_constraint('users_email_key', 'users', type_='unique')
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.create_unique_constraint('users_email_key', 'users', ['email'])
    op.drop_column('users', 'company_size')
    op.drop_column('users', 'industry')
    op.drop_column('users', 'website')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'company_logo')
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.alter_column('jobs', 'company_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_column('jobs', 'benefits')
    op.drop_column('jobs', 'requirements')
    op.drop_column('jobs', 'show_salary')
    op.drop_column('jobs', 'salary_max')
    op.drop_column('jobs', 'salary_min')
    op.drop_column('jobs', 'experience')
    op.drop_column('jobs', 'type')
    op.add_column('interviews', sa.Column('score', sa.INTEGER(), autoincrement=False, nullable=True))
    op.drop_index(op.f('ix_interviews_id'), table_name='interviews')
    op.drop_index(op.f('ix_interviews_access_code'), table_name='interviews')
    op.alter_column('interviews', 'candidate_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('interviews', 'job_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_column('interviews', 'overall_score')
    op.drop_column('interviews', 'access_code')
    op.create_unique_constraint('interview_settings_job_id_key', 'interview_settings', ['job_id'])
    op.alter_column('interview_settings', 'job_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.add_column('interview_questions', sa.Column('time_allocation', sa.INTEGER(), server_default=sa.text('180'), autoincrement=False, nullable=True))
    op.drop_index(op.f('ix_interview_questions_id'), table_name='interview_questions')
    op.alter_column('interview_questions', 'order_number',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.alter_column('interview_questions', 'interview_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_column('interview_questions', 'question_type')
    op.drop_constraint(None, 'candidates', type_='foreignkey')
    op.drop_index(op.f('ix_candidates_id'), table_name='candidates')
    op.alter_column('candidates', 'resume_url',
               existing_type=sa.String(),
               type_=sa.TEXT(),
               existing_nullable=True)
    op.alter_column('candidates', 'company_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_column('candidates', 'resume_match_feedback')
    op.drop_column('candidates', 'resume_match_score')
    op.drop_column('candidates', 'resume_text')
    op.drop_column('candidates', 'job_id')
    op.create_table('interview_responses',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('question_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('video_url', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('transcript', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('score', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('ai_feedback', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['question_id'], ['interview_questions.id'], name='interview_responses_question_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='interview_responses_pkey')
    )
    # ### end Alembic commands ###
