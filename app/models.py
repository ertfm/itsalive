from app import db
from sqlalchemy.sql import func 

class Monitor(db.Model):
    __tablename__ = 'monitors'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fname = db.Column(db.String, nullable=False)
    hostname = db.Column(db.String, nullable=False)
    ctype = db.Column(db.String, nullable=False)
    port = db.Column(db.Integer)
    status = db.relationship('MonitorUpStatus', cascade="all,delete", backref='monitor')

    def to_json(self):
        return {
            'id':self.id,
            'fname':self.fname,
            'hostname':self.hostname,
            'ctype':self.ctype,
            'port':self.port
        }

class MonitorUpStatus(db.Model):
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created = db.Column(db.DateTime, server_default=func.now())
    up = db.Column(db.Integer)
    monitor_id = db.Column(db.Integer, db.ForeignKey('monitors.id'))

    def to_json(self):
        return {
            'id':self.id,
            'created':self.created,
            'up':self.up,
            'monitor':self.monitor_id
        }

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    fname = db.Column(db.String, nullable=False)
    ctype = db.Column(db.String, nullable=False)
    port = db.Column(db.String)
    status = db.Column(db.String, nullable=False)

    def to_json(self):
        return {
            'id':self.id,
            'created':str(self.created),
            'fname':self.fname,
            'ctype':self.ctype,
            'port':self.port,
            'status':self.status
        }
    