FROM python:3.10-slim

# Install system dependencies for Tippecanoe and Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    cmake \
    g++ \
    make \
    curl \
    wget \
    unzip \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Set Work directory
WORKDIR /app

# Copy and install dependencies
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-dev

# Install Tippecanoe from GitHub
RUN git clone https://github.com/mapbox/tippecanoe.git /tippecanoe \
    && cd /tippecanoe \
    && make -j \
    && make install

# Copy your code
COPY . .

EXPOSE 5000
CMD ["poetry", "run", "python", "main.py"]