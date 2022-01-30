FROM ghcr.io/legumeinfo/microservices-redis_loader:1.0.0

# Add from https://github.com/legumeinfo/microservices/pull/38
RUN wget -O /usr/local/lib/python3.9/site-packages/redis_loader/__main__.py https://raw.githubusercontent.com/legumeinfo/microservices/52a3e65e860f3451127d09eea0dd80261cb440bf/redis_loader/redis_loader/__main__.py \
 && wget -O /usr/local/lib/python3.9/site-packages/redis_loader/loaders/gff.py https://raw.githubusercontent.com/legumeinfo/microservices/52a3e65e860f3451127d09eea0dd80261cb440bf/redis_loader/redis_loader/loaders/gff.py

# Add entrypoint script from https://github.com/legumeinfo/microservices/pull/40
RUN wget -O /entrypoint.sh https://raw.githubusercontent.com/legumeinfo/microservices/9c30b368873ea1e86300136016e2c0d631862fa8/redis_loader/entrypoint.sh \
  && chmod +x /entrypoint.sh 

COPY ./docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

ENTRYPOINT ["/entrypoint.sh"]
