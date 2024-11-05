from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from views import create_view
from models import *
from create_initial_data import create_data

security = Security()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = 'abcdefghijklmnopqrstuvwxyz'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
    app.config['SECURITY_PASSWORD_SALT'] = 'password-salt'

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

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)