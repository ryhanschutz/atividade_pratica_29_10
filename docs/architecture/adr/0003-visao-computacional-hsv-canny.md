# ADR 0003: Pipeline de Visão Computacional Determinístico com OpenCV
**Status:** Aceito  
**Data:** 2026-10-29  
**Atende:** RF-012, RF-013, RNF-001  

## Contexto
A inspeção óptica de soldagem robotizada exige quantificação de porosidade e verificação da zona afetada termicamente (HAZ) com latência baixa e execução em Edge Computing sem GPU dedicada. Modelos de Deep Learning pesados (como YOLO ou ResNet) exigiriam gigabytes de VRAM e frameworks como PyTorch/TensorFlow, inviabilizando nós de baixo consumo.

## Decisão
Utilizar pipeline clássico de Visão Computacional baseado em OpenCV:
1. **Inspeção Geométrica e Porosidade**:
   - Aplicação de máscara de nitidez (*Unsharp Masking* via filtro gaussiano).
   - Conversão para tons de cinza.
   - Detecção de bordas via *Canny Edge Detection*.
   - Extração de contornos fechados e cálculo da razão de área de poros em relação à área total do cordão de solda.
2. **Análise Termográfica HAZ**:
   - Conversão da imagem termográfica para o espaço de cores **HSV**.
   - Aplicação de limiarização (*Thresholding*) nas faixas de Matiz (Hue) correspondentes a temperaturas críticas (faixa vermelha/magenta/branca de calor excessivo).
   - Cálculo da densidade percentual da área sobreaquecida.

## Consequências
- **Positivas:**
  - Tempo de processamento inferior a 15 ms por quadro em CPU padrão.
  - Baixo consumo de memória (< 20 MB adicionais).
  - Determinismo físico total e facilidade de calibração em chão de fábrica.
- **Negativas:**
  - Requer parametrização dos limiares de cor e bordas para diferentes tipos de iluminação e câmeras térmicas.
