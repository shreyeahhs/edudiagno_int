
"""add_user_profile_fields

Revision ID: c0aa788184de
Revises: 7fd939f8502f
Create Date: 2025-04-02 18:46:56.409493+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c0aa788184de'
down_revision = '7fd939f8502f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('title', sa.String(), nullable=True))
    op.add_column('users', sa.Column('timezone', sa.String(), nullable=True))
    op.add_column('users', sa.Column('language', sa.String(), nullable=True))
    op.add_column('users', sa.Column('address', sa.String(), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(), nullable=True))
    op.add_column('users', sa.Column('zip', sa.String(), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_profile_complete', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('notification_settings', sa.JSON(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'notification_settings')
    op.drop_column('users', 'is_profile_complete')
    op.drop_column('users', 'country')
    op.drop_column('users', 'zip')
    op.drop_column('users', 'state')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address')
    op.drop_column('users', 'language')
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'title')
    # ### end Alembic commands ###
