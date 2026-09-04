FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . backend/

# Set PYTHONPATH so that 'backend' package can be imported
ENV PYTHONPATH=/app

# Keeps the database and images under /app/data so a mounted volume persists them.
ENV DOCKER_MODE=true

# Create data directory for volume
RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
