
"""add_profile_progress

Revision ID: 96631c8c4c3d
Revises: c0aa788184de
Create Date: 2025-04-02 18:53:14.882377+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '96631c8c4c3d'
down_revision = 'c0aa788184de'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('profile_progress', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'profile_progress')
    # ### end Alembic commands ###
