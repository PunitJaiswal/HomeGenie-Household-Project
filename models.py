from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from flask_security.models import fsqla_v3 as fsq

db = SQLAlchemy()

fsq.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    username = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    name = db.Column(db.String)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String)
    service_type = db.Column(db.String)
    Experience = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String, nullable=False)
    # Relationship
    roles = db.relationship('Role', secondary = 'user_roles')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    description = db.Column(db.String)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))





#     ID
# Name
# Date created
# Description
# service_type
# Experience
# etc.