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
- [ ] Criar tela de listagem de Serviços (por obra)
- [ ] Criar formulário de cadastro/edição de Serviços
- [ ] Criar tela de listagem de Despesas (por obra)
- [ ] Criar formulário de cadastro/edição de Despesas
- [ ] Criar tela de listagem de Receitas (por obra)
- [ ] Criar formulário de cadastro/edição de Receitas
- [x] Criar tela de listagem de Equipamentos
- [x] Criar formulário de cadastro/edição de Equipamentos
- [ ] Criar tela de vinculação de Equipamentos com Obras

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

## Integração e Testes
- [ ] Testar conexão Frontend-Backend
- [ ] Testar todos os CRUDs
- [ ] Testar cálculos financeiros
- [ ] Testar exportação de relatórios
- [ ] Validar design visual em diferentes resoluções

## Documentação
- [ ] Criar README com instruções de instalação
- [ ] Documentar estrutura do projeto
- [ ] Documentar endpoints da API
- [ ] Criar guia de uso do sistema
