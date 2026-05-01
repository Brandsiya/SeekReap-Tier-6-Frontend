FROM nginx:alpine

# Copy static files with correct ownership
COPY --chown=nginx:nginx public /usr/share/nginx/html

# Create nginx config on port 8080
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass https://seekreap-tier-4-dev.fly.dev/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Remove the "user nginx" directive (causes permission issues)
RUN sed -i 's/^user  nginx;/# user nginx;/' /etc/nginx/nginx.conf

# Ensure all files are readable
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 8080

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
