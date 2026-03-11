# ============================================
# Stage 1: COBOL Compiler — compile all programs
# ============================================
FROM debian:bookworm-slim AS cobol-builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends gnucobol gcc && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY src/cobol/ ./src/cobol/
RUN mkdir -p data/output

# Compile all core programs + reports
RUN for f in src/cobol/core/*.cbl; do \
      name=$(basename "$f" .cbl); \
      cobc -x -I src/cobol/utils -o "data/output/$name" "$f"; \
    done && \
    for f in src/cobol/reports/*.cbl; do \
      name=$(basename "$f" .cbl); \
      cobc -x -I src/cobol/utils -o "data/output/$name" "$f"; \
    done

# ============================================
# Stage 2: Python API Runtime
# ============================================
FROM python:3.11-slim-bookworm

# Install GnuCOBOL runtime (for executing compiled binaries + on-demand recompilation)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gnucobol && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY src/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy source tree
COPY src/ ./src/
COPY data/input/ ./data/input/
COPY scripts/ ./scripts/
RUN chmod +x scripts/*.sh

# Copy pre-compiled COBOL binaries from builder
COPY --from=cobol-builder /build/data/output/ ./data/output/

# Ensure output directory exists
RUN mkdir -p data/output

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
