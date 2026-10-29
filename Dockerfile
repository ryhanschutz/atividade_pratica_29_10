# Atende: RF-017, RNF-001
# Dockerfile otimizado para computação em borda (Edge Computing) no chão de fábrica
FROM python:3.11-slim

# Evita criação de arquivos .pyc e buffer de saída
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Instala dependências mínimas do sistema para OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copia requisitos e instala dependências Python sem cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código-fonte e dados
COPY src/ ./src/
COPY data/ ./data/
COPY docs/ ./docs/
COPY dados_sensores_vulcantech.csv .

# Cria usuário não-root para segurança industrial (conforme ISO 27001)
RUN useradd -m edgeuser && chown -R edgeuser:edgeuser /app
USER edgeuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "-m", "src.main"]
