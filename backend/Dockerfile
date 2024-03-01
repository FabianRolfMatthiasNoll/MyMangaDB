FROM python:3.11-slim

WORKDIR /app

# Using docker image layers for faster builds
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./ ./backend

EXPOSE 80

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "80"]