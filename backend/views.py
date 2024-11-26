import os
from flask import render_template, request, Flask, jsonify, send_file
from flask_security import roles_accepted, login_required, auth_required
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password, verify_password
from datetime import datetime
from backend.models import *
from backend.graphs import *
from werkzeug.utils import secure_filename
from backend.celery.tasks import create_csv
from celery.result import AsyncResult

def create_view(app: Flask, user_datastore : SQLAlchemySessionUserDatastore, db, cache):

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
            return jsonify({'status' : 'warning', 'message' : 'Invalid Input'})
        
        user = user_datastore.find_user(email=email)

        if not user:
            return jsonify({'status' : 'warning', 'message':'Invalid User'})
        if not user.active:
            return jsonify({'status' : 'warning', 'message':'Account not activated, Wait for Admin Approval'})
        if verify_password(password, user.password):
            return jsonify({'token' : user.get_auth_token(), 'role' : user.roles[0].name, 'id':user.id, 'email':user.email}), 200
        else:
            return jsonify({'status' : 'warning', 'message':'wrong password'})
    
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

        if not email or not password or not username or not name or role not in ['professional', 'customer']:
            return jsonify({"status": "warning", "message": "Invalid Input"}), 403
        if user_datastore.find_user(email=email):
            return jsonify({"status": "error", "message": "User already exists"}), 400

        if len(name) < 3:
            return jsonify({"status": "warning", "message": "Name must be greater than 3 characters"}), 400
        if len(password) < 4:
            return jsonify({"status": "warning", "message": "Password must be greater than 4 characters"}), 400
        if len(location) < 3:
            return jsonify({"status": "warning", "message": "Location must be greater than 3 characters"}), 400
        if len(pincode) != 6:
            return jsonify({"status": "warning", "message": "Pincode must be 6 digits"}), 400
        if len(contact) != 10:
            return jsonify({"status": "warning", "message": "Contact must be 10 digits"}), 400
        if description_file:
            # Save the file securely
            filename = secure_filename(description_file.filename)
            upload_folder = './static/upload_folder'
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)
            description_path = os.path.join(upload_folder, filename)
            description_file.save(description_path)
        else:
            return jsonify({"status": "warning", "message": "Please attach description file"}), 400


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
    @login_required
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
    @cache.cached(timeout=5)
    def all_prof_list():
        all_users = user_datastore.user_model().query.all()
        all_users = [user for user in all_users if any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active, 'location':user.location, 'pincode':user.pincode, 'contact':user.contact, 'description':user.description, 'rating':user.rating, 'service_id':user.service_id, 'experience':user.experience, 'service_type':Service.query.get(user.service_id).name}
                   for user in all_users]
        return jsonify(results), 200
    
    @app.route('/active-prof-list')
    @login_required
    @roles_accepted('customer')
    @cache.cached(timeout=5)
    def active_prof_list():
        all_users = user_datastore.user_model().query.filter(user_datastore.user_model.active).all()
        all_users = [user for user in all_users if any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'service_id':user.service_id, 'service_type':Service.query.get(user.service_id).name, 'location':user.location, "pincode":user.pincode, 'active':user.active}
                   for user in all_users]
        return jsonify(results), 200
    
    # Endpoint to get all customers
    @app.route('/all-cust-list')
    @login_required
    @roles_accepted('admin')
    @cache.cached(timeout=5)
    def all_cust_list():
        all_users = user_datastore.user_model().query.all()
        all_custs = [user for user in all_users if any(role.name=='customer' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active, 'location':user.location, 'pincode':user.pincode, 'contact':user.contact, 'description':user.description, 'service_id':user.service_id, 'rating':user.rating}
                   for user in all_custs]
        return jsonify(results), 200
    
    @app.route('/viewUser/<id>', methods=['GET'])
    @login_required
    @roles_accepted('admin', 'professional', 'customer')
    @cache.memoize(timeout=5)
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
        'rating': user.rating if user.rating else "Not provided",
        'service_type': Service.query.get(user.service_id).name if user.service_id else "Not provided",
        'experience': user.experience if user.experience else "Not provided",
        'roles': user.roles[0].name if user.roles else "No roles assigned",
        'date_crated':user.date_created})
    

    @app.route('/viewServiceProf/<id>', methods=['GET'])
    @login_required
    @roles_accepted('customer')
    @cache.memoize(timeout=5)
    def viewServiceProf(id):
        allUsers = user_datastore.user_model.query.filter(user_datastore.user_model.service_id == id).all()
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active, 'location':user.location, 'pincode':user.pincode, 'contact':user.contact, 'description':user.description, 'rating':user.rating, 'service_id':user.service_id, 'experience':user.experience}
                   for user in allUsers]
        return jsonify(results), 200
    
    @app.route('/searchProf', methods=['POST'])
    @login_required
    @roles_accepted('customer', 'admin')
    def searchProf():
        # Get JSON data from the request body
        data = request.get_json()
        name = data.get('name')
        location = data.get('location')
        pincode = data.get('pincode')
        
        # Build the query dynamically
        query = user_datastore.user_model.query
        if name:
            query = query.filter(user_datastore.user_model.name.ilike(f"%{name}%"))  # Case-insensitive match
        if location:
            query = query.filter(user_datastore.user_model.location.ilike(f"%{location}%"))
        if pincode:
            query = query.filter(user_datastore.user_model.pincode.like(f"%{pincode}%"))

        # Filter for professionals only
        matching_users = query.all()
        professionals = [
            user for user in matching_users if any(role.name == 'professional' for role in user.roles)
        ]

        # Handle no results
        if not professionals:
            return jsonify({'status': 'success', 'message': 'No professionals found matching the criteria'}), 404

        # Serialize the results
        results = [
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'location': user.location,
                'pincode': user.pincode,
                'contact': user.contact,
                'description': user.description,
                'rating': user.rating,
                'experience': user.experience,
                'service_type': Service.query.get(user.service_id).name if user.service_id else "Not provided",
                'active': user.active,
            }
            for user in professionals
        ]

        return jsonify({'status': 'success', 'results': results}), 200


    @app.route('/searchUser', methods=['POST'])
    @login_required
    @roles_accepted('admin')
    def searchuser():
        data = request.get_json()    
        name = data.get('name')
        location = data.get('location')
        pincode = data.get('pincode')
        query = user_datastore.user_model.query 
        if name:
            query = query.filter(user_datastore.user_model.name.ilike(f"%{name}%"))  # Case-insensitive match
        if location:
            query = query.filter(user_datastore.user_model.location.ilike(f"%{location}%"))
        if pincode:
            query = query.filter(user_datastore.user_model.pincode.like(f"%{pincode}%"))
        matching_users = query.all()

        professionals = [user for user in matching_users if any(role.name == 'professional' for role in user.roles)]
        customers = [user for user in matching_users if any(role.name == 'customer' for role in user.roles)]

        # Serialize the results
        professional_results = [
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'location': user.location,
                'pincode': user.pincode,
                'contact': user.contact,
                'description': user.description,
                'rating': user.rating,
                'experience': user.experience,
                'service_type': Service.query.get(user.service_id).name if user.service_id else "Not provided",
                'active': user.active,
            }
            for user in professionals
        ]

        customer_results = [
            {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'location': user.location,
                'pincode': user.pincode,
                'contact': user.contact,
                'description': user.description,
                'active': user.active,
            }
            for user in customers
        ]

        # Return both professional and customer lists
        return jsonify({
            'status': 'success',
            'professionals': professional_results,
            'customers': customer_results
        }), 200
    
    @app.route('/customer/viewProf/<id>', methods=['GET'])
    @login_required
    @roles_accepted('customer')
    @cache.memoize(timeout=5)
    def viewProf(id):
        user = user_datastore.find_user(id=id)
        return jsonify({
            'id': user.id,
            'name': user.name if user.name else "Not provided",
            'email': user.email,
            'date_created': user.date_created,
            'location': user.location if user.location else "Not provided",
            'pincode': user.pincode if user.pincode else "Not provided",
            'contact': user.contact if user.contact else "Not provided",
            'description': user.description if user.description else "Not provided",
            'rating': user.rating if user.rating else "Not provided",
            'experience': user.experience if user.experience else "Not provided",
            'service_type': Service.query.get(user.service_id).name if user.service_id else "Not provided",
            'active': user.active,
        }), 200
    
    @app.route('/count_entities', methods=['GET'])
    @auth_required('token')
    @login_required
    @roles_accepted('admin')
    def count_entities():
        count = []

        count.append(Service.query.count())
        professional_role = Role.query.filter_by(name='professional').first()
        if professional_role:
            count.append(professional_role.User.count())
        customer_role = Role.query.filter_by(name='customer').first()
        if customer_role:
            count.append(customer_role.User.count())
        count.append(ServiceRequest.query.count())

        return jsonify(count)



    # Endpoint for graphs
    @app.route('/admin/graph', methods=['GET'])
    @login_required
    @roles_accepted('admin')
    @auth_required('token')
    def admin_graph():
        category_count()
        professional_count_by_service()
        request_count_by_service()
        active_professional()
        active_customer()
        return jsonify({'status': 'success'}), 200
    
    @app.route('/customer/graph/<id>', methods=['GET'])
    @login_required
    @roles_accepted('customer')
    @auth_required('token')
    def customer_graph(id):
        professional_count_by_service()
        request_count_by_customer(id)
        return jsonify({'status': 'success'}), 200

    @app.route('/professional/graph/<id>', methods=['GET'])
    @login_required
    @roles_accepted('professional')
    @auth_required('token')
    def professional_graph(id):
        request_count_by_professional(id)
        rating_for_professional(id)
        return jsonify({'status': 'success'}), 200




    # celery requests
    @app.get('/create-service-request')
    def createCSV():
        task = create_csv.delay()
        return {'task_id' : task.id}, 200
    
    @app.get('/get-service-request/<task_id>')
    def getCSV(task_id):
        result = AsyncResult(task_id)
        if result.ready():
            return send_file(f'./backend/celery/user-downloads/{result.result}')
        else:
            return {'message' : 'Task not ready'}
