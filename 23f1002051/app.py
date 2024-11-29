from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from backend.views import create_view
from backend.models import *
from flask_wtf.csrf import CSRFProtect
from backend.create_initial_data import create_data
from backend.config import LocalDevelopmentConfig
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel

# Initialize the Cache object
cache = Cache()

security = Security()

def create_app():
    app = Flask(__name__)

    app.config.from_object(LocalDevelopmentConfig)
    
    csrf = CSRFProtect(app)

    cache = Cache(app)

    excel.init_excel(app)

    db.init_app(app)

    with app.app_context():
        user_datastore = SQLAlchemyUserDatastore(db, User, Role)
        security.init_app(app, user_datastore)
        
        db.create_all()
        create_data(user_datastore)
    
    app.cache = cache
    app.app_context().push()

    from backend.resources import api
    api.init_app(app)

    # Setup views and routes
    create_view(app, user_datastore, db, cache)
    
    return app

app = create_app()
celery_app = celery_init_app(app)

import backend.celery.celery_schedule


if __name__ == '__main__':
    app.run()