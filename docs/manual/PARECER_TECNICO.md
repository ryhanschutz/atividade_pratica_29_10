 Parecer Técnico Regulatório e Sustentabilidade Industrial (ESG)
**Empresa:** VulcanTech Smart Metals S.A.  
**Planta Operacional:** Células de Manufatura CEL-201 a CEL-204  
**Data:** 29 de Outubro de 2026  
**Atende:** RF-018, RNF-004  

---

## 1. Conformidade com a LGPD no Chão de Fábrica (Privacidade em Câmeras Industriais)

### 1.1 Escopo e Princípios Aplicáveis (Lei nº 13.709/2018)
A introdução de sistemas de Visão Computacional para inspeção óptica e termografia nas células de manufatura robotizadas deve seguir rigorosamente as garantias da Lei Geral de Proteção de Dados Pessoais (LGPD):
- **Princípio da Finalidade e Adequação (Art. 6º, I e II):** O monitoramento óptico possui a finalidade estrita e exclusiva de controle de qualidade metrológica e integridade mecânica de soldas e matrizes de conformação.
- **Princípio da Necessidade / Minimização de Dados (Art. 6º, III):** 
  - As câmeras industriais (sensores ópticos e termovisores) são posicionadas com campo de visão (*Field of View* - FOV) restrito à mesa de fixação pneumática e ao cabeçote de solda/usinagem.
  - Implementação de algoritmo no nó Edge que descarta qualquer quadro que não contenha a matriz metálica, impedindo gravação de feições biométricas ou imagem corporal de operadores de chão de fábrica.
  - Anonimização em tempo real via mascaramento espacial (ROI - *Region of Interest*) e exclusão de identificadores pessoais nas tabelas de telemetria.

---

## 2. Classificação do Sistema Preditivo sob o Regulamento Europeu EU AI Act

### 2.1 Enquadramento Regulatório (Regulation EU 2024/1689)
O sistema de inferência preditiva e atuação em malha fechada da VulcanTech Smart Metals S.A. atua no comando e controle de maquinário pesado (prensas hidráulicas de estampagem e robôs industriais MIG/MAG):
- **Classificação de Risco:** Enquadrado como **Sistema de IA de Alto Risco (High-Risk AI System - Artigo 6º, Anexo III)**, pois funciona como componente de segurança para maquinários sujeitos a diretivas de segurança mecânica da União Europeia (Diretiva de Máquinas 2006/42/CE).
- **Salvaguardas de Transparência e Explicabilidade:**
  - O sistema implementa o cálculo de relevância de atributos (*Feature Importances* / SHAP) para justificar a cada operador e engenheiro de manutenção o motivo das intervenções automatizadas.
  - Garantia de supervisão humana (*Human-in-the-loop / Human-on-the-loop*): comandos de parada emergencial (`0xFF`) e redução de avanço para 50% (`0x02`) podem ser cancelados ou validados por chave física de override operada pelo supervisor de turno.

---

## 3. Eficiência Energética e Redução de Refugo Metálico (ESG Industrial)

### 3.1 Pilar Ambiental (E - Environmental)
- **Mitigação de Refugo Metálico:** A detecção precoce de desgaste severo de pastilha de corte e obstrução de fluido de refrigeração evita a queima de peças e desvios dimensionais irreparáveis em ligas nobres como Titânio Ti6Al4V e Alumínio aeronáutico 7075. Redução projetada de refugo metálico em até **28%**.
- **Eficiência Energética:** Máquinas operando com ferramentas desgastadas demandam até **35% mais corrente estatórica** e torque excessivo devido ao aumento de atrito. A ação corretiva automatizada em malha fechada restabelece a eficiência elétrica do parque motor.

### 3.2 Pilar de Governança e Social (S/G)
- **Segurança Operacional:** A mitigação preditiva de trincas mecânicas e descompressão violenta de prensas hidráulicas reduz drasticamente o risco de acidentes graves de trabalho com projeção de cavacos e ruptura de matrizes.
- **Rastreabilidade e Auditoria:** Todas as inferências, probabilidades de confiança e ações disparadas no CLP são armazenadas em logs imutáveis para auditoria contínua de segurança.
