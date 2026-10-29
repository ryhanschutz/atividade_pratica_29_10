# Atende: RF-012, RF-013, RNF-007
"""
Testes unitários para visão computacional em soldagem e perfil térmico HAZ (visao_computacional.py).
Compatível com unittest padrão e pytest.
"""

import unittest
import numpy as np
import cv2

from src.core.visao_computacional import (
    apply_sharpening_filter,
    inspect_weld_seam,
    analyze_haz_thermal_profile
)


class TestVision(unittest.TestCase):
    def setUp(self):
        # Solda uniforme
        self.clean_weld_img = np.full((100, 200, 3), 40, dtype=np.uint8)
        cv2.rectangle(self.clean_weld_img, (20, 40), (180, 60), (180, 180, 180), -1)

        # Solda com poros
        self.porous_weld_img = np.full((100, 200, 3), 40, dtype=np.uint8)
        cv2.rectangle(self.porous_weld_img, (20, 40), (180, 60), (180, 180, 180), -1)
        for x in range(30, 170, 7):
            cv2.circle(self.porous_weld_img, (x, 50), 3, (0, 0, 0), -1)

        # Imagem térmica crítica
        self.hot_thermal_img = np.zeros((100, 100, 3), dtype=np.uint8)
        self.hot_thermal_img[:, :] = (255, 0, 0)
        cv2.circle(self.hot_thermal_img, (50, 50), 25, (0, 0, 255), -1)

    def test_sharpening_filter(self):
        """Verifica se o filtro de nitidez mantém a dimensionalidade da imagem."""
        sharp = apply_sharpening_filter(self.clean_weld_img)
        self.assertEqual(sharp.shape, self.clean_weld_img.shape)

    def test_inspect_clean_weld_seam(self):
        """Verifica aprovação de solda uniforme sem porosidades (RF-012)."""
        res = inspect_weld_seam(self.clean_weld_img)
        self.assertEqual(res["status_cordao"], "APROVADO")
        self.assertLess(res["taxa_porosidade_percentual"], 1.0)

    def test_inspect_porous_weld_seam(self):
        """Verifica detecção e reprovação de solda com excesso de poros (RF-012)."""
        res = inspect_weld_seam(self.porous_weld_img)
        self.assertGreater(res["total_poros_detectados"], 5)
        self.assertIn("POROSIDADE", res["status_cordao"])

    def test_analyze_haz_thermal_profile_hot(self):
        """Verifica detecção de sobreaquecimento crítico na Zona Afetada pelo Calor (RF-013)."""
        res = analyze_haz_thermal_profile(self.hot_thermal_img)
        self.assertEqual(res["status_haz"], "CRITICO_SOBREAQUECIMENTO")
        self.assertGreater(res["percentual_area_sobreaquecida"], 10.0)
        self.assertIn("Interromper soldagem", res["diretriz_termica"])


if __name__ == "__main__":
    unittest.main()
