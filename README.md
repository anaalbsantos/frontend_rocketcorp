# 🚀 RPE - Rocket Performance & Engagement

**Desafio Rocket Lab - v0**  
Projeto desenvolvido pela squad **Codrilha de Jeh Lima**

---

## 📘 Visão Geral

A **Rocket Corp** enfrenta dificuldades significativas em seu processo atual de avaliação de desempenho. O modelo manual, fragmentado e dependente de planilhas tem tornado as avaliações ineficientes, pouco padronizadas e sujeitas a erros e vieses.

Para resolver esses desafios, foi criado o **RPE - Rocket Performance & Engagement**, uma plataforma digital completa que centraliza e automatiza as avaliações de desempenho dos colaboradores, promovendo decisões mais justas, eficientes e alinhadas com a estratégia da empresa.

A plataforma também conta com **GenAI (Inteligência Artificial Generativa)** para auxiliar o comitê com insights automáticos, equalização de avaliações e análises comparativas.

---

## 🛠️ Tecnologias Utilizadas

**Frontend**
- React
- TypeScript
- TailwindCSS
- React Router
- React Hook Form
- React Hot Toast
- React Icons

**Backend**
- NestJS (TypeScript)
- SQLite
- JWT Authentication
- Class-validator
- Integração com GenAI
- Integração com ERP (Rocket Corp)

---

## ✅ MVPs Implementados

### MVP 1 - Digitalização Básica do Processo
- Cadastro de usuários e critérios por cargo/trilha/unidade
- Formulário digital para autoavaliação (1-5 com texto justificado)
- Formulário para avaliação de pares e líderes
- Formulário estruturado para indicação de referências técnicas e culturais
- Importação de histórico via Excel
- Painel básico para o RH acompanhar status de preenchimento
- Exportação simples das avaliações para o comitê

### MVP 2 - Avaliação Líder-Colaborador e Equalização Inicial
- Integração com ERP para obter líderes e alocações
- Painel de avaliação para líderes
- Painel para comitê de equalização com comparativo de notas
- Detecção de discrepâncias
- Resumos automáticos via GenAI
- Exportação final das avaliações pós-equalização
- Extração de "Brutal Facts" para mentores e colaboradores

### MVP 3 - Privacidade e Segurança
- Criptografia inteligente e granular dos dados
- Controle de acessos e permissões por perfil
- Logs de auditoria e segurança
- Restrição de acesso para desenvolvedores
- Monitoramento básico de segurança

---

## 🔧 MVPs Adicionais Implementados

### 🌡️ Pesquisa de Clima e Engajamento
- Pesquisas customizáveis de clima organizacional
- Formulários anônimos e seguros
- Dashboard com análise de sentimentos usando GenAI

### 🎯 Gestão de OKRs e PDIs
- Ferramenta de definição e acompanhamento de OKRs individuais
- Visões diferenciadas para mentor, padrinho e colaborador
- Sugestões inteligentes via GenAI para apoiar o desenvolvimento

### 🔔 Notificações e Transparência
- Notificações automáticas sobre prazos e pendências
- Avisos e comunicados centralizados no sistema

---

## 🧩 Critérios de Avaliação

As avaliações são baseadas nos seguintes pilares:

### **Comportamento**
- Sentimento de Dono
- Resiliência nas adversidades
- Organização no trabalho
- Capacidade de aprender
- Ser “team player”

### **Execução**
- Entregar com qualidade
- Atender aos prazos
- Fazer mais com menos
- Pensar fora da caixa

### **Gestão e Liderança**
- Gente
- Resultados
- Evolução da Rocket Corp

---

## 📦 Estrutura Modular

### 👤 Módulo do Colaborador
- Autoavaliação
- Avaliação de pares
- Indicação de referências
- Acompanhamento de status

### 👨‍💼 Módulo do Gestor
- Avaliação de liderados
- Visualização de histórico
- Acompanhamento de progresso da equipe

### 🧑‍💼 Módulo de RH
- Configuração de critérios por cargo/trilha/unidade
- Acompanhamento global do status das avaliações
- Importação e validação de históricos via Excel
- Gestão de pesquisas de clima

### 🧠 Módulo do Comitê de Equalização
- Painel com visão consolidada das avaliações
- Resumos e insights gerados por GenAI
- Ajuste e equalização das notas finais
- Exportações estruturadas para análise e registros

---

## 👨‍👩‍👧‍👦 Equipe

Projeto desenvolvido pela squad: **Codrilha de Jeh Lima**

- Ylson Santos - [Linkedin](https://www.linkedin.com/in/ylson-santos/)
- Maria Bezerra - 
- Ana Laura - [Linkedin](https://www.linkedin.com/in/ana-laura-albuquerque/)
- Luiz Schmalz - [Linkedin](https://www.linkedin.com/in/luizeduardoschmalz/)
- Paulo Ricardo - [Linkedin](https://www.linkedin.com/in/paulo-rago-a1a090219/)
- Vinicius Andrade - [Linkedin](https://www.linkedin.com/in/viniciusdeandradejordao/)

## ▶️ Como rodar o projeto

> Pré-requisitos:
> - Node.js 
> - pnpm instalado globalmente (`npm install -g pnpm`)

### 1. Clone o repositório

```bash
git clone https://github.com/anaalbsantos/frontend_rocketcorp.git
cd rpe
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Rode o servidor de desenvolvimento

```bash
pnpm dev
```

### 4. Acesse no navegador

Abra [http://localhost:5173](http://localhost:5173) para visualizar o app.

## 📄 Licença

---

Este projeto é parte de um desafio acadêmico e interno da Rocket Lab.  
Distribuição e uso externo estão sujeitos à autorização da empresa Visagio.
