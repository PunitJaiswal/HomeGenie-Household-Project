from flask_restful import Resource, Api, fields, reqparse, marshal_with
from flask_security import auth_required, roles_required
from website.models import Service, db, ServiceRequest, User, Review
from flask import current_app as app
import datetime

api = Api(prefix='/api')
cache = app.cache

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
    @cache.cached(timeout=5)
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
    @cache.memoize(timeout=5)
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
    @auth_required('token')
    @cache.cached(timeout=5)
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
    
class deleteRequest(Resource):
    @auth_required('token')
    def delete(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {'message': 'Request not found'}, 404
        
        db.session.delete(request)
        db.session.commit()

        return {'message': 'Request Deleted Successfully'}, 200
    
class updateRequest(Resource):
    @auth_required('token')
    def put(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {'status' : 'error', 'message': 'Request not found'}, 404

        parser = reqparse.RequestParser()
        parser.add_argument('remarks', type=str, required=True, help="Remarks is required!")
        
        args = parser.parse_args()
        request.remarks = args.remarks

        db.session.commit()
        return {'message': 'Request updated successfully'}, 200

# Service Request fetched by customer
class ServiceRequestbyCustomer(Resource):
    @auth_required('token')
    @roles_required('customer')
    @cache.memoize(timeout=5)
    def get(self, customer_id):
        allrequests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
        result = [{
            'id': requests.id,
            'customer_id': requests.customer_id,
            'prof_name': User.query.get(requests.professional_id).name,
            'rating': User.query.get(requests.professional_id).rating,
            'professional_id': requests.professional_id,
            'service_id': requests.service_id,
            'service_type': Service.query.get(requests.service_id).name,
            'date_of_request': requests.date_of_request.strftime("%Y-%m-%d %H:%M:%S") if requests.date_of_request else None,
            'date_of_completion': requests.date_of_completion.strftime("%Y-%m-%d %H:%M:%S") if requests.date_of_completion else 'Not Yet Completed',
            'status': requests.status,
            'remarks': requests.remarks
        } for requests in allrequests]
        if not allrequests:
            return {'message': f'No requests found for customer ID {customer_id}'}, 404
        return result, 200

class ServiceRequestbyProfessional(Resource):
    @auth_required('token')
    @roles_required('professional')
    @cache.memoize(timeout=5)
    def get(self, professional_id):
        allrequests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
        result = [{
            'id': requests.id,
            'customer_id': requests.customer_id,
            'customer_name': User.query.get(requests.customer_id).name,
            'rating': User.query.get(requests.professional_id).rating,
            'service_id': requests.service_id,
            'location' : User.query.get(requests.customer_id).location,
            'service_type': Service.query.get(requests.service_id).name,
            'date_of_request': requests.date_of_request.strftime("%Y-%m-%d %H:%M:%S") if requests.date_of_request else None,
            'date_of_completion': requests.date_of_completion.strftime("%Y-%m-%d %H:%M:%S") if requests.date_of_completion else None,
            'status': requests.status,
            'remarks': requests.remarks
        } for requests in allrequests]
        if not allrequests:
            return {'message': f'No requests found for professional ID {professional_id}'}, 404
        return result, 200

class acceptRequest(Resource):
    @auth_required('token')
    @roles_required('professional')
    def put(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {'status' : 'error', 'message': 'Request not found'}, 404
        request.status = 'Accepted'
        db.session.commit()
        return {'message': 'Request updated successfully'}, 200

class rejectRequest(Resource):
    @auth_required('token')
    @roles_required('professional')
    def put(self, request_id):
        request = ServiceRequest.query.get(request_id)
        if not request:
            return {'status' : 'error', 'message': 'Request not found'}, 404
        request.status = 'Rejected'
        db.session.commit()
        return {'message': 'Request updated successfully'}, 200
    


# Define fields for review serialization
review_fields = {
    'id': fields.Integer,
    'customer_id': fields.Integer,
    'professional_id': fields.Integer,
    'rating': fields.Float,
    'review': fields.String
}

class ReviewResource(Resource):
    @auth_required('token')
    def post(self):
        # Define argument parser for the post method
        parser = reqparse.RequestParser()
        parser.add_argument('customer_id', type=int)
        parser.add_argument('professional_id', type=int)
        parser.add_argument('rating', type=int)
        parser.add_argument('review', type=str)

        args = parser.parse_args()

        # Create a new review instance without specifying the id
        review = Review(
            customer_id=args['customer_id'],
            professional_id=args['professional_id'],
            rating=args['rating'],
            review=args['review']
        )
        request = ServiceRequest.query.filter_by(customer_id=args['customer_id'], professional_id=args['professional_id']).first()
        prof = User.query.filter_by(id=args['professional_id']).first()
        if prof.rating:
            prof.rating = (prof.rating + args['rating'])/2
        else:
            prof.rating = args['rating']
        request.status = 'Closed'
        request.date_of_completion = datetime.datetime.now()
        db.session.add(review)
        db.session.commit()
        return {'message': 'Review created successfully'}, 201
    
class ReviewByProfessional(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, professional_id):
        allReviews = Review.query.filter_by(professional_id=professional_id).all()
        result = [{
            'review': review.review,
            "rating": review.rating,
            "customer_name": User.query.get(review.customer_id).name,
        } for review in allReviews ]
        return result
    
    
api.add_resource(Service_Request, '/requests')
api.add_resource(ServiceRequestbyCustomer, '/requests/customer/<int:customer_id>')
api.add_resource(deleteRequest, '/requests/delete/<int:request_id>')
api.add_resource(updateRequest, '/requests/update/<int:request_id>')
api.add_resource(ServiceRequestbyProfessional, '/requests/professional/<int:professional_id>')
# Actions Performed by Professional
api.add_resource(acceptRequest, '/requests/accept/<int:request_id>')
api.add_resource(rejectRequest, '/requests/reject/<int:request_id>')

# API endpoint for reviews
api.add_resource(ReviewResource, '/reviews')
api.add_resource(ReviewByProfessional, '/reviews/professional/<int:professional_id>')