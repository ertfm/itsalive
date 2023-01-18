from app import socket
from app.services import add_host, get_hosts, delete_host, get_events
from flask import request

@socket.on('connect')
def connection_handler():
    client_id = request.sid
    try:
        hosts = [ host.to_json() for host in get_hosts() ]
        if hosts:
            socket.emit('server:send-hosts', { 'status':'success', 'data':hosts}, to=client_id)

    except Exception as e:
        socket.emit('server:send-hosts', { 'status':'error', 'data': 'here goes a descriptive error'})

@socket.on('client:add-host')
def add_host_handler(new_host):
    client_id = request.sid
    try:
        host = add_host(new_host)
        socket.emit('server:add-host', {'status': 'success','data': '' , 'message': 'Host added successfuly'}, to=client_id)
        socket.emit('server:new-host-added', {'status': 'success','data': host.to_json() , 'message': 'New host added'})

    except Exception as e:
        socket.emit('server:add-host',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'}, to=client_id)

@socket.on('client:delete-host')
def delete_host_handler(host):
    try:
        host = delete_host(host)
        socket.emit('server:delete-host', { 'status':'success','data': { 'id':host.id },'message':'Host delete successfuly' })
    
    except Exception as e:
        print(e)
        socket.emit('server:delete-host',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})

@socket.on('client:send-events')
def send_events_handler():
    try:
        events = [ event.to_json() for event in get_events() ]
        socket.emit('server:send-events', {'status':'success','data': events, 'message':'Events sent succeessfuly'})
    
    except Exception as e:
        print(e)
        socket.emit('server:add-host',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})
