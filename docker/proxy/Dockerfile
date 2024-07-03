FROM nginx:alpine

COPY docker/proxy/proxy.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
