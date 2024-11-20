from flask_restful import Resource, Api, fields, reqparse, marshal_with
from flask_security import auth_required

from models import Service, db, ServiceRequest

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
    @marshal_with(service_fields)
    def get(self):
        all_services = Service.query.all()
        return all_services, 200  # Include status code
    
    @auth_required('token')
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
    

class deleteService(Resource):
    @auth_required('token')
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {'message': 'Service not found'}, 404
        
        db.session.delete(service)
        db.session.commit()

        return {'message': 'Service Deleted Successfully'}, 200


class updateService(Resource):
    @auth_required('token')
    def put(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {'status' : 'error', 'message': 'Service not found'}, 404

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Name cannot be blank!")
        parser.add_argument('description', type=str, required=True, help="Description cannot be blank!")
        parser.add_argument('base_price', type=int, required=True, help="Base price is required!")
        parser.add_argument('time_required', type=int, required=True, help="Time required is required!")
        
        args = parser.parse_args()
        print(args)
        # Update the existing service instance
        service.name = args.name
        service.description = args.description
        service.base_price = args.base_price
        service.time_required = args.time_required

        db.session.commit()

        return {'message': 'Service updated successfully'}, 200

class getService(Resource):
    @marshal_with(service_fields)
    def get(self, service_id):
        service = Service.query.get(service_id)
        return service

# Add the resource to the API
api.add_resource(Services, '/services')
api.add_resource(deleteService, '/services/delete/<int:service_id>')
api.add_resource(updateService, '/services/update/<int:service_id>')
api.add_resource(getService, '/services/<int:service_id>')






# Define fields for request serialization
request_fields = {
    'id': fields.Integer,
    'customer_id': fields.Integer,
    'service_id': fields.Integer,
    'professional_id': fields.Integer,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'status': fields.String,
    'remarks': fields.String
}

class Service_Request(Resource):
    @marshal_with(request_fields)
    def get(self):
        all_requests = ServiceRequest.query.all()
        return all_requests, 200  # Include status code
    
    @auth_required('token')
    def post(self):
        # Define argument parser for the post method
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('customer_id', type=int)
        parser.add_argument('service_id', type=int)
        parser.add_argument('professional_id', type=int)        
        parser.add_argument('date_of_request', type=str)
        parser.add_argument('date_of_completion', type=str)
        parser.add_argument('status', type=str)
        parser.add_argument('remarks', type=str)

        args = parser.parse_args()

        # Create a new service instance without specifying the id
        request = ServiceRequest(
            professional_id = args.professional_id,
            customer_id = args.customer_id,
            service_id = args.service_id,
            remarks = args.remarks
        )
        db.session.add(request)
        db.session.commit()

        return {'message': 'Service Created Successfully'}, 201 
    
api.add_resource(Service_Request, '/requests')