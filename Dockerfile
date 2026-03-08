FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy frontend files and nginx template
COPY . /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# nginx:alpine includes envsubst support built-in via docker-entrypoint.d
# It automatically processes /etc/nginx/templates/*.template at startup
# and writes the result to /etc/nginx/conf.d/ with $PORT substituted

EXPOSE 8080
