# Rota Viva

App PWA gamificado para engajamento de produtores rurais nas Rotas de Integração Nacional/Regional.

## Sobre

Projeto do Ministério da Integração e do Desenvolvimento Regional (MIDR), executado pela FADEX/UFPI, com plataforma de gamificação Funifier.

- **Rota do Mel** (Piauí) — Gamificação *Colmeia Viva*
- **Pesca Artesanal** (Amapá) — Gamificação *Rio em Movimento*

## Estrutura

```
rota-viva/
├── app/          # Código fonte do PWA
├── doc/          # Documentação do projeto
│   └── PRD.md    # Product Requirements Document
└── README.md
```

## Stack

- Funifier Platform (backend de gamificação)
- PWA offline-first (HTML/CSS/JS)
- Netlify (hospedagem)

## Arquitetura

3 gamificações Funifier: Central (roteadora/auth) + Mel (PI) + Pesca (AP).
Frontend PWA único com roteamento por rota.
