from flask import render_template_string, render_template, request, Flask, jsonify
from flask_security import auth_required, current_user, roles_required, roles_accepted
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password, verify_password


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
            return jsonify({'message' : 'Invalid Input'})
        
        user = user_datastore.find_user(email=email)

        if not user:
            return jsonify({'message':'Invalid User'})
        if verify_password(password, user.password):
            return jsonify({'token' : user.get_auth_token(), 'role' : user.roles[0].name, 'id':user.id, 'email':user.email}), 200
        else:
            return jsonify({'message':'wrong password'})
    
    # User Signup
    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.get_json()

        email = data.get('email')
        name = data.get('name')
        password = data.get('password')
        username = data.get('username')
        role = data.get('role')

        if not email or not password or not username or not name or role not in ['professional', 'customer']:
            return jsonify({'message' : 'Invalid Input'}), 403
        
        if user_datastore.find_user(email=email):
            return jsonify({'message' : 'user already exists'}), 400
        
        if role == 'professional':
            user_datastore.create_user(email=email, 
                                       password=hash_password(password), 
                                       roles=['professional'],
                                       active=False, 
                                       username=username, 
                                       name=name)
            db.session.commit()
            return jsonify({'message' : 'Professional account successfully created'}), 201
        elif role == 'customer':
            user_datastore.create_user(email=email, 
                                       password=hash_password(password), 
                                       roles=['customer'], 
                                       active=True, 
                                       username=username, 
                                       name=name)
            db.session.commit()
            return jsonify({"message" : 'Customer account successfully created'}), 201
        
        return jsonify({'message' : 'invalid role'}), 400


    # Profile
    @app.route('/profile')
    @auth_required('token')
    def profile():
        return render_template_string(
            """
            <h1> {{current_user.email}} </h1>
            <div>
                    <a href='/'> Home </a>
                    <a href='/logout'> Logout </a>
                </div>
            """
        )
    
    # Professional Dashboard
    @app.route('/professional_dashboard')
    @roles_required('professional')
    def professional_dashboard():
        return render_template_string(
            """
                <h1> Instructor Dashboard </h1>
                <h2> Welcome {{current_user.email}} </h2>
                <div><a href='/logout'> Logout </a></div>
            """
        )
    
    # Activate professional
    @app.route('/activate-prof/<id>', methods=['GET'])
    @roles_accepted('admin')
    def activate_prof(id):
        user = user_datastore.find_user(id=id)
        if not user:
            return jsonify({'message' : 'user not present'}), 400
        
        # Check if inst already activated
        if user.active==True:
            return jsonify({'message' : 'user already active'}), 400
        user.active = True
        db.session.commit()
        return jsonify({'message' : 'user is activated'}), 200
    
    # Endpoint to get inactive professionals
    @app.route('/inactive-prof-list')
    @roles_accepted('admin')
    def inactive_prof_list():
        all_users = user_datastore.user_model().query.all()
        # Filter user to get only inactive professionals
        inactive_profs = [user for user in all_users if not user.active and any(role.name=='professional' for role in user.roles)]
        results = [{'id':user.id, 'name':user.name}
                   for user in inactive_profs]
        return jsonify(results), 200