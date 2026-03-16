FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    docker.io \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Install OpenClaw CLI
RUN pip install openclaw

# Start
CMD ["python", "-m", "worker.main"]
