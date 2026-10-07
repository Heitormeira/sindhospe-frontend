# Portal SINDHOSPE — Frontend

Interface web do **Portal SINDHOSPE**, desenvolvida no Projeto Integrador (UNICAP + SINDHOSPE). Cada associado entra com o próprio estabelecimento e vê indicadores de estrutura (leitos, serviços, habilitações), comparativos com o município e o estado e um relatório de evolução, tudo calculado a partir de dados reais do CNES/DATASUS.

- **Backend (API):** repositório `sindhospe-backend` — https://sindhospe-backend.onrender.com
- **Hospedagem do frontend:** Vercel

## Equipe

| Aluno | RA |
|---|---|
| Heitor Meira | 852542 |
| Heitor Farias | 853409 |
| Caio Bandeira | 853860 |
| Marcelo Caldas | 852309 |
| Diogo André Ferreira | _a preencher_ |

## Arquitetura

O sistema é dividido em três camadas independentes:

```
Navegador do usuário
        ↓
Frontend — Next.js + Tailwind CSS (Vercel)   ← este repositório
        ↓  fetch() para a URL definida em NEXT_PUBLIC_API_URL
Backend — Node.js + Express (Render)
        ↓  consultas SQL
Banco de dados — PostgreSQL (Neon)
```

| Camada | Tecnologia | Hospedagem | Função |
|---|---|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS | Vercel | Interface: login, dashboard, relatório e demais abas |
| Backend | Node.js, Express | Render | API REST: recebe os pedidos, aplica as regras e consulta o banco |
| Banco | PostgreSQL | Neon | Dados dos associados e dados do CNES/DATASUS |

O frontend nunca acessa o banco diretamente: toda informação vem da API do backend.

## Telas

| Rota | Tela |
|---|---|
| `/login` | Acesso do associado: busca do estabelecimento pelo nome e senha |
| `/dashboard` | **Meu estabelecimento:** indicadores em cartões, comparativo com município e estado, composição dos leitos (alternável entre barras e pizza) e perfil de atendimento |
| `/relatorio` | Relatório do próprio estabelecimento: evolução da capacidade, composição dos leitos e leitura automática dos números |
| `/visao-geral`, `/mercado`, `/evolucao`, `/perfil` | Demais abas do menu |

## Estrutura do projeto

```
sindhospe-frontend/
├── public/                  # Arquivos estáticos (logotipo do SINDHOSPE)
└── src/app/
    ├── layout.js            # Layout raiz: envolve todas as páginas no NavClient
    ├── nav-client.jsx       # Barra de acessibilidade, cabeçalho, menu, rodapé e bloqueio de páginas sem login
    ├── components.jsx       # Cores do SINDHOSPE, URL da API, funções de sessão e componentes reutilizáveis
    ├── globals.css          # Estilos globais, fonte Poppins e regras de acessibilidade
    ├── login/page.js
    ├── dashboard/page.js
    ├── relatorio/page.js
    ├── visao-geral/
    ├── mercado/
    ├── evolucao/
    └── perfil/
```

Cada pasta dentro de `src/app` vira uma rota do site (roteamento do Next.js App Router).

## Acessibilidade

- Controle de tamanho da fonte (A-, A, A+) e modo de **alto contraste**, salvos no navegador.
- Link "Pular para o conteúdo" para navegação por teclado.
- Alvos de clique grandes, tipografia legível e contraste pensado para quem usa o portal no computador.

## Segurança e privacidade

- A busca de estabelecimentos é feita **no servidor**: o navegador nunca recebe a lista completa de associados, só os resultados do que foi digitado.
- O relatório e o dashboard mostram sempre o estabelecimento da sessão logada.
- **Limitação desta fase de demonstração:** o login usa uma senha única de demonstração e guarda a sessão no `localStorage`, sem token validado pelo servidor. Em uma versão final, cada associado teria login individual.

## Como rodar localmente

Pré-requisito: Node.js.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O frontend precisa da API rodando: por padrão ele chama `http://localhost:3001` (backend local). Para apontar para outra API, defina a variável de ambiente:

```bash
NEXT_PUBLIC_API_URL=https://sindhospe-backend.onrender.com
```

## Deploy na Vercel

1. Conecte este repositório a um projeto na Vercel.
2. Em **Settings → Environment Variables**, crie `NEXT_PUBLIC_API_URL` com o endereço do backend (`https://sindhospe-backend.onrender.com`, sem barra no final) para o ambiente **Production**.
3. Faça um **Redeploy**: mudanças de variável de ambiente só entram em vigor em um deploy novo.

Observação: o backend gratuito no Render "dorme" após um tempo sem uso, e a primeira requisição depois disso pode levar cerca de 50 segundos.
