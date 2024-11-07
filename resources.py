from flask_restful import Resource, Api, fields, reqparse, marshal_with
from flask_security import auth_required

from models import Service, db

api = Api(prefix='/api')

# Define fields for response serialization
service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'base_price': fields.Integer,
    'time_required': fields.Integer
}

class Services(Resource):
    @auth_required()
    @marshal_with(service_fields)
    def get(self):
        all_services = Service.query.all()
        return all_services, 200  # Include status code
    
    @auth_required()
    def post(self):
        # Define argument parser for the post method
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('description', type=str)
        parser.add_argument('base_price', type=int)
        parser.add_argument('time_required', type=int)

        args = parser.parse_args()

        # Create a new service instance without specifying the id
        service = Service(
            name=args.name, 
            description=args.description, 
            base_price=args.base_price, 
            time_required=args.time_required
        )
        db.session.add(service)
        db.session.commit()

        return {'message': 'Service Created Successfully'}, 201  # Use 201 status for created resources

# Add the resource to the API
api.add_resource(Services, '/resources')
