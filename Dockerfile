FROM node:20-slim

RUN apt-get update && apt-get install -y openssl supervisor && rm -rf /var/lib/apt/lists/*

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

# Build frontend (API calls go to same host)
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
RUN cd frontend && npm run build

# Supervisor config to run both services
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
stderr_logfile_maxbytes=0' > /etc/supervisor/conf.d/app.conf

EXPOSE 3000 4000

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/app.conf"]
