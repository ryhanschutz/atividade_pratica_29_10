# Atende: RF-012, RF-013
"""
Gera amostras visuais industriais para demonstração dos endpoints de visão computacional.
"""

from pathlib import Path
import numpy as np
import cv2

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "samples"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# 1. Cordão de solda aprovado (uniforme)
clean_weld = np.full((120, 300, 3), 45, dtype=np.uint8)
cv2.rectangle(clean_weld, (20, 45), (280, 75), (180, 180, 180), -1)
cv2.imwrite(str(DATA_DIR / "solda_aprovada.png"), clean_weld)

# 2. Cordão de solda com porosidade excessiva (reprovado)
porous_weld = clean_weld.copy()
for x in range(35, 270, 12):
    cv2.circle(porous_weld, (x, 60), 3, (0, 0, 0), -1)
cv2.imwrite(str(DATA_DIR / "solda_porosa_reprovada.png"), porous_weld)

# 3. Termografia crítica HAZ (superaquecimento)
thermal_crit = np.zeros((150, 150, 3), dtype=np.uint8)
thermal_crit[:, :] = (255, 0, 0) # Fundo azul frio
cv2.circle(thermal_crit, (75, 75), 40, (0, 0, 255), -1) # Zona crítica vermelha
cv2.imwrite(str(DATA_DIR / "termografia_haz_critica.png"), thermal_crit)

print("Amostras geradas em:", DATA_DIR)
