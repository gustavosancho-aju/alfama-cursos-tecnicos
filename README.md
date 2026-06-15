# 🏆 Copa do Mundo 2026 — Painel Visual

Painel local (roda direto no navegador, sem servidor) para acompanhar a Copa do Mundo FIFA 2026.

## Como abrir
Dê duplo clique em **`index.html`** (ou abra no navegador). Pronto, não precisa instalar nada.

## O que tem
| Aba | Função |
|-----|--------|
| ⚽ **Resultados** | Todos os jogos já realizados, por data |
| 📊 **Grupos** | Tabela ao vivo dos 12 grupos (pontos, saldo, classificação) |
| 🗓️ **Calendário** | Todos os 72 jogos da fase de grupos, jogados e a disputar |
| 🔮 **Simulador** | Preencha placares hipotéticos e veja a tabela mudar na hora |
| 🎯 **Probabilidades** | Chance de classificação de cada time (3.000 simulações Monte Carlo) + nível de dificuldade dos próximos jogos |
| 🏆 **Mata-mata** | Chaveamento oficial (32 avos → final) com classificados provisórios e campeão projetado pelo modelo |
| 👟 **Artilharia** | Ranking de goleadores da Copa |

> 🕒 O calendário mostra os horários em **horário de Brasília**.
> ☀️/🌙 Botão no topo direito alterna **tema claro/escuro** (preferência salva).
> 🔄 Botão **"Atualizar tudo"** gera o pedido pronto pra me acionar a buscar resultados/gols do dia.

## Como atualizar os resultados (agente de IA)
Os dados ficam em **`data.js`**. Para atualizar, peça ao Claude Code:

> "Morgan, busca os resultados de hoje e atualiza o data.js"

O agente pesquisa na web e adiciona os novos placares no array `RESULTS`.
A tabela, o calendário e as probabilidades se recalculam sozinhos.

## Arquivos
- `index.html` — estrutura da página
- `styles.css` — visual (usa variáveis de cor da marca)
- `config.js` — **🎨 marca (white-label):** cores, logo, slogan, CRECI + posts laterais (`ADS`, `NEWS`)
- `data.js` — **base de dados da Copa** (times, grupos, ratings, calendário, resultados, artilharia)
- `app.js` — lógica (classificação, simulador, Monte Carlo, dificuldade, mata-mata, white-label)

## 🎨 Criar um projeto novo para outro cliente (white-label)
A lógica da Copa é o "motor" e **não muda**. Tudo que é da marca está em **`config.js`**:

1. **Copie a pasta** do projeto.
2. Edite **só o `config.js`**:
   - `BRAND.cores` → `principal`, `escura`, `destaque` (muda o tema inteiro).
   - `BRAND.nome`, `BRAND.slogan`, `BRAND.registro` e `BRAND.logo` (cole o SVG ou `<img>` do cliente).
   - `ADS` e `NEWS` → os posts laterais daquele cliente.
3. (Opcional) Suba num repositório novo no GitHub e importe no Vercel → cada cliente, sua URL.

Pronto — mesmo sistema, outra marca. Nenhuma outra alteração é necessária.

## Notas
- Os **ratings** das seleções (`data.js`) alimentam as probabilidades e a dificuldade. Pode ajustar à vontade.
- Seus palpites do simulador ficam salvos no navegador (localStorage).
- Vagas de playoff já resolvidas: Czéquia (A), Bósnia (B), Türkiye (D), Suécia (F), Iraque (I), RD Congo (K).
