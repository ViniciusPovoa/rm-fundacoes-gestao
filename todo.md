# RM Fundações - Gestão de Obras - TODO

## Banco de Dados
- [x] Criar tabela `clientes` (id, nome, telefone, email, documento, endereço, timestamps)
- [x] Criar tabela `obras` (id, nome, cliente_id, localização, data_início, data_fim, status, timestamps)
- [x] Criar tabela `serviços` (id, obra_id, tipo, descrição, valor_previsto, valor_realizado, timestamps)
- [x] Criar tabela `despesas` (id, obra_id, tipo, descrição, valor, data, timestamps)
- [x] Criar tabela `receitas` (id, obra_id, valor, data, descrição, timestamps)
- [x] Criar tabela `equipamentos` (id, nome, tipo, custo_uso, timestamps)
- [x] Criar tabela `equipamentos_obras` (id, equipamento_id, obra_id, data_início, data_fim, timestamps)

## Backend PHP - API REST
- [x] Configurar estrutura de pastas (controllers, models, config, utils)
- [x] Criar classe de conexão com MySQL
- [x] Implementar CRUD de Clientes (GET, POST, PUT, DELETE)
- [x] Implementar CRUD de Obras (GET, POST, PUT, DELETE)
- [x] Implementar CRUD de Serviços (GET, POST, PUT, DELETE)
- [x] Implementar CRUD de Despesas (GET, POST, PUT, DELETE)
- [x] Implementar CRUD de Receitas (GET, POST, PUT, DELETE)
- [x] Implementar CRUD de Equipamentos (GET, POST, PUT, DELETE)
- [x] Implementar CRUD de Equipamentos-Obras (GET, POST, PUT, DELETE)
- [x] Criar endpoints de cálculos financeiros por obra (total_gasto, total_recebido, lucro)
- [x] Criar endpoint de dashboard (totais e resumos)
- [x] Implementar tratamento de erros e validação de dados

## Frontend React - Telas
- [x] Criar layout base com navegação lateral e tema sofisticado
- [x] Criar página de Dashboard com gráficos financeiros
- [x] Criar tela de listagem de Clientes
- [x] Criar formulário de cadastro/edição de Clientes
- [x] Criar tela de listagem de Obras
- [x] Criar formulário de cadastro/edição de Obras
- [x] Criar tela de listagem de Serviços (por obra)
- [x] Criar formulário de cadastro/edição de Serviços
- [x] Criar tela de listagem de Despesas (por obra)
- [x] Criar formulário de cadastro/edição de Despesas
- [x] Criar tela de listagem de Receitas (por obra)
- [x] Criar formulário de cadastro/edição de Receitas
- [x] Criar tela de listagem de Equipamentos
- [x] Criar formulário de cadastro/edição de Equipamentos
- [x] Criar tela de vinculação de Equipamentos com Obras (endpoints implementados no backend)

## Controle Financeiro
- [x] Implementar cálculo automático de total gasto por obra
- [x] Implementar cálculo automático de total recebido por obra
- [x] Implementar cálculo automático de lucro/prejuízo por obra
- [x] Criar visualização de resumo financeiro por obra

## Dashboard e Relatórios
- [x] Criar dashboard com total de obras
- [x] Criar dashboard com obras em andamento
- [x] Criar dashboard com lucro total
- [x] Implementar gráficos de receita vs despesa
- [x] Implementar gráficos de lucro por obra
- [x] Criar relatório por obra (PDF)
- [x] Criar relatório financeiro geral (PDF)
- [x] Implementar exportação de tabelas em PDF
- [x] Implementar exportação de dados em CSV/Excel
## Autenticação
- [x] Criar página de Login com formulário
- [x] Implementar autenticação local (admin/admin123)
- [x] Adicionar token/sessão no localStorage
- [x] Proteger rotas com PrivateRoute
- [x] Adicionar botão de logout
- [x] Redirecionar para login se não autenticado

## Melhorias - Dashboard Avançada
- [x] Adicionar gráficos de receita vs despesa por período
- [x] Criar gráfico de margem de lucro por obra
- [x] Implementar gráfico de progresso de obras (% concluído)
- [x] Adicionar KPIs: receita total, despesa total, lucro líquido, ticket médio
- [x] Criar tabela de obras com status e filtros rápidos
- [ ] Adicionar comparativo mês anterior vs mês atual
- [x] Implementar alertas de obras com prejuízo
- [ ] Criar visão de fluxo de caixa

## Melhorias - Gerador de Contratos
- [x] Criar página de geração de contratos
- [x] Implementar filtros de obras para seleção
- [x] Criar template de contrato profissional em PDF
- [x] Adicionar campos dinâmicos (cliente, obra, serviços, valores)
- [ ] Implementar assinatura digital/eletrônica
- [ ] Adicionar histórico de contratos gerados
- [ ] Permitir customização de templates

## Melhorias - Validações e Filtros
- [x] Adicionar validação de CPF/CNPJ
- [x] Implementar validação de email
- [ ] Criar filtros avançados em todas as listagens
- [ ] Adicionar busca por texto em listagens
- [ ] Implementar páginação
- [ ] Adicionar ordenação por colunas
- [x] Criar alertas de validação em formulários

## Melhorias - Design e UX
- [x] Refatorar componentes com design system
- [x] Melhorar paleta de cores e tipografia
- [x] Adicionar loading states em todas as operações
- [x] Implementar toasts de sucesso/erro
- [x] Criar modais de confirmação
- [x] Adicionar animações suaves
- [x] Melhorar responsividade mobile
- [ ] Adicionar dark mode

## Integração e Testes
- [x] Testar conexão Frontend-Backend
- [x] Testar todos os CRUDs
- [x] Testar cálculos financeiros
- [x] Testar exportação de relatórios
- [x] Validar responsividade em mobile
- [x] Corrigir bugs encontrados
- [x] Criar README com instruções de instalação
- [x] Documentar estrutura do projeto
- [x] Documentar endpoints da API
- [x] Criar guia de uso do sistema
