FROM debian:latest
COPY webpage.sh /
RUN apt-get update \
    && apt-get install -y fortune
CMD ["./webpage.sh"]