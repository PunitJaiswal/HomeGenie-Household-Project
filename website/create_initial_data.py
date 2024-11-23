from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from website.models import db

def create_data(user_datastore):
    print("---------------Creating Data-------------------")

    # Create Roles
    user_datastore.find_or_create_role(name='admin', description='Administrator')
    user_datastore.find_or_create_role(name='professional', description='Service Professional')
    user_datastore.find_or_create_role(name='customer', description='Customer')

    # Create User data
    if not user_datastore.find_user(email='admin@iitm.ac.in'):
        user_datastore.create_user(email='admin@iitm.ac.in', password=hash_password('pass'), roles=['admin'], username='admin', active=True)
    
    # if not user_datastore.find_user(email='professional@iitm.ac.in'):
    #     user_datastore.create_user(email='professional@iitm.ac.in', password=hash_password('pass'),username='professional1', roles=['professional'], active=True)
    
    # if not user_datastore.find_user(email='customer@iitm.ac.in'):
    #     user_datastore.create_user(email='customer@iitm.ac.in', password=hash_password('pass'), username='customer1', roles=['customer'], active=True)
    

    db.session.commit()