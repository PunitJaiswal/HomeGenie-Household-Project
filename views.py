from flask import render_template_string, render_template, request, Flask, jsonify
from flask_security import auth_required, current_user, roles_required, roles_accepted, login_required
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password, verify_password
from datetime import datetime
import os
from models import *
from werkzeug.utils import secure_filename

def create_view(app: Flask, user_datastore : SQLAlchemySessionUserDatastore, db):
    
    # Homepage
    @app.route('/')
    def home():
        return render_template('index.html')
    
    # User Login
    @app.route('/user-login', methods=['POST'])
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'status' : 'error', 'message' : 'Invalid Input'})
        
        user = user_datastore.find_user(email=email)

        if not user:
            return jsonify({'status' : 'error', 'message':'Invalid User'})
        if not user.active:
            return jsonify({'status' : 'error', 'message':'Account not activated'})
        if verify_password(password, user.password):
            return jsonify({'token' : user.get_auth_token(), 'role' : user.roles[0].name, 'id':user.id, 'email':user.email}), 200
        else:
            return jsonify({'status' : 'error', 'message':'wrong password'})
    
    # User Signup
    @app.route('/signup', methods=['POST'])
    def signup():
        # Process form-data for file and text fields
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        username = request.form.get('username')
        role = request.form.get('role')
        location = request.form.get('location')
        pincode = request.form.get('pincode')
        contact = request.form.get('contact')
        description_file = request.files.get('description')  # Get file from request
        service_id = request.form.get('service_id')
        experience = request.form.get('experience')
        description_path = None
        if description_file:
            # Save the file securely
            filename = secure_filename(description_file.filename)
            upload_folder = './static/upload_folder'
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)
            description_path = os.path.join(upload_folder, filename)
            description_file.save(description_path)

        if not email or not password or not username or not name or role not in ['professional', 'customer']:
            return jsonify({"status": "error", "message": "Invalid Input"}), 403
        if user_datastore.find_user(email=email):
            return jsonify({"status": "error", "message": "User already exists"}), 400

        if role == 'professional':
            user_datastore.create_user(
                email=email,
                password=hash_password(password),
                roles=['professional'],
                active=False,
                username=username,
                name=name,
                description=description_path,
                service_id=service_id,
                experience=experience,
                location=location,
                pincode=pincode,
                contact=contact
            )
        elif role == 'customer':
            user_datastore.create_user(
                email=email,
                password=hash_password(password),
                roles=['customer'],
                active=True,
                username=username,
                name=name,
                location=location,
                pincode=pincode,
                contact=contact
            )
        db.session.commit()
        return jsonify({'status': 'success', "message": "User successfully created"}), 201
    

    @app.route('/updateUser/<id>', methods=['PUT'])
    @login_required
    @roles_accepted('professional', 'customer')
    def updateUser(id):
        user = user_datastore.find_user(id=id)
        if not user:
            return jsonify({'status': 'error', 'message': 'User not present'}), 400

        user.username = request.form.get('username') or user.username
        user.name = request.form.get('name') or user.name
        user.location = request.form.get('location') or user.location
        user.pincode = request.form.get('pincode') or user.pincode
        user.contact = request.form.get('contact') or user.contact
        user.date_crated = datetime.utcnow()

        # Debug log
        print(f"User roles: {[role.name for role in user.roles]}")

        if any(role.name == 'professional' for role in user.roles):
            user.service_id = request.form.get('service_id') or user.service_id
            user.experience = request.form.get('experience') or user.experience
            print('Updating professional user')
            description_file = request.files.get('description')
            print(description_file)
            if description_file:
                filename = secure_filename(description_file.filename)
                upload_folder = './static/upload_folder'
                os.makedirs(upload_folder, exist_ok=True)
                description_path = os.path.join(upload_folder, filename)
                # Save file
                print(f"Saving file to: {description_path}")
                description_file.save(description_path)

                # Update description field
                user.description = description_path
                print(f"Updated user description: {user.description}")

        # Commit to database
        try:
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'User updated'}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Database commit failed: {e}")
            return jsonify({'status': 'error', 'message': 'Database error'}), 500



    # Activate professional/Customer
    @app.route('/activate-user/<id>', methods=['GET'])
    @login_required
    @roles_accepted('admin')
    def activate_user(id):
        user = user_datastore.find_user(id=id)
        if not user:
            return jsonify({'statuts' : 'error','message' : 'user not present'}), 400
        
        # Check if inst already activated
        if user.active==True:
            return jsonify({'status': 'success','message' : 'user already active'}), 400
        user.active = True
        db.session.commit()
        return jsonify({'status': 'success','message' : 'user is activated'}), 200
    
    # Flag professional/Customer
    @app.route('/flag-user/<id>', methods=['GET'])
    @roles_accepted('admin')
    def flag_user(id):
        user = user_datastore.find_user(id=id)
        if not user:
            return jsonify({'status': 'error','message' : 'user not present'}), 400
        
        # Check if inst already activated
        if user.active==False:
            return jsonify({'status': 'success','message' : 'user already flagged'}), 400
        user.active = False
        db.session.commit()
        return jsonify({'status' : 'success','message' : 'user is flagged'}), 200
    
    


    # Endpoint to get all professionals
    @app.route('/all-prof-list')
    @login_required
    @roles_accepted('admin')
    def all_prof_list():
        all_users = user_datastore.user_model().query.all()
        all_users = [user for user in all_users if any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active}
                   for user in all_users]
        return jsonify(results), 200
    
    @app.route('/active-prof-list')
    @login_required
    @roles_accepted('customer')
    def active_prof_list():
        all_users = user_datastore.user_model().query.filter(user_datastore.user_model.active).all()
        all_users = [user for user in all_users if any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name,'email':user.email, 'service_type':Service.query.get(user.service_id).name, 'active':user.active}
                   for user in all_users]
        return jsonify(results), 200
    
    # Endpoint to get all customers
    @app.route('/all-cust-list')
    @login_required
    @roles_accepted('admin')
    def all_cust_list():
        all_users = user_datastore.user_model().query.all()
        all_custs = [user for user in all_users if any(role.name=='customer' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active}
                   for user in all_custs]
        return jsonify(results), 200
    
    @app.route('/viewUser/<id>', methods=['GET'])
    @login_required
    @roles_accepted('admin', 'professional', 'customer')
    def viewUser(id):
        user = user_datastore.find_user(id=id)
        return jsonify({
        'id': user.id,
        'name': user.name if user.name else "Not provided",
        'username': user.username if user.username else "Not provided",
        'email': user.email,
        'active': user.active,
        'location': user.location if user.location else "Not provided",
        'pincode': user.pincode if user.pincode else "Not provided",
        'contact': user.contact if user.contact else "Not provided",
        'description': user.description if user.description else "Not provided",
        'service_id': user.service_id if user.service_id else "Not provided",
        'service_type': Service.query.get(user.service_id).name if user.service_id else "Not provided",
        'experience': user.experience if user.experience else "Not provided",
        'roles': user.roles[0].name if user.roles else "No roles assigned",
        'date_crated':user.date_created})
    

    @app.route('/viewServiceProf/<id>', methods=['GET'])
    @login_required
    @roles_accepted('customer')
    def viewServiceProf(id):
        allUsers = user_datastore.user_model.query.filter(user_datastore.user_model.service_id == id).all()
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active, 'location':user.location, 'pincode':user.pincode, 'contact':user.contact, 'description':user.description, 'rating':user.rating, 'service_id':user.service_id, 'experience':user.experience}
                   for user in allUsers]
        return jsonify(results), 200