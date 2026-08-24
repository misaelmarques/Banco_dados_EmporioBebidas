# Banco de Dados - Empório de Bebidas

Projeto desenvolvido para a disciplina de Banco de Dados da Universidade Federal do Agreste de Pernambuco (UFAPE).

## Integrantes do Grupo

- Rafael Carvalho Rodrigues
- Douglas Henrique Soares Salviano Da Silva
- Misael Salvador Marques
- Pedro Nunes Valeriano Duarte

**Universidade:** Universidade Federal do Agreste de Pernambuco (UFAPE)  
**Curso:** Bacharelado em Ciência da Computação  
**Disciplina:** Banco de Dados  
**Professora:** Priscilla Kelly Machado Vieira Azevedo

---

## Contexto do Projeto

Este projeto consiste na modelagem e implementação de um banco de dados relacional para o gerenciamento de um Empório de Bebidas / Adega.

O sistema contempla o cadastro e gerenciamento de:

- Clientes;
- Telefones dos clientes;
- Endereços;
- Categorias de produtos;
- Produtos;
- Especificações dos produtos;
- Vendas;
- Itens de cada venda.

O sistema também diferencia as vendas realizadas nas modalidades de **Entrega** e **Retirada**, permitindo o armazenamento do valor do frete para entregas e do número de retirada para pedidos retirados no balcão.

---

## Tecnologias Utilizadas

- **SGBD:** PostgreSQL 16
- **Container:** Docker
- **Imagem Docker:** `postgres:16-alpine`
- **Docker Compose:** versão 3.8
- **Linguagem utilizada para definição e povoamento:** SQL

---

## Configuração do Banco de Dados

O banco é executado em um container Docker.

| Configuração | Valor |
|---|---|
| SGBD | PostgreSQL 16 |
| Banco de dados | `emporio_bebidas` |
| Usuário | `admin_adega` |
| Senha | `admin_senha_123` |
| Porta do host | `5433` |
| Porta interna | `5432` |
| Container | `bd_adega_emporio` |

A porta `5433` do computador é direcionada para a porta padrão
`5432` do PostgreSQL dentro do container.

---

## Estrutura do Projeto

```text
Banco_dados_EmporioBebidas/
├── LICENSE
├── README.md
├── Sistema
│   ├── Dockerfile
│   ├── jsconfig.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── app
│       │   ├── api
│       │   │   ├── produtos
│       │   │   │   └── route.js
│       │   │   └── views
│       │   │       └── route.js
│       │   ├── layout.js
│       │   ├── produtos
│       │   │   └── page.js
│       │   └── relatorios
│       │       └── page.js
│       └── lib
│           └── db.js
├── docker-compose.yml
├── docs
│   ├── Diagrama_lógico.png
│   ├── Dicionário de Dados.pdf
│   └── Dicionário de Dados.pdfZone.Identifier
└── sql
    ├── 01_ddl.sql
    ├── 02_dml.sql
    └── 03_views.sql
```

### `01_ddl.sql`

Responsável pela criação das tabelas, chaves primárias, chaves estrangeiras, restrições e demais estruturas do banco de dados.

### `02_dml.sql`

Responsável pelo povoamento do banco de dados com os dados utilizados nos testes e consultas.

## Execução com Docker

Para executar o projeto, é necessário possuir o Docker e o Docker Compose instalados.

Na pasta raiz do projeto, execute:

```bash
docker-compose up -d
```

Para verificar o estado do container:

```bash
docker-compose ps
```

Para acessar o PostgreSQL diretamente pelo container:

```bash
docker exec -it bd_adega_emporio psql -U admin_adega -d emporio_bebidas
```

Para parar o ambiente:

```bash
docker-compose down
```

Caso seja necessário recriar o banco completamente do zero, incluindo o volume de dados:

```bash
docker-compose down -v
docker-compose up -d
```

Os scripts presentes em `sql/` são executados automaticamente durante a inicialização de um banco novo.

## Metodologia de Povoamento

Foi utilizada uma estratégia de **geração de dados sintéticos controlados**, com o objetivo de produzir um volume mínimo de registros que também apresentasse diversidade suficiente para a realização das consultas propostas na atividade. Os registros foram inseridos por meio de comandos `INSERT` no arquivo `02_dml.sql`, respeitando as chaves primárias, chaves estrangeiras e demais restrições definidas no DDL.

O povoamento atual contém:

| Tabela | Quantidade |
|---|---:|
| `categoria` | 15 |
| `produto` | 50 |
| `especificacao` | 50 |
| `cliente` | 50 |
| `cliente_telefone` | 18 |
| `endereco` | 50 |
| `venda` | 50 |
| `item_pedido` | 200 |

As vendas possuem diferentes produtos e quantidades, permitindo realizar consultas sobre produtos mais vendidos, valores de vendas, clientes, categorias e outras informações relacionadas ao funcionamento do empório.

Cada venda possui quatro itens de pedido no povoamento utilizado.

Os valores totais das vendas foram calculados a partir da soma dos valores dos respectivos itens:

```text
valor_total = Σ (quantidade × preco_unitario)
```

Obs.: valor_frete não entra no valor_total.

Também foram utilizadas as duas modalidades de venda:

- **Entrega:** possui valor de frete;
- **Retirada:** possui número de retirada.

A carga dos dados é realizada automaticamente pelo PostgreSQL durante a inicialização do container Docker, por meio do arquivo `02_dml.sql`.

## Modelo de Dados e Normalização

O banco foi desenvolvido a partir do modelo conceitual elaborado na etapa anterior da atividade e posteriormente transformado em um modelo lógico relacional.

O modelo foi estruturado de forma a atender, no mínimo, à **Segunda Forma Normal (2FN)**. As relações possuem atributos atômicos e não apresentam dependências parciais em relação às chaves primárias compostas.

Na tabela `item_pedido`, por exemplo, a chave primária é composta por:

```text
(id_venda, item_venda)
```

Os atributos `id_produto`, `quantidade` e `preco_unitario` dependem da identificação completa do item.

A tabela `cliente_telefone` também utiliza uma chave composta:

```text
(id_cliente, numero_telefone)
```

representando o atributo multivalorado de telefone associado ao cliente.

## Dicionário de Dados

O dicionário de dados do projeto apresenta a descrição das tabelas, atributos, tipos de dados, chaves, restrições e demais informações referentes à estrutura do banco.

O documento está disponível no diretório de documentação do projeto.

## Integridade e Restrições

Foram utilizadas restrições de integridade para garantir a consistência dos dados, incluindo:

- Chaves primárias (`PRIMARY KEY`);
- Chaves estrangeiras (`FOREIGN KEY`);
- Valores obrigatórios (`NOT NULL`);
- Valores únicos (`UNIQUE`);
- Restrições de domínio (`CHECK`);
- Exclusão em cascata (`ON DELETE CASCADE`) em relacionamentos específicos;
- Índices (`CREATE INDEX`) nas chaves estrangeiras que não são cobertas por `PRIMARY KEY` ou `UNIQUE`.

Entre as regras implementadas está a diferenciação entre vendas de **Entrega** e **Retirada**, garantindo que os atributos específicos de cada modalidade sejam preenchidos de acordo com o tipo da venda.

## Validação do Povoamento

Foram realizadas consultas para verificar a quantidade de registros e a consistência dos dados.

Também foi validado que o `valor_total` de cada venda corresponde à soma dos valores dos seus itens de pedido.

Além disso, o povoamento foi verificado para garantir a existência de quatro itens em cada uma das 50 vendas, totalizando 200 registros em `item_pedido`.