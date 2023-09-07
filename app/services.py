from app import app, db, scheduler, socketio
from app.models import Monitor, MonitorUpStatus, Event
from subprocess import call, DEVNULL
from enum import Enum
import socket

class MonitorUpState(Enum):
    UP = 0
    DOWN = 1
    UNKNOWN = 2

def get_monitors():
    monitors = [ monitor for monitor in db.session.scalars(db.select(Monitor)) ]
    return monitors

def schedule_check(monitors):
    for monitor in monitors:
        scheduler.add_job(check_monitor,'interval',seconds=30, id=str(monitor.id), misfire_grace_time=None, args=[monitor])

def get_last_up_status(monitor):
    last_monitor_status = db.session.scalars(db.select(MonitorUpStatus).where(MonitorUpStatus.monitor_id==monitor.id).order_by(MonitorUpStatus.created.desc())).first()
    if last_monitor_status:
        if last_monitor_status.up == 0:
            return MonitorUpState.UP
        return MonitorUpState.DOWN
    return MonitorUpState.UNKNOWN

def check_monitor(monitor):
    with app.app_context():
        try:
            if monitor.ctype == 'ping':
                exit_code = check_ping(monitor)
            if monitor.ctype == 'tcp':
                exit_code = check_tcp(monitor)

            was_up = get_last_up_status(monitor)
            if (was_up == MonitorUpState.DOWN or was_up == MonitorUpState.UNKNOWN) and exit_code == 0:
                db.session.add(Event(fname=monitor.fname, ctype=monitor.ctype,port=monitor.port, status='UP'))
            if (was_up == MonitorUpState.UP or was_up == MonitorUpState.UNKNOWN) and exit_code != 0:
                db.session.add(Event(fname=monitor.fname, ctype=monitor.ctype, port=monitor.port, status='DOWN'))

            db.session.add(MonitorUpStatus(monitor_id=monitor.id,up=exit_code))
            db.session.commit()

            socketio.emit('server:monitor-status-update', {'status':'success', 'data': { 'id':monitor.id, 'exit_code':exit_code}})

        except Exception as e:
            message = f'There was a problem querying the status of {monitor.fname} monitor. Contact your system administrator.'
            socketio.emit('server:monitor-status-update',{ 'status': 'error', 'data': {'id':monitor.id}, 'message': message})
    
def check_tcp(monitor):
    sc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sc.settimeout(1)

    exit_code = sc.connect_ex((monitor.hostname, monitor.port))

    sc.close()

    return exit_code

def check_ping(monitor):
    exit_code = call(['ping','-c','1',monitor.hostname], stdout=DEVNULL, stderr=DEVNULL)
    return exit_code
        

def add_monitor(new_monitor):
    fname = new_monitor['fname']
    hostname = new_monitor['hostname']
    ctype = new_monitor['ctype']
    port = new_monitor['port']
    monitor = Monitor(fname=fname, hostname=hostname, ctype=ctype, port=port)

    db.session.add(monitor)

    db.session.add(Event(fname=monitor.fname,ctype=monitor.ctype, port=monitor.port, status='ADD'))
    db.session.commit()
    
    schedule_check([monitor])

    return monitor

def delete_monitor(monitor):
    monitor = db.session.scalars(db.select(Monitor).filter_by(fname=monitor['fname'])).first()
    db.session.delete(monitor)
    db.session.add(Event(fname=monitor.fname, ctype=monitor.ctype, port=monitor.port, status='DELETE'))
    db.session.commit()
    scheduler.remove_job(str(monitor.id))
    
    return monitor

def get_events():
    events = [ event for event in db.session.scalars(db.select(Event).order_by(Event.created.desc()).limit(100)) ]
    return events