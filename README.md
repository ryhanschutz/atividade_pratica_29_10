# ⚙️ Schutz IGNITION — OEE • BI (VulcanTech Smart Metals S.A.)

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.10+-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22b5bf)](https://recharts.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38)](https://zustand.docs.pmnd.rs/)
[![ISO 22400--2](https://img.shields.io/badge/Norma-ISO%2022400--2%3A2014-blue)](#-cálculo-de-oee-e-normas-industriais)

Plataforma industrial de **Execução da Manufatura (MES)**, **Monitoramento Preditivo em Malha Fechada**, **Cálculo de OEE (Overall Equipment Effectiveness)** e **Inspeção por Visão Computacional OpenCV com Extração de Pontos** para células de usinagem e soldagem automatizadas (**CEL-201** a **CEL-204**).

> **Aviso de Migração:** Toda a interface legada desenvolvida em Streamlit (`src/adapters/ui/painel_operador.py`) foi **eliminada e migrada integralmente** para uma aplicação web unificada de alta performance em **React 18+ com TypeScript e Vite**, operando com latência zero e suporte a computação em borda (*Edge Computing*).

---

## 📌 Sumário
- [Visão Geral do Sistema](#-visão-geral-do-sistema)
- [Módulos Funcionais](#-módulos-funcionais)
- [Cálculo de OEE e Normas Industriais](#-cálculo-de-oee-e-normas-industriais)
- [Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnológica)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Instalação e Execução Rápida](#-instalação-e-execução-rápida)
  - [Pré-requisitos](#pré-requisitos)
  - [Executando o Frontend (Direto da Raiz)](#1-executando-o-frontend-direto-da-raiz)
  - [Executando o Frontend (Pela pasta `frontend/`)](#2-executando-o-frontend-pela-pasta-frontend)
  - [Executando o Backend Edge (FastAPI)](#3-executando-o-backend-edge-fastapi--python)
  - [Execução via Docker](#4-execução-via-docker-nó-edge)
- [Suíte de Testes Automatizados](#-suíte-de-testes-automatizados)
- [Normas e Padrões de Engenharia](#-normas-e-padrões-de-engenharia)

---

## 🏭 Visão Geral do Sistema

A **Schutz Factory** integra sensores industriais de chão de fábrica, modelos de inteligência artificial supervisionada (*Random Forest Ensemble*) e pipelines ópticos de visão computacional (OpenCV) para:
1. **Calcular o OEE em Tempo Real:** Disponibilidade, Performance e Qualidade conforme Nakajima (1988) e ISO 22400-2:2014.
2. **Prescrever Ações em Malha Fechada para o CLP:** Despacho de comandos hexadecimais automáticos (`0x1`, `0x2`, `0x9`, `0xff`) conforme o nível de severidade e risco predito.
3. **Inspecionar Cordões de Solda e HAZ:** Classificação de porosidade segundo norma **AWS D1.1 / ISO 5817** e medição de temperatura por pixel em termogramas infravermelhos.
4. **Simular Esteira Contínua:** Posto de inspeção automatizado com atuação de braço pneumático para refugo/rejeição e log de rastreabilidade.

---

## 🧭 Módulos Funcionais

A barra lateral foi higienizada para exibir **estritamente os módulos funcionais** do sistema:

| Ícone | Módulo | Descrição Técnica e Operacional |
| :---: | :--- | :--- |
| 📊 | **Schutz Factory (Home)** | Dashboard executivo da planta fabril: 5 KPI Cards (14.997 produzidas, 14.179 aceitas, 818 refugadas com alerta vermelho, 94.5% First Time Yield); 4 Donut Gauges em verde limão para OEE, Disponibilidade, Performance e Qualidade; Donut de Ordens por Status; Linha temporal Produzido vs Refugado; Pizza de Produtos; Status de Máquinas e Colaboradores Ativos; Cards de Downtime Planejado (26.7h) e Não Planejado (64.4h); Gráfico de Tendência OEE; e Barras de Operadores Disponíveis. |
| 🏭 | **Operação e Inferência** | Diagnóstico preditivo em tempo real com seleção de Célula (CEL-201..CEL-204) e Liga Metálica (Titânio Ti6Al4V, Alumínio 7075, Aço 316L). Conta com 7 sliders físicos de telemetria (Temperatura, Vibração, Torque, Vazão, Corrente, Pressão, Ruído), cálculo de confiança, recomendação operacional, código CLP (HEX) e impacto previsto nos pilares de OEE. |
| 📷 | **Visão Computacional & Simulador** | Contém 3 abas industriais: **1) Inspeção de Cordão de Solda:** análise geométrica de porosidade via Canny (Th1, Th2), kernel morfológico, ROI central e grid 3×3 com as 9 etapas do pipeline OpenCV; **2) Termografia HAZ:** calibração de temperatura por pixel (25°C a 3000°C), escala espectral JET e métricas de sobreaquecimento; **3) Simulador de Linha:** esteira contínua com controle de velocidade, atuação pneumática de descarte e log de rastreabilidade temporal. |
| 🗄️ | **Saneamento de Dados** | Monitoramento de qualidade dos dados brutos: tabela de limites operacionais dos sensores físicos, diagnóstico e quantificação de valores nulos (NaNs), gatilho de interpolação temporal condicional por célula e comparativo antes vs depois do saneamento. |
| 📈 | **Saúde do Nó Edge** | Telemetria de hardware local conforme ISO/IEC 25010 (status ONLINE, consumo de RAM com meta estrita < 150 MB, CPU, threads), acurácia global do modelo preditivo RandomForest (94.80%) e tabela de sensibilidade (*recall*) por classe de falha. |

---

## 📐 Cálculo de OEE e Normas Industriais

O cálculo do OEE é implementado em **TypeScript puro** com tolerância zero a falhas e paridade matemática exata em relação à especificação Python original:

$$\text{OEE} = \text{Disponibilidade} \times \text{Performance} \times \text{Qualidade}$$

- **Disponibilidade ($A$):** $\frac{\text{Tempo Operacional Líquido}}{\text{Tempo Planejado de Produção}}$
- **Performance ($P$):** $\frac{\text{Produção Realizada}}{\text{Capacidade Nominal Esperada}}$
- **Qualidade ($Q$):** $\frac{\text{Peças Aprovadas (Boas)}}{\text{Total de Peças Produzidas}}$

### Comparação de Paridade (Python vs Schutz Factory TypeScript)

| Cenário / Classe de Falha | Módulo Python (`calculadora_oee.py`) | Módulo TypeScript (`oeeCalculator.ts`) | Divergência |
| :--- | :---: | :---: | :---: |
| **Classe 0 — Operação Normal** | $D: 0.9500 \cdot P: 0.9200 \cdot Q: 0.9800 \to \mathbf{85.65\%}$ | $D: 0.9500 \cdot P: 0.9200 \cdot Q: 0.9800 \to \mathbf{85.65\%}$ | **0.00%** |
| **Classe 1 — Desgaste de Ferramenta** | $D: 0.9500 \cdot P: 0.6900 \cdot Q: 0.9016 \to \mathbf{59.10\%}$ | $D: 0.9500 \cdot P: 0.6900 \cdot Q: 0.9016 \to \mathbf{59.10\%}$ | **0.00%** |
| **Classe 2 — Falha de Refrigeração** | $D: 0.7600 \cdot P: 0.9200 \cdot Q: 0.5880 \to \mathbf{41.11\%}$ | $D: 0.7600 \cdot P: 0.9200 \cdot Q: 0.5880 \to \mathbf{41.11\%}$ | **0.00%** |
| **Classe 3 — Trinca Mecânica** | $D: 0.4750 \cdot P: 0.9200 \cdot Q: 0.6860 \to \mathbf{29.98\%}$ | $D: 0.4750 \cdot P: 0.9200 \cdot Q: 0.6860 \to \mathbf{29.98\%}$ | **0.00%** |
| **Dashboard Schutz Factory** | $D: 85.8\% \cdot P: 80.5\% \cdot Q: 93.6\% \to \mathbf{64.6\%}$ | $D: 85.8\% \cdot P: 80.5\% \cdot Q: 93.6\% \to \mathbf{64.6\%}$ | **0.00%** |

---

## 🛠️ Arquitetura e Stack Tecnológica

### Frontend (Aplicação Web Industrial)
- **React 18+ com TypeScript:** Componentização declarativa e tipagem estrita de contratos de dados.
- **Vite:** Build ultrarrápido com Hot Module Replacement (HMR) e compilação otimizada.
- **Recharts:** Renderização vetorial SVG de gráficos de Donut, Linhas, Pizza e Barras.
- **Zustand:** Gerenciamento de estado leve (< 2 KB) para a esteira contínua de simulação e controle de contadores.
- **TanStack Query:** Cache resiliente e sincronização assíncrona com o nó Edge.
- **Design Tokens CSS:** Paleta industrial, tipografia *DM Sans* / *Fira Code* e temas centralizados em `src/styles/tokens.css`.
- **Vitest & Playwright:** Suíte de testes unitários rápidos e testes ponta a ponta (E2E).
- **Oxlint:** Verificação estática de código com 0 avisos e 0 erros.

### Backend Edge (Serviço de Borda em Python)
- **FastAPI & Uvicorn:** Endpoints assíncronos de baixa latência para integração com CLP industrial.
- **Scikit-Learn:** Modelos preditivos de manutenção com balanceamento de classes (`RandomForestClassifier`).
- **OpenCV Headless:** Processamento de imagens industriais (detecção Canny, máscaras morfológicas e análise espectral HSV).
- **Pydantic v2:** Validação e integridade de esquemas de telemetria.
- **Psutil:** Telemetria de recursos de hardware em tempo de execução.

---

## 📂 Estrutura do Repositório

```text
atividade_pratica_29_10/
├── frontend/                               # Aplicação React 18+ com TypeScript e Vite
│   ├── public/
│   │   ├── samples/                        # Amostras PNG de solda e termografia
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/layout/              # Navbar, IconSidebar, FilterSidebar
│   │   ├── features/
│   │   │   ├── oee/                        # Calculadora pura de OEE e tipos ISO 22400-2
│   │   │   ├── smart-factory/              # Dashboard principal e Donut Gauges
│   │   │   ├── operacao-inferencia/        # Sliders de telemetria e motor de despacho CLP
│   │   │   ├── visao-computacional/        # Solda AWS D1.1, Termografia HAZ e Esteira (Zustand)
│   │   │   ├── saneamento-dados/           # Diagnóstico de NaNs e pipeline antes/depois
│   │   │   └── saude-edge/                 # Telemetria do hardware e métricas do RandomForest
│   │   ├── styles/                         # Design tokens e variáveis de cores industriais
│   │   ├── App.tsx                         # Componente raiz com navegação modular
│   │   ├── main.tsx                        # Ponto de montagem React
│   │   └── index.css                       # Reset e layout responsivo
│   ├── tests/
│   │   ├── unit/oeeCalculator.test.ts      # 10 testes unitários Vitest (OEE & bordas)
│   │   └── e2e/smartFactory.spec.ts        # Testes de ponta a ponta Playwright
│   ├── package.json                        # Scripts e dependências do frontend
│   ├── tsconfig.json                       # Configuração TypeScript
│   └── vite.config.ts                      # Configuração Vite e Vitest
├── src/                                    # Backend Edge em Python (FastAPI & OpenCV)
│   ├── adapters/
│   │   ├── api/                            # Rotas (/predict, /health) e esquemas Pydantic
│   │   ├── storage/                        # Persistência do pipeline (.joblib)
│   │   └── ui/                             # Antiga pasta Streamlit (migrada/higienizada)
│   ├── config/                             # Variáveis de ambiente e caminhos
│   ├── core/                               # Motores em Python: OEE, decisão, visão e limpeza
│   └── main.py                             # Inicialização ASGI Uvicorn
├── data/
│   ├── models/                             # Diretório de persistência do modelo ML
│   └── samples/                            # Amostras originais de imagens industriais
├── docs/                                   # Documentação de arquitetura, ADRs e requisitos
├── scripts/                                # Script de treinamento do pipeline ML
├── tests/                                  # Testes unitários e de integração do backend Python
├── dados_sensores_vulcantech.csv           # Base histórica de telemetria (2.880 registros)
├── Prática tabela.xlsx                     # Dicionário de variáveis e faixas operacionais
├── Dockerfile                              # Imagem para execução em Nó Edge
├── docker-compose.yml                      # Orquestração do nó fabril
├── package.json                            # Package raiz com atalhos de scripts
├── requirements.txt                        # Dependências Python mínimas justificadas
└── .gitignore                              # Regras completas de exclusão Git
```

---

## 🚀 Instalação e Execução Rápida

### Pré-requisitos
- **Node.js:** Versão 18.0.0 ou superior (recomendado Node.js 20 LTS).
- **npm:** Versão 9.0.0 ou superior.
- *(Opcional)* **Python:** 3.10 ou superior (caso deseje rodar o servidor FastAPI do nó Edge).

---

### 1. Executando o Frontend (Direto da Raiz)

Para sua conveniência, a raiz do projeto conta com atalhos configurados via `package.json`:

```bash
# 1. Instale as dependências do frontend
npm --prefix frontend install

# 2. Inicie o servidor de desenvolvimento Vite
npm run dev

# 3. Execute a suíte de testes unitários de OEE (Vitest)
npm run test

# 4. Verifique a conformidade de código (Lint)
npm run lint

# 5. Gere o build de produção (tsc + vite build)
npm run build
```

Abra o seu navegador em **`http://localhost:5173`**.

---

### 2. Executando o Frontend (Pela pasta `frontend/`)

Se preferir trabalhar diretamente no diretório do cliente web:

```bash
cd frontend

# Instalação
npm install

# Modo de desenvolvimento
npm run dev

# Testes unitários (Vitest)
npm run test

# Testes E2E (Playwright)
npm run test:e2e

# Build de produção
npm run build
```

---

### 3. Executando o Backend Edge (FastAPI / Python)

Para iniciar o serviço RESTful que expõe inferência em tempo real para os CLPs:

```bash
# 1. Crie e ative um ambiente virtual na raiz do projeto
python -m venv .venv

# No Windows:
.venv\Scripts\activate
# No Linux/macOS:
source .venv/bin/activate

# 2. Instale as dependências Python
pip install -r requirements.txt

# 3. (Opcional) Treine o modelo preditivo a partir do CSV
python scripts/treinar_pipeline.py

# 4. Inicie o servidor FastAPI Uvicorn
python -m src.main
```

A API estará disponível em `http://localhost:8000` e a documentação interativa Swagger UI em **`http://localhost:8000/docs`**.

---

### 4. Execução via Docker (Nó Edge)

Para empacotar e executar o nó Edge em contêiner Linux padronizado:

```bash
docker compose up --build -d
```

O serviço iniciará na porta `8000` com *healthcheck* contínuo no endpoint `/health`.

---

## 🧪 Suíte de Testes Automatizados

O repositório conta com suítes de testes automatizados cobrindo tanto o backend quanto o frontend:

### Testes Unitários de OEE no Frontend (Vitest)
Testa os 3 pilares e o valor composto do OEE, incluindo valores de borda (produção zero, tempo planejado zero, parada total de 100% e refugo total de 100%):
```bash
npm run test
```
*Resultado: 10 testes aprovados (100%).*

### Testes de Integração e Unitários do Backend (Python `unittest`)
Testa rotas de API, saneamento de dados, engenharia de features, inferência ML e visão computacional:
```bash
python -m unittest discover tests/unit
```
*Resultado: 18 testes aprovados (100%).*

### Verificação de Código Limpo (Linter)
```bash
npm run lint
```
*Resultado: 0 avisos e 0 erros.*

---

## 📜 Normas e Padrões de Engenharia

O projeto foi concebido estritamente alinhado às normas internacionais de engenharia de software e automação:

- **ISO 22400-2:2014:** Indicadores-chave de desempenho (KPIs) para operações de gestão da manufatura (MES/OEE).
- **Nakajima, S. (1988):** *Introduction to TPM: Total Productive Maintenance* — definição clássica dos pilares de OEE e perdas crônicas.
- **AWS D1.1 / ISO 5817:** Critérios de aceitação para descontinuidades e porosidades em juntas soldadas de aço e titânio.
- **ISO/IEC/IEEE 29148:2018:** Engenharia de requisitos e especificação de software industrial.
- **ISO/IEC/IEEE 42010:2011:** Descrição de arquitetura de sistemas e software (*Clean Architecture* / Arquitetura Hexagonal).
- **ISO/IEC 25010:2011:** Modelo de qualidade de produto de software e eficiência de recursos computacionais (< 150 MB de RAM em nó Edge).
