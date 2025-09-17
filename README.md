# Simulador de Alocação em Sistemas de Arquivos

## Descrição
Este projeto simula métodos de alocação de arquivos em disco: **contígua**, **encadeada** e **indexada**. Permite operações de criação, extensão, remoção e leitura de arquivos, visualização do disco, diretório, i-nodes, métricas e cenários didáticos.

## Tecnologias
- Backend: Node.js + TypeScript + Express
- Frontend: React 19 + Zustand + Tailwind CSS + Vite
- Monorepo: pnpm workspace


## Instalação
1. Instale [Node.js](https://nodejs.org/) e [pnpm](https://pnpm.io/).
2. No diretório raiz, execute:
	```powershell
	pnpm install
	pnpm run dev
	```
3. Acesse o frontend em `http://localhost:5173` (ou porta informada no terminal).

## Como Utilizar o Simulador

### 1. Configuração Inicial
Na parte superior, defina:
- **Método de alocação:** Escolha entre Contígua, Encadeada ou Indexada.
- **Blocos:** Quantidade total de blocos do disco.
- **Tamanho do bloco:** Em bytes.
- **Custos:** Ajuste os custos de operações (Cseek, Cread, Cptr, CoverheadPtr).

### 2. Operações de Arquivo
Utilize o painel para:
- **Criar arquivo:** Informe nome e tamanho (em blocos).
- **Estender arquivo:** Acrescente blocos a um arquivo existente.
- **Excluir arquivo:** Remove o arquivo do disco.
- **Ler arquivo:** Simula leitura sequencial ou aleatória, destacando blocos lidos.

### 3. Visualização do Disco
Grade colorida representa os blocos do disco:
- Azul: Bloco ocupado
- Verde: Bloco encadeado
- Amarelo: Bloco índice/i-node
- Cinza: Livre
- Vermelho (borda): Bloco lido na operação

### 4. Tabela de Diretório
Lista todos os arquivos presentes, mostrando:
- Nome
- Tamanho (em blocos)
- Head/Tail (blocos inicial/final, conforme método)

### 5. Painel de i-nodes
Exibe detalhes dos arquivos no método indexado (blocos de índice e dados).

### 6. Métricas
Mostra indicadores do estado atual:
- **Ocupação:** Percentual de blocos usados
- **Maior Segmento:** Maior sequência de blocos livres
- **Buracos:** Quantidade de fragmentação externa
- **Fragmentação Interna:** Espaço desperdiçado dentro dos blocos
- **Avg Chain:** Comprimento médio das cadeias (encadeada)
- **Overhead:** Blocos de índice (indexada)


### 7. Cenários Didáticos
O simulador oferece cenários prontos para facilitar o entendimento dos efeitos dos métodos de alocação:

- **Fragmentação Contígua:**
	- Demonstra como a alocação contígua pode gerar buracos (fragmentação externa) após remoções e novas inserções. Arquivos são alocados em sequência, e a exclusão de arquivos intermediários cria espaços livres que podem não ser reutilizados eficientemente, dificultando a alocação de arquivos grandes.

- **Cadeias Longas:**
	- Simula o método encadeado, onde arquivos são compostos por blocos ligados por ponteiros. O cenário cria arquivos com cadeias extensas, evidenciando o custo de navegação sequencial e a dependência dos ponteiros para acesso aos dados.

- **Muitos Indexados:**
	- Cria diversos arquivos pequenos usando o método indexado. Cada arquivo possui um bloco de índice (i-node) que referencia seus blocos de dados. O cenário mostra o overhead de blocos de índice e a eficiência para arquivos pequenos.

---

## Explicação Teórica das Sessões

### Métodos de Alocação
- **Contígua:**
	- Os arquivos ocupam blocos consecutivos no disco. Proporciona acesso rápido e simples, mas sofre com fragmentação externa: após remoções, espaços livres podem não ser suficientes para novos arquivos grandes.
- **Encadeada:**
	- Cada bloco de um arquivo contém um ponteiro para o próximo. Permite alocação flexível, mas o acesso sequencial pode ser lento, pois depende da navegação pelos ponteiros. Fragmentação externa é reduzida, mas há overhead de ponteiros.
- **Indexada:**
	- Um bloco especial (i-node) armazena os endereços de todos os blocos do arquivo. Facilita acesso direto a qualquer parte do arquivo e reduz fragmentação externa, mas consome blocos extras para índices (overhead).

### Blocos
- O disco é dividido em unidades chamadas blocos. Cada bloco representa uma quantidade fixa de bytes. Arquivos são alocados em múltiplos blocos, e o tamanho do bloco influencia a eficiência e a fragmentação interna.

### Tamanho dos Blocos
- Blocos maiores reduzem o número de ponteiros/índices necessários, mas podem aumentar a fragmentação interna (espaço desperdiçado dentro do bloco). Blocos menores reduzem a fragmentação interna, mas aumentam o overhead de gerenciamento.

### Custos
- O simulador permite ajustar custos teóricos das operações:
	- **Cseek:** Custo de movimentação do cabeçote do disco (busca física).
	- **Cread:** Custo de leitura de um bloco.
	- **Cptr:** Custo de seguir um ponteiro (encadeada).
	- **CoverheadPtr:** Custo de acessar um bloco de índice/i-node (indexada).
Esses custos ajudam a comparar a eficiência dos métodos em diferentes cenários.

### Ações
- **Criar:** Aloca um novo arquivo no disco, reservando blocos conforme o método escolhido.
- **Estender:** Acrescenta blocos a um arquivo existente, simulando crescimento dinâmico.
- **Excluir:** Remove o arquivo e libera seus blocos, podendo gerar fragmentação.
- **Ler:** Simula leitura sequencial ou aleatória, destacando os blocos acessados e calculando custos teóricos.

### Tabela de Diretório
- Exibe todos os arquivos presentes no disco, mostrando nome, tamanho, bloco inicial (head) e bloco final (tail). No método indexado, o head representa o bloco de índice (i-node).

### Painel de i-nodes
- Mostra os detalhes dos arquivos no método indexado. Cada i-node lista os blocos de dados associados ao arquivo, facilitando o entendimento da estrutura de índices.

### Métricas
- **Ocupação:** Percentual de blocos ocupados no disco. Indica o uso do espaço.
- **Maior Segmento:** Tamanho do maior conjunto de blocos livres consecutivos. Reflete a capacidade de alocar arquivos grandes sem fragmentação.
- **Buracos:** Quantidade de regiões livres (fragmentação externa) entre blocos ocupados. Afeta a eficiência da alocação contígua.
- **Fragmentação Interna:** Espaço desperdiçado dentro dos blocos, quando o arquivo não utiliza todo o espaço do bloco.
- **Overhead:** Quantidade de blocos usados para índices/i-nodes (método indexado) ou ponteiros (encadeada). Representa o custo extra de gerenciamento dos métodos.

### 8. Limpar Simulador
Botão "Limpar" restaura o disco para o estado inicial (32 blocos, método contígua).

## Explicação de Cada Sessão

- **Configurações:** Permite ajustar parâmetros do disco e método de alocação.
- **Operações de Arquivo:** Realiza ações CRUD e leitura sobre arquivos simulados.
- **Visualização do Disco:** Mostra o estado atual dos blocos, com destaque para leituras.
- **Tabela de Diretório:** Lista arquivos e seus blocos principais.
- **Painel de i-nodes:** Detalha estrutura de arquivos indexados.
- **Métricas:** Exibe dados quantitativos do uso do disco e eficiência.
- **Cenários Didáticos:** Facilita demonstração de situações típicas de fragmentação e overhead.
- **Limpar:** Restaura o simulador para novo experimento.

## Endpoints REST principais
- `POST /api/disk/configure` — Configura disco
- `POST /api/disk/method` — Altera método de alocação
- `POST /api/disk/costs` — Altera custos
- `GET /api/state` — Estado atual
- `POST /api/scenarios/:name` — Aplica cenário didático
- `POST /api/files` — Cria arquivo
- `PATCH /api/files/:name/extend` — Estende arquivo
- `DELETE /api/files/:name` — Remove arquivo
- `POST /api/files/:name/read` — Lê arquivo

# File-System-Allocation-Simulator