from celery.schedules import crontab
from flask import current_app as app

celery_app = app.extensions['celery']


celery_app.conf.beat_schedule = {
    'daily-reminder-task': {
        'task': 'website.celery.tasks.send_daily_reminders',
        'schedule': crontab(hour=16, minute=00),  # Schedule for 4:00 PM daily
    },
    # another task schedule
    'monthly-activity-report': {
        'task': 'website.celery.tasks.send_monthly_activity_report',
        'schedule': crontab(hour=8, minute=0, day_of_month=1)  # First day of every month at 8:00 AM
    },
}