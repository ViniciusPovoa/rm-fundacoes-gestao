# RM Fundações - Sistema de Gestão de Obras

Um sistema completo de gestão de obras de engenharia desenvolvido com **PHP (Legado)** no backend, **React** no frontend e **MySQL** no banco de dados.

## 🎯 Características

- **Dashboard Inteligente**: Visualização em tempo real de receitas, despesas e lucro por obra
- **Gestão de Clientes**: Cadastro e gerenciamento completo de clientes
- **Gestão de Obras**: Controle de obras com status (planejamento, em andamento, finalizada)
- **Serviços por Obra**: Registro de serviços executados com valores previstos e realizados
- **Controle Financeiro**: Registro automático de receitas e despesas por obra
- **Equipamentos**: Cadastro de equipamentos e vinculação com obras
- **Relatórios**: Geração de relatórios financeiros exportáveis em PDF e CSV
- **Interface Elegante**: Design sofisticado e intuitivo com navegação lateral

## 📋 Pré-requisitos

- **PHP** 7.4 ou superior
- **MySQL** 5.7 ou superior
- **Node.js** 14+ e **npm** ou **yarn**
- **Composer** (opcional, para gerenciamento de dependências PHP)

## 🚀 Instalação

### 1. Configurar o Banco de Dados

```bash
# Acesse o MySQL
mysql -u root -p

# Importe o arquivo SQL
source /caminho/para/database.sql

# Ou execute manualmente os comandos do arquivo database.sql
```

### 2. Configurar o Backend PHP

```bash
# Navegue até a pasta do backend
cd /home/ubuntu/rm-fundacoes-gestao/backend

# Atualize as credenciais do banco em config/Database.php
# Edite o arquivo e configure:
# - $host = 'localhost'
# - $db = 'rm_fundacoes'
# - $user = 'root'
# - $password = '' (sua senha)
```

### 3. Configurar o Frontend React

```bash
# Navegue até a pasta do frontend
cd /home/ubuntu/rm-fundacoes-gestao/client

# Instale as dependências
npm install

# Configure a URL da API em src/config/api.ts
# Atualize: const API_BASE_URL = 'http://localhost:8000/backend/api.php'
```

### 4. Executar o Servidor

#### Backend PHP

```bash
# Usando PHP built-in server
cd /home/ubuntu/rm-fundacoes-gestao
php -S localhost:8000

# Ou configure um VirtualHost no Apache/Nginx
```

#### Frontend React

```bash
cd /home/ubuntu/rm-fundacoes-gestao/client
npm start

# A aplicação abrirá em http://localhost:3000
```

## 📁 Estrutura do Projeto

```
rm-fundacoes-gestao/
├── backend/
│   ├── config/
│   │   └── Database.php          # Configuração de conexão com MySQL
│   ├── controllers/
│   │   ├── ClienteController.php
│   │   ├── ObraController.php
│   │   ├── ServicoController.php
│   │   ├── DespesaController.php
│   │   ├── ReceitaController.php
│   │   ├── EquipamentoController.php
│   │   └── DashboardController.php
│   ├── models/
│   │   ├── BaseModel.php         # Classe base com CRUD reutilizável
│   │   ├── Cliente.php
│   │   ├── Obra.php
│   │   ├── Servico.php
│   │   ├── Despesa.php
│   │   ├── Receita.php
│   │   ├── Equipamento.php
│   │   └── EquipamentoObra.php
│   ├── utils/
│   │   ├── Response.php          # Padronização de respostas JSON
│   │   ├── Validator.php         # Validação de dados
│   │   └── FinanceCalculator.php # Cálculos financeiros automáticos
│   └── api.php                   # Roteador principal da API
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx        # Layout com navegação lateral
│   │   ├── config/
│   │   │   └── api.ts            # Cliente HTTP para a API
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Clientes.tsx
│   │   │   ├── Obras.tsx
│   │   │   ├── Equipamentos.tsx
│   │   │   └── Relatorios.tsx
│   │   ├── styles/
│   │   │   ├── layout.css
│   │   │   ├── dashboard.css
│   │   │   ├── crud.css
│   │   │   └── relatorios.css
│   │   └── App.tsx               # Componente principal
│   └── package.json
├── database.sql                  # Schema e dados de exemplo
└── README.md                     # Este arquivo
```

## 🔌 API REST - Endpoints

### Clientes
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/{id}` - Obter um cliente
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/{id}` - Atualizar cliente
- `DELETE /api/clientes/{id}` - Deletar cliente
- `GET /api/clientes/com-obras` - Listar clientes com total de obras

### Obras
- `GET /api/obras` - Listar todas as obras
- `GET /api/obras/{id}` - Obter uma obra
- `POST /api/obras` - Criar nova obra
- `PUT /api/obras/{id}` - Atualizar obra
- `DELETE /api/obras/{id}` - Deletar obra
- `GET /api/obras/cliente/{cliente_id}` - Obras de um cliente
- `GET /api/obras/status/{status}` - Obras por status
- `GET /api/obras/{id}/financeiro` - Resumo financeiro da obra

### Serviços
- `GET /api/servicos` - Listar serviços
- `POST /api/servicos` - Criar serviço
- `PUT /api/servicos/{id}` - Atualizar serviço
- `DELETE /api/servicos/{id}` - Deletar serviço
- `GET /api/servicos/obra/{obra_id}` - Serviços de uma obra

### Despesas
- `GET /api/despesas` - Listar despesas
- `POST /api/despesas` - Criar despesa
- `PUT /api/despesas/{id}` - Atualizar despesa
- `DELETE /api/despesas/{id}` - Deletar despesa
- `GET /api/despesas/obra/{obra_id}` - Despesas de uma obra
- `GET /api/despesas/obra/{obra_id}/total` - Total de despesas
- `GET /api/despesas/obra/{obra_id}/por-tipo` - Despesas por tipo

### Receitas
- `GET /api/receitas` - Listar receitas
- `POST /api/receitas` - Criar receita
- `PUT /api/receitas/{id}` - Atualizar receita
- `DELETE /api/receitas/{id}` - Deletar receita
- `GET /api/receitas/obra/{obra_id}` - Receitas de uma obra
- `GET /api/receitas/obra/{obra_id}/total` - Total de receitas

### Equipamentos
- `GET /api/equipamentos` - Listar equipamentos
- `POST /api/equipamentos` - Criar equipamento
- `PUT /api/equipamentos/{id}` - Atualizar equipamento
- `DELETE /api/equipamentos/{id}` - Deletar equipamento
- `GET /api/equipamentos/obra/{obra_id}` - Equipamentos de uma obra
- `POST /api/equipamentos/obra/{obra_id}/vincular` - Vincular equipamento
- `DELETE /api/equipamentos/obra/{obra_id}/desvincular/{equipamento_id}` - Desvincular

### Dashboard
- `GET /api/dashboard/resumo-geral` - Resumo geral do sistema
- `GET /api/dashboard/lucro-por-obra` - Lucro por obra
- `GET /api/dashboard/obras-status` - Contagem por status
- `GET /api/dashboard/receitas-despesas` - Comparação receitas vs despesas
- `GET /api/dashboard/despesas-por-tipo` - Despesas agrupadas por tipo

## 💡 Funcionalidades Principais

### Dashboard
- KPIs com total de obras, receitas, despesas e lucro
- Gráficos de receitas vs despesas por obra
- Gráficos de lucro/prejuízo
- Distribuição de obras por status

### Gestão de Clientes
- Cadastro com nome, telefone, email, documento e endereço
- Listagem com busca e filtros
- Edição e exclusão de clientes
- Visualização de obras associadas

### Gestão de Obras
- Cadastro com cliente, localização, datas e status
- Controle de status (planejamento, em andamento, finalizada)
- Resumo financeiro automático
- Listagem com filtros por cliente e status

### Controle Financeiro
- Registro de despesas por tipo (material, mão de obra, equipamento)
- Registro de receitas
- Cálculo automático de lucro/prejuízo
- Margem de lucro por obra

### Relatórios
- Relatório financeiro geral
- Detalhamento por obra
- Exportação em PDF
- Exportação em CSV

## 🎨 Design e UX

- **Tema Sofisticado**: Gradientes azuis e roxos com design moderno
- **Navegação Lateral**: Menu colapsável para melhor uso do espaço
- **Responsivo**: Adaptado para desktop, tablet e mobile
- **Acessibilidade**: Contraste adequado e navegação por teclado
- **Feedback Visual**: Animações suaves e estados de carregamento

## 🔒 Segurança

- Validação de dados no backend e frontend
- Prepared statements para prevenir SQL injection
- CORS habilitado para requisições da API
- Tratamento de erros robusto

## 📊 Banco de Dados

### Tabelas Principais
- **clientes**: Informações dos clientes
- **obras**: Dados das obras
- **servicos**: Serviços executados por obra
- **despesas**: Registro de despesas
- **receitas**: Registro de receitas
- **equipamentos**: Cadastro de equipamentos
- **equipamentos_obras**: Relacionamento M:N entre equipamentos e obras

### Views
- **vw_resumo_financeiro_obras**: Resumo financeiro por obra
- **vw_resumo_geral_financeiro**: Resumo geral do sistema

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando
- Confirme as credenciais em `backend/config/Database.php`
- Verifique se o banco `rm_fundacoes` foi criado

### Erro CORS na API
- Certifique-se de que o backend está rodando em `http://localhost:8000`
- Verifique a URL da API em `client/src/config/api.ts`

### Erro ao exportar relatórios
- Verifique se há obras cadastradas
- Confirme se há dados de receitas e despesas

## 📝 Licença

Este projeto é fornecido como está para uso interno da RM Fundações.

## 👥 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**RM Fundações - Sistema de Gestão de Obras**  
Desenvolvido com ❤️ para otimizar a gestão de projetos de engenharia.
