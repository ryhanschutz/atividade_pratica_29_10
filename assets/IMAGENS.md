# Especificação de Imagens e Recursos Visuais (Assets)

**Projeto:** VulcanTech Smart Metals S.A.  
**Responsabilidade:** Usuário / Engenharia de Produto  
**Status:** Amostras industriais integradas e ativas no simulador em tempo real  

> [!NOTE]
> O sistema opera com tolerância total à ausência de imagens físicas. As amostras adicionadas pelo operador em formato PNG de alta resolução encontram-se catalogadas e prontas para uso tanto nos testes estáticos quanto no simulador automático de esteira industrial.

---

## Tabela de Especificação de Imagens

| Arquivo | Onde é Usado | Dimensões | Formato | Descrição do que Mostra |
| --- | --- | --- | --- | --- |
| `assets/logo_vulcantech.svg` | Cabeçalho e interface Streamlit | 52 x 52 px | SVG inline | Logotipo industrial vetorizado VulcanTech com geometria de solda e forno em laranja industrial. |
| `data/samples/solda_aprovada.png` | Inspeção óptica de cordão | 1536 x 1024 px | PNG | Cordão de solda MIG contínuo e uniforme (aprovado na norma AWS D1.1 / ISO 5817). |
| `data/samples/solda_porosa_reprovada.png` | Detecção de porosidades | 1536 x 1024 px | PNG | Cordão de solda apresentando porosidades escuras e cavidades superficiais. |
| `data/samples/soldadura_defeituosa_oficina_retro.png` | Simulador de fábrica e inspeção | 1536 x 1024 px | PNG | Soldagem com descontinuidades acentuadas e trincas visíveis em oficina retro. |
| `data/samples/soldadura_industrial_imperfeita_pixel_art.png` | Simulador e detecção de bordas | 1536 x 1024 px | PNG | Solda industrial imperfeita com variações de textura e bordas irregulares. |
| `data/samples/termografia_haz_critica.png` | Análise termográfica e temperatura | 1536 x 1024 px | PNG | Termograma com superaquecimento na Zona Afetada pelo Calor (HAZ) acima de 900°C. |
| `data/samples/mapa_termico_pixelado_soldadura.png` | Métrica de temperatura por pixel | 1536 x 1024 px | PNG | Mapa térmico em pseudocolor de alta densidade para avaliação de temperatura por pixel. |

---

## Diretrizes de Entrega para o Usuário

1. Salvar os novos arquivos na raiz ou na pasta `data/samples/`.
2. O simulador de esteira reconhece e roda automaticamente todas as amostras em ciclo contínuo.
3. Para termografia e inspeção geométrica, as imagens aceitam uploads diretos pela interface web em formatos PNG, JPG e JPEG.
