from gevent import monkey
monkey.patch_all()
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
from  pathlib import Path

db_path = Path(Path.cwd(),'data','database.db')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + str(db_path)
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


    