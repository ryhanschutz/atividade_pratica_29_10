# VulcanTech Smart Metals - Closed-Loop Predictive & Vision System

Sistema industrial de **Monitoramento Preditivo em Malha Fechada**, **Cálculo de OEE Preditivo** e **Visão Computacional** para células de manufatura automatizadas (CEL-201 a CEL-204).

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.10+ (compatível com Linux, Windows e macOS).
- Ou Docker & Docker Compose para execução em nó Edge.

### 1. Instalação Local
```bash
# Clone ou acesse o diretório do projeto
cd atividade_pratica_29_10

# Crie e ative um ambiente virtual
python -m venv .venv
# No Windows: .venv\Scripts\activate
# No Linux: source .venv/bin/activate

# Instale as dependências mínimas
pip install -r requirements.txt
```

### 2. Treinamento e Execução da Aplicação
```bash
# Treina o modelo preditivo balanceado e exporta o pipeline
python scripts/treinar_pipeline.py

# Inicia a API RESTful do nó Edge
python -m src.main
```
Acesse a documentação interativa Swagger em: `http://localhost:8000/docs`

### 3. Execução dos Testes Automatizados
```bash
# Executa a suíte completa de 23 testes unitários e de integração
python -m unittest discover -s tests -p "test_*.py" -v
```

### 4. Execução via Docker (Nó Edge)
```bash
docker compose up --build -d
```

---

## 📦 Justificativa de Dependências Externas (RNF-005)
- `pandas` / `numpy` / `scipy`: Normalização condicional por lote, Z-Score e janelas móveis temporais.
- `scikit-learn`: Modelagem supervisionada ensemble balanceada (`class_weight='balanced'`) e matriz de confusão.
- `opencv-python-headless`: Inspeção geométrica Canny de solda e análise termográfica HSV em Edge Computing sem GPU.
- `fastapi` / `pydantic` / `uvicorn`: API RESTful assíncrona com validação estrita de esquemas em milissegundos.
- `psutil`: Monitoramento em tempo de execução de consumo de memória RAM (< 150 MB) no endpoint `/health`.
- `joblib`: Serialização compactada do pipeline de machine learning.
- `python-multipart` / `httpx`: Suporte a upload de imagens de inspeção e cliente de testes.
