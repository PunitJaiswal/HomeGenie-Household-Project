from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from website.views import create_view
from website.models import *
from website.create_initial_data import create_data
import website.resources as resources
from flask_socketio import SocketIO, emit
from flask_cors import CORS


security = Security()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuration
    app.config['DEBUG'] = True
    app.config['SECRET_KEY'] = 'abcdefghijklmnopqrstuvwxyz'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
    app.config['SECURITY_PASSWORD_SALT'] = 'password-salt'
    
    # Configure Token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = "Authentication-Token"
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True
    # tell flask to use sql_alchemy db
    db.init_app(app)

    with app.app_context():
        user_datastore = SQLAlchemyUserDatastore(db,User, Role)
        security.init_app(app, user_datastore)

        db.create_all()
        create_data(user_datastore)

    # disable CSRF protection, from WTforms as well as flask security
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True

    # Setup the view
    create_view(app, user_datastore, db)
    # Connect Flask to falsk_restful
    resources.api.init_app(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run()