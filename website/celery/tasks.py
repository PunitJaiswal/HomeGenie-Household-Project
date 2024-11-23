from celery import shared_task
from website.models import Service, ServiceRequest
import flask_excel
from website.celery.mail_service import send_email
from website.models import User, ServiceRequest


@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = ServiceRequest.query.all()

    task_id = self.request.id
    filename = f'Service_Request_{task_id}.csv'
    column_names = [column.name for column in ServiceRequest.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')

    with open(f'./website/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)

    return filename


@shared_task(ignore_result = True)
def email_reminder(to, subject, content):

    send_email(to, subject, content)