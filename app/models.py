from app import db

class Host(db.Model):
    __tablename__ = 'hosts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    friendly_name = db.Column(db.String, nullable=False)
    hostname = db.Column(db.String, nullable=False)

    def __init__(self, friendly_name, hostname):
        self.friendly_name = friendly_name
        self.hostname = hostname

    def to_json(self):
        return {
            'id':self.id,
            'friendly_name':self.friendly_name,
            'hostname':self.hostname
        }