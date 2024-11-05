from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from views import create_view
from models import *
from create_initial_data import create_data

security = Security()

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'abcdefghijklmnopqrstuvwxyz'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
    app.config['SECURITY_PASSWORD_SALT'] = 'password-salt'

    db.init_app(app)

    with app.app_context():
        user_datastore = SQLAlchemyUserDatastore(db,User, Role)
        security.init_app(app, user_datastore)

        db.create_all()
        create_data(user_datastore)


    create_view(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)