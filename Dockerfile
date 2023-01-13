FROM alpine:3.14

WORKDIR /itsalive

COPY . .

RUN [[ -d data ]] || mkdir data

RUN apk add py3-pip

RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

EXPOSE 5000

CMD [ "python3","run.py" ]
