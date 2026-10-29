# Schutz Factory MES/OEE — Frontend React + Vite (TypeScript)

Aplicação industrial de alta performance para monitoramento de **OEE (Overall Equipment Effectiveness)**, diagnóstico preditivo em malha fechada e controle de qualidade de chão de fábrica da **VulcanTech Smart Metals S.A. / Schutz Factory**.

---

## 1. Contexto e Objetivo

A **Schutz Factory** é a interface executiva e operacional que unifica a telemetria industrial, análise de qualidade óptica (norma AWS D1.1), termografia infravermelha HAZ e cálculo determinístico dos pilares de OEE (Disponibilidade, Performance e Qualidade conforme Nakajima e ISO 22400-2).

Toda a camada de interface anteriormente desenvolvida em Streamlit (`src/adapters/ui/painel_operador.py`) foi **eliminada e migrada integralmente** para esta aplicação **React 18+ com TypeScript, Vite e Recharts**, garantindo:
- Design industrial padronizado com barra superior dark, navegação vertical estritamente funcional (sem ícones decorativos ou sem uso) e painel lateral de filtros.
- Operação com latência zero e suporte offline no nó Edge (cálculo client-side determinístico).
- Simulação de esteira transportadora e controle de braço pneumático de refugo via store reativa **Zustand**.

---

## 2. Como Rodar a Aplicação (Passo a Passo)

### Pré-requisitos
Certifique-se de possuir instalado em sua máquina:
- **Node.js** v18.0.0 ou superior (recomendado v20 LTS)
- **npm** v9.0.0 ou superior (ou pnpm / yarn)
- *(Opcional)* **Python 3.11+** caso deseje subir também a API física do nó Edge.

---

### Passo 1: Acessar a pasta do frontend
Abra o seu terminal (PowerShell, Bash ou CMD) na raiz do projeto e navegue até a pasta `frontend`:
```bash
cd frontend
```

---

### Passo 2: Instalar as dependências do projeto
Instale todos os pacotes necessários (React, TypeScript, Recharts, Zustand, TanStack Query, Vitest, Playwright, etc.):
```bash
npm install
```

---

### Passo 3: Executar a aplicação em Modo de Desenvolvimento
Para rodar localmente com Hot Module Replacement (HMR):
```bash
npm run dev
```

O terminal exibirá uma mensagem semelhante a:
```text
  VITE v8.3.5  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Abra o seu navegador e acesse **`http://localhost:5173`**.

---

### Passo 4: Executar a Suíte de Testes Unitários de OEE (Vitest)
Para validar todas as fórmulas matemáticas de Disponibilidade, Performance, Qualidade e os casos de borda (produção zero, tempo planejado zero, parada total, refugo total):
```bash
npm run test
```

---

### Passo 5: Verificação de Qualidade de Código (Lint)
Para executar a verificação estática de conformidade e código limpo:
```bash
npm run lint
```
*Critério atendido: 0 erros e 0 avisos.*

---

### Passo 6: Gerar Build Otimizado de Produção
Para compilar o código TypeScript e gerar o pacote de distribuição estática na pasta `dist/`:
```bash
npm run build
```

Para testar localmente o artefato de produção gerado no `dist/`:
```bash
npm run preview
```
Acesse a URL indicada (geralmente `http://localhost:4173`).

---

### (Opcional) Executar o Backend Edge em Python (FastAPI)
Caso deseje rodar a API RESTful complementar do nó Edge (para inferência com CLP e telemetria física):
1. Abra um segundo terminal na **raiz do repositório** (fora da pasta `frontend`):
```bash
# Instale os requisitos Python
pip install -r requirements.txt

# Inicie o servidor FastAPI
python -m src.main
```
A API ficará acessível em `http://localhost:8000` (com documentação Swagger em `http://localhost:8000/docs`).

---

## 3. Módulos Funcionais da Barra Lateral

A barra lateral esquerda conta estritamente com os ícones que acionam funcionalidades reais do sistema:

| Ícone | Nome do Módulo | Descrição Operacional |
|---|---|---|
| 📊 | **Schutz Factory (Home)** | Dashboard executivo da fábrica: 5 cartões KPI (14.997 produzidas, 818 refugadas, 94.5% Yield), 4 Gauges Donut OEE em verde limão, Donut de Status de Ordens, Linha Produzido vs Refugado, Gráfico de Produtos, Donut de Máquinas e Colaboradores, Cards de Downtime (64.4h e 26.7h), Linha OEE e Barras de Operadores. |
| 🏭 | **Operação e Inferência** | Painel operacional com seleção de Célula (CEL-201..204) e Liga Metálica, 7 sliders de sensores físicos, diagnóstico de anomalia via IA, código CLP em hexadecimal (`0x1`, `0x2`, `0x9`, `0xff`) e impacto preditivo no OEE. |
| 📷 | **Visão Computacional & Simulador** | 3 abas dedicadas: 1) Inspeção de Cordão de Solda (AWS D1.1, Canny Th1/Th2, ROI, grade 3×3 de etapas OpenCV); 2) Termografia HAZ (temperatura por pixel, escala espectral JET, métricas de sobreaquecimento); 3) Simulador contínuo de esteira transportadora com controle de linha e braço de descarte. |
| 🗄️ | **Saneamento de Dados** | Tabela de limites físicos dos sensores, diagnóstico de valores nulos (NaNs), botão para execução do pipeline de limpeza e comparação antes vs depois. |
| 📈 | **Saúde do Nó Edge** | Telemetria de hardware (status ONLINE, consumo de RAM < 150 MB, CPU), acurácia geral do RandomForest (94.8%) e tabela de recall por classe de falha. |

---

## 4. Comparação Lado a Lado: OEE Python vs Schutz Factory

| Cenário de Teste | Módulo Python (`calculadora_oee.py`) | Módulo TypeScript (`oeeCalculator.ts`) | Divergência |
|---|---|---|---|
| **Classe 0 (Normal)** | D: 0.9500, P: 0.9200, Q: 0.9800 → **85.65%** | D: 0.9500, P: 0.9200, Q: 0.9800 → **85.65%** | **0.00%** (Exato) |
| **Classe 1 (Desgaste Ferramenta)** | D: 0.9500, P: 0.6900, Q: 0.9016 → **59.10%** | D: 0.9500, P: 0.6900, Q: 0.9016 → **59.10%** | **0.00%** (Exato) |
| **Classe 2 (Falha Refrigeração)** | D: 0.7600, P: 0.9200, Q: 0.5880 → **41.11%** | D: 0.7600, P: 0.9200, Q: 0.5880 → **41.11%** | **0.00%** (Exato) |
| **Classe 3 (Trinca Mecânica)** | D: 0.4750, P: 0.9200, Q: 0.6860 → **29.98%** | D: 0.4750, P: 0.9200, Q: 0.6860 → **29.98%** | **0.00%** (Exato) |
| **Dashboard Schutz Factory** | D: 85.8%, P: 80.5%, Q: 93.6% → **64.6%** | D: 85.8%, P: 80.5%, Q: 93.6% → **64.6%** | **0.00%** (Exato) |

---

## 5. Justificativa das Dependências

- **`react` & `react-dom`:** Interface declarativa base.
- **`recharts`:** Gráficos responsivos em SVG (Donuts, Linhas, Pizza, Barras).
- **`zustand`:** Gerenciamento de estado ultraleve para o ciclo contínuo da esteira de inspeção (substituindo `st.session_state`).
- **`@tanstack/react-query`:** Cache e sincronização de dados de telemetria (substituindo `st.cache_data`).
- **`lucide-react`:** Ícones industriais SVG vetorizados.
- **`typescript`:** Tipagem estática rigorosa para garantir tolerância zero a falhas em produção.
- **`vitest` & `jsdom`:** Suíte de testes unitários de alta velocidade para cálculo de OEE.
- **`@playwright/test`:** Testes ponta a ponta (E2E) dos fluxos operacionais.
- **`oxlint`:** Linter veloz para garantia de boas práticas e código limpo.
