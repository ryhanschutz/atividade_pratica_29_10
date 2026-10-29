# VulcanTech Smart Metals S.A. — Schutz Factory MES/OEE

Sistema industrial de **Monitoramento Preditivo em Malha Fechada**, **Cálculo de OEE Preditivo** e **Visão Computacional** para células de manufatura automatizadas (CEL-201 a CEL-204).

---

## 🚀 Instalação e Execução

### 1. Frontend: Schutz Factory MES/OEE (React + TypeScript + Vite)

A interface de usuário foi migrada para a aplicação moderna **Schutz Factory**, eliminando o Streamlit legado.

```bash
# Acesse o diretório do frontend
cd frontend

# Instale as dependências
npm install

# Execute em modo de desenvolvimento (HMR)
npm run dev
# Acesso: http://localhost:5173

# Execute os testes unitários de OEE (Vitest)
npm run test

# Execute o build de produção
npm run build
```

---

### 2. Backend Nó Edge: FastAPI / Python

A API assíncrona leve opera como serviço Edge para inferência ML e integração com CLP:

```bash
# Crie e ative um ambiente virtual na raiz do projeto
python -m venv .venv
# No Windows: .venv\Scripts\activate
# No Linux: source .venv/bin/activate

# Instale os requisitos
pip install -r requirements.txt

# Treine o pipeline de machine learning se necessário
python scripts/treinar_pipeline.py

# Inicie o servidor FastAPI
python -m src.main
# Documentação Swagger UI: http://localhost:8000/docs
```

---

### 3. Execução dos Testes Automatizados

#### Testes do Backend (Python `unittest`)

```bash
python -m unittest discover tests/unit
```

#### Testes do Frontend (Vitest)

```bash
cd frontend && npm run test
```

---

### 4. Execução via Docker (Nó Edge)

```bash
docker compose up --build -d
```

---

## 📦 Justificativa de Dependências Externas (RNF-005)

- **Frontend (Node.js):** `react`, `recharts` (gráficos declarativos), `zustand` (esteira contínua reativa), `@tanstack/react-query` (cache assíncrono), `lucide-react`, `vitest` e `typescript`.
- **Backend (Python):** `pandas`, `numpy`, `scipy`, `scikit-learn`, `opencv-python-headless`, `fastapi`, `pydantic`, `uvicorn`, `psutil`. Streamlit foi removido.
