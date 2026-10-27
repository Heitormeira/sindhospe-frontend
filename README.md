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

O portal não tem servidor próprio: o navegador fala direto com o Firebase, e quem decide o que cada um pode ler são as **regras de segurança do Firestore**.

```
Navegador do usuário
        ↓  SDK web do Firebase (variáveis NEXT_PUBLIC_FIREBASE_*)
Frontend — Next.js + Tailwind CSS (Vercel)   ← este repositório
        ↓
Firebase Auth (uma conta por associado)  +  Firestore (dados pré-calculados)
        ↑  importação a cada competência do CNES (npm run importar)
Repositório sindhospe-backend — lê o PostgreSQL (Neon) em modo somente leitura
```

| Camada | Tecnologia | Hospedagem | Função |
|---|---|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS | Vercel | Interface: login, dashboard, relatório e demais abas |
| Login | Firebase Authentication | Firebase (plano Spark) | Uma conta por associado; o CNES vai como *claim* no token |
| Dados | Cloud Firestore | Firebase (plano Spark) | Indicadores já calculados: ficha de cada associado, séries de mercado, visão geral |
| Origem | PostgreSQL (Neon) + script de importação | máquina da equipe | Dados do CNES/DATASUS e base de associados; o script calcula e publica no Firestore |

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
    ├── firebase.js          # Inicialização do Firebase no navegador
    ├── sessao.js            # Login/logout com Firebase Auth e sessão atual (cnes + nome)
    ├── dados.js             # Leitura do Firestore: uma função por tela (mesmo formato da antiga API)
    ├── busca.mjs            # Normalização da busca do login (testada com `npm test`)
    ├── api-error.js         # Mensagens de erro em português
    ├── components.jsx       # Cores do SINDHOSPE e componentes reutilizáveis
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

- Cada associado tem **conta própria** no Firebase Auth, e as regras do Firestore só deixam ler a ficha do CNES da conta logada. Isso é verificado pelo Firebase, não pelo navegador.
- A busca do login devolve no máximo 8 nomes por consulta (limite imposto pelas regras) e nunca expõe CNPJ.
- Dados de mercado e visão geral só para quem está logado.
- **Limitação desta fase de demonstração:** todas as contas usam a mesma senha de demonstração. O modelo já é o de produção: basta definir uma senha por associado.
- O `firebaseConfig` (variáveis `NEXT_PUBLIC_FIREBASE_*`) não é segredo; ele só identifica o projeto.

## Como rodar localmente

Pré-requisito: Node.js.

Crie um arquivo `.env.local` (já ignorado pelo git):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sindhospe-portal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sindhospe-portal
NEXT_PUBLIC_FIREBASE_APP_ID=...
# opcional: mostra a senha de demonstração na tela de login
NEXT_PUBLIC_SENHA_DEMO_DICA=123456
```

Os valores estão no console do Firebase, em Configurações do projeto → Seus apps.

```bash
npm install
npm run dev
npm test       # testes da busca
```

## Deploy na Vercel

1. Conecte este repositório a um projeto na Vercel.
2. Em **Settings → Environment Variables**, crie as variáveis do `.env.local` acima para **Production** e **Preview**.
3. No console do Firebase, em **Authentication → Configurações → Domínios autorizados**, adicione o domínio da Vercel (ex.: `sindhospe-frontend.vercel.app`).
4. Faça um **Redeploy**: mudanças de variável de ambiente só entram em vigor em um deploy novo.

Os dados são atualizados pelo repositório `sindhospe-backend` (`npm run importar`), não por este.
