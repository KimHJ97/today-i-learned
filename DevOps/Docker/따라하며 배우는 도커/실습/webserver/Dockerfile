FROM ubuntu:18.04
LABEL maintainer="HyoJun Kim <hj_kim97@naver.com>"

# install apache
RUN apt-get update \
    && apt-get upgrade \
    && apt-get install -y apache2
RUN echo "TEST WEB" > /var/www/html/index.html
EXPOSE 80
CMD ["/usr/sbin/apache2ctl", "-DFOREGROUND"]