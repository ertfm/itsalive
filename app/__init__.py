from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

db = SQLAlchemy(app)
socket = SocketIO(app)

scheduler = BackgroundScheduler()

scheduler.start()

from app.models import Host
from app.services import get_hosts, schedule_ping

with app.app_context():
    db.create_all()
    hosts = get_hosts()
    if hosts:
        schedule_ping(hosts)

from app import views, socket_handlers


    