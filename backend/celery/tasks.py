from celery import shared_task
from backend.models import ServiceRequest
import flask_excel
from flask import render_template
from backend.celery.mail_service import send_email
from backend.models import User, ServiceRequest, db
from datetime import datetime, timedelta
from sqlalchemy import text


@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = ServiceRequest.query.all()

    task_id = self.request.id
    filename = f'Service_Request_{task_id}.csv'
    column_names = [column.name for column in ServiceRequest.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')

    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)

    return filename


@shared_task(ignore_result=True)
def send_daily_reminders():
    # Fetch pending requests grouped by professionals
    pending_requests = ServiceRequest.query.filter(ServiceRequest.status != 'Closed').all()

    # Group requests by professional
    professional_requests = {}
    for request in pending_requests:
        professional = User.query.get(request.professional_id)
        if professional and professional.email:
            if professional.id not in professional_requests:
                professional_requests[professional.id] = {
                    "professional": professional,
                    "requests": []
                }
            professional_requests[professional.id]["requests"].append(request)

    # Send email reminders
    for professional_data in professional_requests.values():
        professional = professional_data["professional"]
        requests = professional_data["requests"]

        # Render the email content using an HTML template
        subject = "Daily Reminder: Pending Service Requests"
        content = f"""
            <div>
                <h2>Hello {professional.name},</h2>
                <p>You have the following {len(requests)} pending service requests.</p>
                <p>Please log in to accept or reject these requests.</p>
                <p>Thank you!</p>
            </div>
        """

        # Send email
        send_email(professional.email, subject, content)

@shared_task(ignore_result=True)
def send_monthly_activity_report():
    # Get the current date and calculate the previous month
    thirty_days_ago = datetime.now() - timedelta(days=30)

    # Query service requests within the last month
    query = text("""
    SELECT *
    FROM service_request 
    WHERE service_request.date_of_request >= :date
""")

    # Execute the query with a bound parameter
    result = db.session.execute(query, {'date': thirty_days_ago})
    monthly_requests = result.fetchall()

    # Group data by customers
    customer_data = {}
    for request in monthly_requests:
        customer = User.query.get(request.customer_id)
        if customer and customer.email:
            if customer.id not in customer_data:
                customer_data[customer.id] = {
                    "customer": customer,
                    "total_requested": 0,
                    "total_closed": 0,
                    "services": []
                }
            customer_data[customer.id]["total_requested"] += 1
            if request.status == "Closed":
                customer_data[customer.id]["total_closed"] += 1
            customer_data[customer.id]["services"].append(request)
    print(f"Customer Data: {customer_data}")
    print(f"Monthly Requests: {monthly_requests}")

    # Send email reports
    for customer_report in customer_data.values():
        customer = customer_report["customer"]

        # Email Subject
        subject = "Your Monthly Activity Report"

        # Generate email content using HTML template
        content = render_template(
            'monthly_report.html',
            customer=customer,
            total_requested=customer_report["total_requested"],
            total_closed=customer_report["total_closed"],
            services=customer_report["services"]
        )

        # Send the email
        send_email(customer.email, subject, content)