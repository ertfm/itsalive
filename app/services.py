from app import app, db, scheduler, socket
from app.models import Host, HostUpStatus, Event
from subprocess import call, DEVNULL
from enum import Enum

class HostUpState(Enum):
    UP = 0
    DOWN = 1
    UNKNOWN = 2

def get_hosts():
    hosts = [ host for host in db.session.execute(db.select(Host)).scalars()]
    return hosts

def schedule_ping(hosts):
    for host in hosts:
        scheduler.add_job(ping,'interval',seconds=30, id=str(host.id), args=[host])

def get_last_up_status(host):
    last_host_status = db.session.scalars(db.select(HostUpStatus).where(HostUpStatus.host_id==host.id).order_by(HostUpStatus.created.desc())).first()
    if last_host_status:
        if last_host_status.up == 0:
            return HostUpState.UP
        return HostUpState.DOWN
    return HostUpState.UNKNOWN

def ping(host):
    with app.app_context():
        exit_code = call(['ping','-c','1',host.hostname], stdout=DEVNULL, stderr=DEVNULL)

        try:
            was_up = get_last_up_status(host)
            if (was_up == HostUpState.DOWN or was_up == HostUpState.UNKNOWN) and exit_code == 0:
                db.session.add(Event(fname=host.fname,status='UP'))
            if (was_up == HostUpState.UP or was_up == HostUpState.UNKNOWN) and exit_code != 0:
                db.session.add(Event(fname=host.fname,status='DOWN'))

            print(f'{host.fname}:{exit_code}')

            db.session.add(HostUpStatus(host_id=host.id,up=exit_code))
            db.session.commit()

            socket.emit('server:host-status-update', {'status':'success', 'data': { 'id':host.id, 'exit_code':exit_code}})

        except Exception as e:
            print(e)
            socket.emit('server:host-status-update',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})

def add_host(new_host):
    fname = new_host['fname']
    hostname = new_host['hostname']

    host = Host(fname, hostname)

    db.session.add(host)
    db.session.add(Event(fname=host.fname,status='ADD'))
    db.session.commit()
    
    schedule_ping([host])

    return host 

def delete_host(host):
    host = db.session.query(Host).filter_by(fname=host['fname']).first()
    db.session.delete(host)
    db.session.add(Event(fname=host.fname,status='DELETE'))
    db.session.commit()
    scheduler.remove_job(str(host.id))
    
    return host

def get_events():
    events = [ event for event in db.session.scalars(db.select(Event).order_by(Event.created.desc()).limit(100)) ]
    return events