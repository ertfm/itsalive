from app import socket
from app.services import add_host, get_hosts, delete_host

@socket.on('connect')
def connection_handler():
    try:
        hosts = [ host.to_json() for host in get_hosts() ]
        if hosts:
            socket.emit('server:send-hosts', { 'status':'success', 'data':hosts})

    except Exception as e:
        socket.emit('server:send-hosts', { 'status':'error', 'data': 'here goes a descriptive error'})

@socket.on('client:add-host')
def add_host_handler(new_host):
    try:
        host = add_host(new_host)
        socket.emit('server:add-host', {'status': 'success','data': host.to_json(), 'message': 'Host added successfuly'})

    except Exception as e:
        socket.emit('server:add-host',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})

@socket.on('client:delete-host')
def delete_host_handler(host):
    try:
        host = delete_host(host)
        socket.emit('server:delete-host', { 'status':'success','data':host.to_json(),'message':'Host delete successfuly' })
    
    except Exception as e:
        print(e)
        socket.emit('server:delete-host',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})
