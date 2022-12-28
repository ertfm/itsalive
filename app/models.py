from app import db

class Host(db.Model):
    __tablename__ = 'hosts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fname = db.Column(db.String, nullable=False)
    hostname = db.Column(db.String, nullable=False)

    def __init__(self, fname, hostname):
        self.fname = fname
        self.hostname = hostname

    def to_json(self):
        return {
            'id':self.id,
            'fname':self.fname,
            'hostname':self.hostname
        }