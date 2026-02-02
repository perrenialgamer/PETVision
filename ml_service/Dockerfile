FROM python:3.11-slim
WORKDIR /app

# system deps for some pip packages (opencv, pillow, torch wheels are prebuilt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./ml_service /app

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "inference:app", "--host", "0.0.0.0", "--port", "8000"]
