import { test, expect } from "@playwright/test";

test.describe("Schutz Factory MES/OEE — Fluxos Principais", () => {
  test("deve carregar a tela principal Schutz Factory OEE e exibir KPIs e Gauges", async ({ page }) => {
    await page.goto("/");

    // 1. Verifica título e welcome banner
    await expect(page.locator("text=Welcome to the Schutz Factory")).toBeVisible();
    await expect(page.locator("text=Finish Production Orders")).toBeVisible();

    // 2. Verifica valores dos KPIs da referência
    await expect(page.locator("text=14,997")).toBeVisible();
    await expect(page.locator("text=14,179")).toBeVisible();
    await expect(page.locator("text=818")).toBeVisible();
    await expect(page.locator("text=94.5 %")).toBeVisible();

    // 3. Verifica Gauges de OEE
    await expect(page.locator("text=64.6%")).toBeVisible();
    await expect(page.locator("text=85.8%")).toBeVisible();
    await expect(page.locator("text=80.5%")).toBeVisible();
    await expect(page.locator("text=93.6%")).toBeVisible();

    // 4. Verifica Downtime cards
    await expect(page.locator("text=64.4")).toBeVisible();
    await expect(page.locator("text=26.7")).toBeVisible();
  });

  test("deve navegar para Operação e Inferência e atualizar despacho CLP", async ({ page }) => {
    await page.goto("/");

    // Clica no ícone de Operação (Factory)
    await page.locator('button[title="Operação e Inferência"]').click();

    // Verifica tela de operação
    await expect(page.locator("text=Painel Operacional da Célula de Manufatura")).toBeVisible();
    await expect(page.locator("text=Telemetria dos Sensores de Processo")).toBeVisible();
    await expect(page.locator("text=Código CLP (HEX)")).toBeVisible();

    // Verifica que o estado inicial é nominal
    await expect(page.locator("text=0x1")).toBeVisible();
  });

  test("deve navegar para Visão Computacional e operar Simulador da Esteira", async ({ page }) => {
    await page.goto("/");

    // Clica no ícone de Visão Computacional
    await page.locator('button[title="Visão Computacional & Simulador"]').click();

    await expect(page.locator("text=Inspeção Óptica e Análise Termográfica")).toBeVisible();

    // Clica na aba do simulador
    await page.locator("text=Simulador da Linha de Fábrica").click();
    await expect(page.locator("text=Iniciar Linha")).toBeVisible();

    // Inicia a esteira
    await page.locator("text=Iniciar Linha").click();
    await expect(page.locator("text=Parar Esteira")).toBeVisible();

    // Para a esteira
    await page.locator("text=Parar Esteira").click();
    await expect(page.locator("text=Iniciar Linha")).toBeVisible();
  });

  test("deve navegar para Saneamento de Dados e executar o pipeline", async ({ page }) => {
    await page.goto("/");

    // Clica no ícone de Saneamento
    await page.locator('button[title="Saneamento de Dados"]').click();

    await expect(page.locator("text=Saneamento de Dados Industriais")).toBeVisible();
    await expect(page.locator("text=Executar Pipeline de Saneamento Completo")).toBeVisible();

    // Executa pipeline
    await page.locator("text=Executar Pipeline de Saneamento Completo").click();

    // Verifica conclusão
    await expect(page.locator("text=Pipeline concluído")).toBeVisible();
    await expect(page.locator("text=NaNs restantes: 0")).toBeVisible();
  });

  test("deve navegar para Saúde do Nó Edge e validar status ONLINE", async ({ page }) => {
    await page.goto("/");

    // Clica no ícone de Saúde do Nó
    await page.locator('button[title="Saúde do Nó Edge"]').click();

    await expect(page.locator("text=Monitoramento do Nó Edge")).toBeVisible();
    await expect(page.locator("text=ONLINE")).toBeVisible();
    await expect(page.locator("text=RandomForest Classifier")).toBeVisible();
    await expect(page.locator("text=94.80%")).toBeVisible();
  });
});
