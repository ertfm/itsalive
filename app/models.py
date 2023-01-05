from app import db
from sqlalchemy.sql import func 

class Host(db.Model):
    __tablename__ = 'hosts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fname = db.Column(db.String, nullable=False)
    hostname = db.Column(db.String, nullable=False)
    status = db.relationship('HostUpStatus', cascade="all,delete", backref='host')

    def __init__(self, fname, hostname):
        self.fname = fname
        self.hostname = hostname

    def to_json(self):
        return {
            'id':self.id,
            'fname':self.fname,
            'hostname':self.hostname
        }

class HostUpStatus(db.Model):
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created = db.Column(db.DateTime, server_default=func.now())
    up = db.Column(db.Integer)
    host_id = db.Column(db.Integer, db.ForeignKey('hosts.id'))

    def to_json(self):
        return {
            'id':self.id,
            'created':self.created,
            'up':self.up,
            'host':self.host_id
        }

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    fname = db.Column(db.String, nullable=False)
    status = db.Column(db.String, nullable=False)

    def to_json(self):
        return {
            'id':self.id,
            'created':str(self.created),
            'fname':self.fname,
            'status':self.status
        }
    