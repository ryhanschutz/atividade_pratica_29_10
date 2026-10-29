# Especificação de Imagens e Recursos Visuais (Assets)
**Projeto:** VulcanTech Smart Metals S.A.  
**Responsabilidade:** Usuário / Engenharia de Produto  
**Status:** Aguardando arquivos finais fornecidos pelo usuário  

> [!NOTE]
> O sistema foi projetado para operar com **tolerância total à ausência de imagens físicas**. Caso um arquivo ainda não esteja presente na pasta `assets/`, o sistema aplica tratamento de fallback com mensagens descritivas ou matrizes padrão de teste sem interrupção de serviço.

---

## Tabela de Especificação de Imagens

| Arquivo | Onde é Usado | Dimensões Sugeridas | Formato | Descrição do que Deve Mostrar |
|---|---|---|---|---|
| `assets/logo_vulcantech.svg` | Cabeçalho da documentação, Swagger UI (`/docs`) e relatórios de inspeção | 320 x 80 px | SVG (ou PNG transparente) | Logotipo industrial vetorizado da VulcanTech Smart Metals S.A., em tons de grafite, cromo e laranja industrial. |
| `assets/icon_favicon.png` | Favicon da API RESTful e interface do navegador | 64 x 64 px | PNG otimizado / ICO | Ícone minimalista simbolizando engrenagem de usinagem e circuito integrado de inteligência artificial. |
| `assets/samples/solda_cordao_referencia.png` | Calibração do algoritmo Canny e demonstração de inspeção óptica | 640 x 480 px | PNG otimizado | Fotografia de cordão de solda MIG/MAG contínuo, uniforme, sem trincas e sem porosidades aparentes. |
| `assets/samples/solda_porosidade_defeito.png` | Testes de reprovação de qualidade por porosidade na API | 640 x 480 px | PNG otimizado | Fotografia de cordão de solda apresentando descontinuidades e porosidades superficiais escuras. |
| `assets/samples/termografia_haz_nominal.png` | Validação de distribuição térmica segura da Zona Afetada pelo Calor | 320 x 240 px | PNG (mapa térmico JET / Ironbow) | Imagem infravermelha termográfica com gradiente térmico controlado e sem pontos quentes críticos. |
| `assets/samples/termografia_haz_sobreaquecida.png` | Teste de atuação emergencial por superaquecimento térmico da solda | 320 x 240 px | PNG (mapa térmico JET / Ironbow) | Imagem infravermelha termográfica exibindo ponto vermelho/magenta de sobreaquecimento acima do limite metalúrgico. |

---

## Diretrizes de Entrega para o Usuário
1. Salvar os arquivos exatamente com os nomes listados na coluna **Arquivo** dentro do diretório `assets/` ou `assets/samples/`.
2. Para imagens termográficas e de solda, priorizar contraste adequado entre o cordão/ponto quente e a chapa de fixação para garantir precisão nos limiares de segmentação.
