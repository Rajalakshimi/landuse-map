FROM python:3.10-slim

# System & geo libs for GeoPandas/Fiona + utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git curl wget unzip cmake g++ make pkg-config \
    python-is-python3 \
    gdal-bin libgdal-dev libgeos-dev libproj-dev proj-bin libspatialindex-dev \
    libsqlite3-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Poetry (2.x)
RUN pip install --no-cache-dir poetry

WORKDIR /app

# Install Python deps first (better cache) — skip installing your app itself
COPY pyproject.toml poetry.lock* README.md ./ 
RUN poetry config virtualenvs.create false \
 && poetry install --only main --no-interaction --no-ansi --no-root

# --- Tippecanoe (precompiled binary instead of building from source) ---
RUN git clone https://github.com/felt/tippecanoe.git /tmp/tippecanoe \
 && cd /tmp/tippecanoe \
 && make -j$(nproc) \
 && make install \
 && rm -rf /tmp/tippecanoe
# App code
COPY . .

# Ensure pmtiles temp dir exists
RUN mkdir -p /app/tmp

EXPOSE 5000
CMD ["python3", "main.py"]
