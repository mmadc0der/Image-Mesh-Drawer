FROM nginx:alpine
#FROM i386/nginx:alpine

COPY ./frontend /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]