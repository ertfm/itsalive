# It's alive!

Simple self-hosted uptime monitoring tool. If you only want to display up/down hosts and don't need auth nor notifications, maybe this is for you. **It's still a work in progress so for now is not production ready**.

## Screenshots

<img src="https://github.com/ertfm/itsalive/blob/main/itsalive.png" />

## Features

* ping check
* 30s interval

## How to install

### docker

    git clone https://github.com/ertfm/itsalive.git
    cd itsalive
    docker build --tag itsalive .
    
    # replace {host-data-folder} with an absolute path to a folder where you want to store itsalive database
    docker run --detach --name itsalive --publish 5000:5000 --volume {host-data-folder}:/itsalive/data itsalive

### non-docker (linux)

    git clone https://github.com/ertfm/itsalive.git
    cd itsalive
    mkdir data
    pip install -r requirements.txt
    python run.py
    
## Motivation

Learn webdev.


