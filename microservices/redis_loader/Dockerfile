FROM ghcr.io/legumeinfo/microservices-redis_loader:1.1.0

RUN apk add --no-cache \
    bash

COPY ./docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

ENTRYPOINT ["/entrypoint.sh"]
