from celery.schedules import crontab
from flask import current_app as app

celery_app = app.extensions['celery']


celery_app.conf.beat_schedule = {
    'daily-reminder-task': {
        'task': 'backend.celery.tasks.send_daily_reminders',
        'schedule': crontab(hour=1, minute=29),  # Schedule for 4:00 PM daily
    },
    # another task schedule
    'monthly-activity-report': {
        'task': 'backend.celery.tasks.send_monthly_activity_report',
        'schedule': crontab(hour=1, minute=29)  # First day of every month at 8:00 AM
    },
}