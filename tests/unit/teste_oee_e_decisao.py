# Atende: RF-010, RF-014, RNF-007
"""
Testes unitários para cálculo preditivo do OEE e motor de decisão industrial.
Compatível com unittest padrão e pytest.
"""

import unittest
from src.core.calculadora_oee import calculate_predictive_oee
from src.core.motor_decisao import (
    evaluate_industrial_action,
    ACTION_MAINTAIN,
    ACTION_REDUCE,
    ACTION_EMERGENCY_STOP
)


class TestOEEAndDecision(unittest.TestCase):
    def test_oee_normal_operation(self):
        """Verifica OEE sem penalidade em regime normal (RF-010)."""
        res = calculate_predictive_oee(predicted_class=0)
        self.assertEqual(res["disponibilidade"], 0.95)
        self.assertEqual(res["performance"], 0.92)
        self.assertEqual(res["qualidade"], 0.98)
        self.assertEqual(res["oee_percentual"], "85.65%")

    def test_oee_tool_wear_penalty(self):
        """Verifica penalização de performance em desgaste de ferramenta."""
        res = calculate_predictive_oee(predicted_class=1)
        self.assertLess(res["performance"], 0.70)
        self.assertIn("Performance", res["justificativa_impacto"])

    def test_oee_cooling_failure_penalty(self):
        """Verifica penalização de qualidade em falha de refrigeração."""
        res = calculate_predictive_oee(predicted_class=2)
        self.assertLess(res["qualidade"], 0.60)
        self.assertIn("Qualidade", res["justificativa_impacto"])

    def test_oee_crack_emergency_penalty(self):
        """Verifica penalização severa de disponibilidade em trinca mecânica."""
        res = calculate_predictive_oee(predicted_class=3)
        self.assertLess(res["disponibilidade"], 0.50)

    def test_decision_engine_actions(self):
        """Verifica diretrizes e comandos CLP por tipo de falha (RF-014)."""
        act0 = evaluate_industrial_action(predicted_class=0, confidence=0.95)
        self.assertEqual(act0["acao_recomendada"], ACTION_MAINTAIN)
        self.assertEqual(act0["codigo_clp_hex"], "0x1")

        act1 = evaluate_industrial_action(predicted_class=1, confidence=0.90)
        self.assertEqual(act1["acao_recomendada"], ACTION_REDUCE)
        self.assertEqual(act1["codigo_clp_hex"], "0x2")

        act2 = evaluate_industrial_action(predicted_class=2, confidence=0.92)
        self.assertEqual(act2["acao_recomendada"], ACTION_EMERGENCY_STOP)
        self.assertEqual(act2["codigo_clp_hex"], "0x9")

        act3 = evaluate_industrial_action(predicted_class=3, confidence=0.88)
        self.assertEqual(act3["acao_recomendada"], ACTION_EMERGENCY_STOP)
        self.assertEqual(act3["codigo_clp_hex"], "0xff")


if __name__ == "__main__":
    unittest.main()
