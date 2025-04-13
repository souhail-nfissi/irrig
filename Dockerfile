FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY ./app ./app
COPY .env .env
COPY ./scripts ./scripts

# Run the setup script (e.g., to create an admin user), then start the app
CMD ["sh", "-c", "python scripts/create_admin.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
