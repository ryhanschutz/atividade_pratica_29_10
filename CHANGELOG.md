# Changelog
Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-10-29
### Adicionado
- **Saneamento e Limpeza (RF-001 a RF-003):** Quantificação de NaNs por célula/liga, interpolação temporal e filtragem de ruídos operacionais físicos e Z-score.
- **Engenharia de Features Dinâmicas (RF-004 a RF-006):** Cálculo de janelas móveis de 30m e 2h, computação do Índice de Esforço Mecânico (IEM) e normalização por liga metálica.
- **Modelagem Preditiva Multiclasse e MLOps (RF-007 a RF-009, RF-011):** Particionamento temporal estrito (70/30), balanceamento com pesos (`class_weight='balanced'`), matriz de confusão e persistência via `joblib`.
- **Motor de Decisão e OEE (RF-010, RF-014):** Atuação em malha fechada para CLP (`MANTER_OPERACAO`, `REDUZIR_VELOCIDADE_50%`, `INTERROMPER_EMERGENCIA`) e estimativa do impacto nos pilares do OEE.
- **Visão Computacional Aplicada a Solda (RF-012, RF-013):** Algoritmos Canny para porosidade de cordão e espaço de cores HSV para sobreaquecimento termográfico (HAZ).
- **API RESTful e Edge Deployment (RF-014 a RF-017):** Endpoints FastAPI com schemas Pydantic, endpoint `/health`, `Dockerfile` e `docker-compose.yml`.
- **Parecer Regulatório e ESG (RF-018):** Conformidade LGPD em câmeras industriais, EU AI Act de alto risco e redução de refugo metálico.
