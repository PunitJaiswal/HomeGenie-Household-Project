from flask import render_template_string, render_template, request, Flask, jsonify
from flask_security import auth_required, current_user, roles_required
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password


def create_view(app: Flask, user_datastore : SQLAlchemySessionUserDatastore, db):
    # Homepage
    @app.route('/')
    def home():
        return render_template('index.html')
    
    
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
                                       active=True, 
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
    @auth_required('session', 'token')
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