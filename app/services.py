from app import db, scheduler
from app.models import Host
from subprocess import call, DEVNULL

def get_hosts():
    hosts = [ host for host in db.session.execute(db.select(Host)).scalars()]
    return hosts

def schedule_ping(hosts):
    for host in hosts:
        scheduler.add_job(ping,'interval',seconds=30, id=str(host.id), args=[host])

def ping(host):
    exit_code = call(['ping','-c','1',host.hostname], stdout=DEVNULL, stderr=DEVNULL)
    print(f'{host.hostname}:{exit_code}')

def add_host(new_host):
    friendly_name = new_host['friendly-name']
    hostname = new_host['hostname']

    host = Host(friendly_name, hostname)

    db.session.add(host)
    db.session.commit()
    
    schedule_ping([host])

    return host 