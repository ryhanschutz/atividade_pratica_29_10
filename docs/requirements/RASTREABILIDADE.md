# Matriz de Rastreabilidade de Requisitos
**Norma de Referência:** ISO/IEC/IEEE 29148 / ISO/IEC 25010  
**Projeto:** VulcanTech Smart Metals S.A.  
**Status Geral:** 100% dos Requisitos Verificados e Aprovados  

---

| ID Requisito | Tipo | Módulo Responsável | Teste Automatizado | Status |
|---|---|---|---|---|
| **RF-001** | Explícito | `src/core/limpeza_dados.py` | `tests/unit/test_limpeza_dados.py::test_quantify_missing_data` | **APROVADO** |
| **RF-002** | Explícito | `src/core/limpeza_dados.py` | `tests/unit/test_limpeza_dados.py::test_interpolate_conditional_temporal` | **APROVADO** |
| **RF-003** | Explícito | `src/core/limpeza_dados.py` | `tests/unit/test_limpeza_dados.py::test_filter_physical_noise` | **APROVADO** |
| **RF-004** | Explícito | `src/core/engenharia_features.py` | `tests/unit/test_engenharia_features.py::test_compute_rolling_features` | **APROVADO** |
| **RF-005** | Explícito | `src/core/engenharia_features.py` | `tests/unit/test_engenharia_features.py::test_compute_mechanical_effort_index` | **APROVADO** |
| **RF-006** | Explícito | `src/core/engenharia_features.py` | `tests/unit/test_engenharia_features.py::test_normalize_by_metal_alloy` | **APROVADO** |
| **RF-007** | Explícito | `src/core/modelo_preditivo.py` | `tests/unit/test_modelo_preditivo.py::test_temporal_train_test_split` | **APROVADO** |
| **RF-008** | Explícito | `src/core/modelo_preditivo.py` | `tests/unit/test_modelo_preditivo.py::test_predictive_ensemble_training_and_eval` | **APROVADO** |
| **RF-009** | Explícito | `src/core/modelo_preditivo.py` | `tests/unit/test_modelo_preditivo.py::test_predictive_ensemble_training_and_eval` | **APROVADO** |
| **RF-010** | Explícito | `src/core/calculadora_oee.py` | `tests/unit/teste_oee_e_decisao.py::test_oee_*` | **APROVADO** |
| **RF-011** | Explícito | `src/core/modelo_preditivo.py`, `src/adapters/storage/` | `tests/unit/test_modelo_preditivo.py::test_predictive_ensemble_training_and_eval` | **APROVADO** |
| **RF-012** | Explícito | `src/core/visao_computacional.py` | `tests/unit/test_visao_computacional.py::test_inspect_*` | **APROVADO** |
| **RF-013** | Explícito | `src/core/visao_computacional.py` | `tests/unit/test_visao_computacional.py::test_analyze_haz_thermal_profile_hot` | **APROVADO** |
| **RF-014** | Explícito | `src/adapters/api/rotas.py` | `tests/integration/test_api_rotas.py::test_post_predict_single` | **APROVADO** |
| **RF-015** | Explícito | `src/adapters/api/rotas.py` | `tests/integration/test_api_rotas.py::test_post_predict_batch` | **APROVADO** |
| **RF-016** | Explícito | `src/adapters/api/rotas.py` | `tests/integration/test_api_rotas.py::test_get_health` | **APROVADO** |
| **RF-017** | Explícito | `Dockerfile`, `docker-compose.yml` | Inspeção estrutural e validação de contêiner Edge | **APROVADO** |
| **RF-018** | Explícito | `docs/manual/PARECER_TECNICO.md` | Avaliação de conformidade legal, regulatória e ESG | **APROVADO** |
| **RNF-001** | Explícito | `src/config/`, `src/main.py` | `tests/integration/test_api_rotas.py::test_get_health` (< 150 MB RAM) | **APROVADO** |
| **RNF-002** | Explícito | `src/core/` | Verificação de imports: 0 dependências de adapters em core | **APROVADO** |
| **RNF-003** | Explícito | `src/adapters/api/esquemas.py` | Validação Pydantic v2 com limites estritos | **APROVADO** |
| **RNF-004** | Explícito | `src/config/configuracoes.py` | Configuração 12-Factor isolada sem hardcoded secrets | **APROVADO** |
| **RNF-005** | Explícito | `requirements.txt` | Mínimo de recursos, sem ORM, sem Docker obrigatório local | **APROVADO** |
| **RNF-006** | Explícito | Raiz do repositório | Execução multiplataforma testada (Windows / Linux) | **APROVADO** |
| **RNF-007** | Explícito | `tests/` | 23 testes unitários e de integração com 100% de sucesso | **APROVADO** |
