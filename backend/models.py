from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from flask_security.models import fsqla_v3 as fsq

db = SQLAlchemy()

fsq.FsModels.set_db_info(db)

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    base_price = db.Column(db.Integer, nullable=False)
    time_required = db.Column(db.Integer)

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))


class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Match the case of the table name
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))



class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    username = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    name = db.Column(db.String)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String)
    experience = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=False)
    fs_uniquifier = db.Column(db.String, nullable=False)
    location = db.Column(db.String)
    pincode = db.Column(db.String)
    contact = db.Column(db.String)
    rating = db.Column(db.Integer)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'))
    # Relationship
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('User', lazy='dynamic'))



class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    remarks = db.Column(db.String, nullable=False)
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime)
    status = db.Column(db.String, default='Pending', nullable=False)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review = db.Column(db.String, nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'), nullable=False)