from flask import render_template_string, render_template
from flask_security import auth_required, current_user, roles_required

def create_view(app):
    # Homepage
    @app.route('/')
    def home():
        return render_template('index.html')
    
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