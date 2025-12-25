FROM node:20-slim

RUN apt-get update && apt-get install -y openssl supervisor nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend setup
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Frontend setup
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build backend
RUN cd backend && npx prisma generate && npm run build

# Build frontend
ENV NEXT_PUBLIC_API_URL=/api
RUN cd frontend && npm run build

# Nginx config - reverse proxy
RUN echo 'server { \n\
    listen 10000; \n\
    \n\
    # API routes -> Backend \n\
    location /api { \n\
        proxy_pass http://127.0.0.1:4000; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Host $host; \n\
        proxy_set_header X-Real-IP $remote_addr; \n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \n\
        proxy_set_header Connection ""; \n\
        proxy_buffering off; \n\
        proxy_cache off; \n\
        proxy_read_timeout 86400; \n\
    } \n\
    \n\
    # All other routes -> Frontend \n\
    location / { \n\
        proxy_pass http://127.0.0.1:3000; \n\
        proxy_http_version 1.1; \n\
        proxy_set_header Upgrade $http_upgrade; \n\
        proxy_set_header Connection "upgrade"; \n\
        proxy_set_header Host $host; \n\
        proxy_set_header X-Real-IP $remote_addr; \n\
    } \n\
}' > /etc/nginx/sites-available/default

# Supervisor config
RUN mkdir -p /var/log/supervisor
RUN echo '[supervisord]\n\
nodaemon=true\n\
\n\
[program:backend]\n\
command=npm run start:prod\n\
directory=/app/backend\n\
environment=PORT=4000\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:frontend]\n\
command=npm run start\n\
directory=/app/frontend\n\
environment=PORT=3000\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0' > /etc/supervisor/conf.d/app.conf

EXPOSE 10000

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/app.conf"]
