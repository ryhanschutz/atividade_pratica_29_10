# ADR 0002: Arquitetura Hexagonal Limpa e Desacoplamento do Núcleo
**Status:** Aceito  
**Data:** 2026-10-29  
**Atende:** RNF-001, RNF-002, RNF-005, RNF-007  

## Contexto
O sistema precisa processar dados industriais críticos e fornecer inferência em tempo real via API RESTful para integração com Controladores Lógicos Programáveis (CLP). A lógica de negócio (limpeza física, OEE, cálculo de IEM, decisão industrial) não pode ficar atrelada ao framework web (FastAPI) ou ao formato de persistência.

## Decisão
Implementar a separação estrita da arquitetura em:
- `src/core/`: Classes e funções puras contendo unicamente lógica de domínio matemático e industrial, recebendo tipos primitivos ou dicionários / dataframes, sem nenhuma dependência de FastAPI ou Uvicorn.
- `src/adapters/`: Controladores REST FastAPI, modelos Pydantic de transporte (DTOs), leitores de arquivo e serializadores `joblib`.
- `src/config/`: Leitura isolada de variáveis de ambiente.

## Consequências
- **Positivas:**
  - Testabilidade unitária pura e ultrarrápida do `core/` sem levantar servidores HTTP.
  - Substituição transparente do adaptador de transporte (ex.: trocar FastAPI por MQTT ou Modbus/OPC-UA futuramente).
  - Respeito integral à norma de arquitetura e instruções do projeto.
- **Negativas:**
  - Necessidade de mapeamento explícito entre esquemas de DTO (Pydantic) e parâmetros do núcleo de negócio.
