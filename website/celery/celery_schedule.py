from celery.schedules import crontab
from flask import current_app as app
from website.celery.tasks import email_reminder

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Every 10 seconds
    # sender.add_periodic_task(10.0, email_reminder.s('customer@mail', 'Reminder to work', '<h1>hello Customer</h1>'))

    # Daily message at 02:48 a.m. everyday
    sender.add_periodic_task(crontab(hour=2, minute=48), email_reminder.s('customer@mail', 'Reminder to work', '<h1>hello Customer</h1>'), name='daily Reminder')

    # Weekly message
    sender.add_periodic_task(crontab(hour=2, minute=48, day_of_week='monday'), email_reminder.s('customer@mail', 'Reminder to work', '<h1>hello Customer</h1>'), name='Weekly Reminder')
