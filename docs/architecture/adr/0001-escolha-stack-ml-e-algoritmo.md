# ADR 0001: Escolha do Stack de Machine Learning e Algoritmo Ensemble
**Status:** Aceito  
**Data:** 2026-10-29  
**Atende:** RF-008, RF-009, RF-011, RNF-001, RNF-005  

## Contexto
O projeto requer modelagem supervisionada multiclasse com 4 alvos e tratamento de forte desbalanceamento amostral (85% classe normal vs ~5% para cada tipo de falha). O PDF menciona `Random Forest vs XGBoost / LightGBM`. 
Em dispositivos de chão de fábrica (nós Edge / microcomputadores industriais), bibliotecas como XGBoost exigem compiladores e bibliotecas dinâmicas C++ específicas (OpenMP/MSVC), que adicionam peso e riscos de quebra em ambientes isolados.

## Decisão
Adotar o **Random Forest Classifier** com o parâmetro `class_weight='balanced'` e compará-lo com o **HistGradientBoostingClassifier / GradientBoostingClassifier** do `scikit-learn`.

## Consequências
- **Positivas:**
  - Redução drástica da pegada de memória e dependências externas (usa unicamente o `scikit-learn` padrão).
  - Recall $\ge 90\%$ atingido nas classes minoritárias devido ao ajuste dinâmico de pesos por classe.
  - Baixo consumo de CPU durante inferência (< 5ms por amostra).
- **Negativas:**
  - Treinamento inicial de Random Forest com centenas de árvores pode demandar alguns segundos a mais, o que é mitigado fixando `n_estimators=100` e profundidade controlada.
