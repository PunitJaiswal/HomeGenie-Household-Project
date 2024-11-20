from flask import render_template_string, render_template, request, Flask, jsonify
from flask_security import auth_required, current_user, roles_required, roles_accepted
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password, verify_password
from datetime import datetime

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
        data = request.get_json()

        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        username = data.get('username')
        role = data.get('role')
        location = data.get('location')
        pincode = data.get('pincode')
        contact = data.get('contact')
        if role=="professional":
            description = data.get('description')
            service_id = data.get('service_id')
            experience = data.get('experience')

        if not email or not password or not username or not name or role not in ['professional', 'customer']:
            return jsonify({"status" : 'error' ,'message' : 'Invalid Input'}), 403
        
        if user_datastore.find_user(email=email):
            return jsonify({"status" : 'error' ,'message' : 'user already exists'}), 400
        
        if role == 'professional':
            user_datastore.create_user(email=email, 
                                       password=hash_password(password), 
                                       roles=['professional'],
                                       active=False, 
                                       username=username, 
                                       name=name,
                                       description=description,
                                       service_id=service_id,
                                       experience=experience,
                                       location=location,
                                       pincode=pincode,
                                       contact=contact)
            db.session.commit()
            return jsonify({'status' : 'success', 'message' : 'Professional account successfully created'}), 201
        elif role == 'customer':
            user_datastore.create_user(email=email, 
                                       password=hash_password(password), 
                                       roles=['customer'], 
                                       active=True, 
                                       username=username, 
                                       name=name,
                                       location=location,
                                       pincode=pincode,
                                       contact=contact)
            db.session.commit()
            return jsonify({'status' : 'success', "message" : 'Customer account successfully created'}), 201
        
        return jsonify({'status': 'error', 'message' : 'invalid role'}), 400
    

    @app.route('/updateUser/<id>', methods=['PUT'])
    @roles_accepted('professional', 'customer')
    def updateUser(id):
        user = user_datastore.find_user(id=id)
        if not user:
            return jsonify({'status' : 'error', 'message' : 'user not present'}), 400

        data = request.get_json()
        print(data)
        user.username = data.get('username')
        user.name = data.get('name')
        user.location = data.get('location')
        user.pincode = data.get('pincode')
        user.contact = data.get('contact')
        user.date_crated = datetime.utcnow
        if user.roles[0].name == 'professional':
            user.description = data.get('description')
            user.service_id = data.get('service_id')
            user.experience = data.get('experience')
        db.session.commit()
        return jsonify({'status' : 'success', 'message' : 'user updated'}), 200



    

    
    # Activate professional/Customer
    @app.route('/activate-user/<id>', methods=['GET'])
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
    
    # Endpoint to get inactive professionals
    @app.route('/inactive-prof-list')
    @roles_accepted('admin')
    def inactive_prof_list():
        all_users = user_datastore.user_model().query.all()
        # Filter user to get only inactive professionals
        inactive_profs = [user for user in all_users if not user.active and any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email}
                   for user in inactive_profs]
        return jsonify(results), 200
    
    # Endpoint to get all professionals
    @app.route('/all-prof-list')
    @roles_accepted('admin')
    def all_prof_list():
        all_users = user_datastore.user_model().query.all()
        all_users = [user for user in all_users if any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active}
                   for user in all_users]
        return jsonify(results), 200
    
    # Endpoint to get all customers
    @app.route('/all-cust-list')
    @roles_accepted('admin')
    def all_cust_list():
        all_users = user_datastore.user_model().query.all()
        all_custs = [user for user in all_users if any(role.name=='customer' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active}
                   for user in all_custs]
        return jsonify(results), 200
    
    @app.route('/viewUser/<id>', methods=['GET'])
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
        'experience': user.experience if user.experience else "Not provided",
        'roles': user.roles[0].name if user.roles else "No roles assigned",
        'date_crated':user.date_created})
    

    @app.route('/viewServiceProf/<id>', methods=['GET'])
    @roles_accepted('customer')
    def viewServiceProf(id):
        allUsers = user_datastore.user_model.query.filter(user_datastore.user_model.service_id == id).all()
        results = [{'id':user.id, 'name':user.name, 'email':user.email, 'active':user.active, 'location':user.location, 'pincode':user.pincode, 'contact':user.contact, 'description':user.description, 'rating':user.rating, 'service_id':user.service_id, 'experience':user.experience}
                   for user in allUsers]
        return jsonify(results), 200