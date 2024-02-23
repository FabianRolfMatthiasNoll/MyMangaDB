# Use an official Python runtime as a parent image
FROM nikolaik/python-nodejs:latest

# Set the working directory in the container
WORKDIR /app

# Copy both frontend and backend directories into the container
COPY ./frontend ./frontend
COPY ./backend ./backend

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements_linux.txt

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build the frontend
RUN npm run build

# Move the frontend build to serve it with a Python HTTP server
WORKDIR /app
RUN mv frontend/build backend/static

# Go back to the root of the backend to run it
WORKDIR /app/backend

# Install Supervisor
RUN apt-get update && apt-get install -y supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Use CMD to start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
