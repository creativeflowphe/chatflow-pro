# Guia do Editor de Fluxo - ChatFlow Pro

## Funcionalidades Implementadas

### 1. Edição de Nós no Canvas

Todos os nós agora possuem capacidade de edição inline, inspirado no ManyChat:

#### Nó de Mensagem (Verde)
- **Editar**: Clique no ícone de lápis para editar o conteúdo da mensagem
- **Campo editável**: Textarea com 3 linhas para mensagens mais longas
- **Botões**: Salvar (verde) e Cancelar (cinza)

#### Nó de Gatilho (Azul)
- **Editar**: Modifique as palavras-chave que acionam o fluxo
- **Formato**: Palavras separadas por vírgula (ex: "oi, olá, help")
- **Auto-parse**: Sistema separa automaticamente as palavras

#### Nó de Condição (Amarelo)
- **Editar**: Defina a condição If/Else
- **Exemplo**: "Tag contém 'cliente'", "Usuário respondeu em menos de 5min"

#### Nó de Ação (Roxo)
- **Editar**: Configure detalhes da ação
- **Exemplos**: Nome da tag, endpoint da API, nome da sequência

#### Nó de Broadcast (Roxo claro)
- **Editar**: Personalize a mensagem do broadcast
- **Tags**: Visualize as tags alvo do broadcast

### 2. Ações Rápidas nos Nós

Ao passar o mouse sobre qualquer nó, aparece uma barra de ferramentas no topo com 3 ícones:

#### Ícone de Lápis (Azul) - Editar
- Ativa o modo de edição inline do nó
- Campos específicos para cada tipo de nó
- Validação automática antes de salvar

#### Ícone de Copiar (Cinza) - Duplicar
- Cria uma cópia exata do nó
- Posiciona automaticamente +50px à direita e abaixo
- Mantém todas as configurações do nó original
- Toast de confirmação: "Nó duplicado!"

#### Ícone de Lixeira (Vermelho) - Excluir
- Remove o nó do canvas
- Remove também todas as conexões relacionadas
- Toast de confirmação: "Nó excluído!"

### 3. Experiência do Usuário (UX)

#### Feedback Visual
- **Hover state**: Barra de ações aparece suavemente ao passar o mouse
- **Estados de edição**: Visual diferenciado quando em modo de edição
- **Cores consistentes**: Cada tipo de nó tem sua cor característica
- **Tooltips**: Texto de ajuda ao passar o mouse nos botões

#### Toasts de Notificação
- **Sucesso** (verde): Confirmações de ações bem-sucedidas
- **Erro** (vermelho): Alertas de problemas
- **Duração**: 3-4 segundos para leitura confortável

#### Salvamento de Dados
- Todas as edições são mantidas no estado do React Flow
- Clique em "Publicar" no topo para salvar no Supabase
- Botão mostra "Salvando..." durante o processo

### 4. Como Usar

#### Criar um Fluxo Básico:
1. Arraste um nó "Mensagem Recebida" da paleta (já criado por padrão)
2. Passe o mouse sobre ele e clique no lápis para editar keywords
3. Arraste um nó "Enviar Mensagem" para o canvas
4. Passe o mouse, clique no lápis e escreva sua mensagem
5. Conecte os nós arrastando do círculo inferior do gatilho ao superior da mensagem
6. Clique em "Publicar" para salvar

#### Duplicar um Nó Configurado:
1. Configure um nó com a mensagem desejada
2. Passe o mouse sobre o nó
3. Clique no ícone de copiar
4. Um novo nó aparecerá ao lado com as mesmas configurações
5. Ajuste conforme necessário

#### Remover um Nó:
1. Passe o mouse sobre o nó indesejado
2. Clique no ícone da lixeira
3. O nó será removido imediatamente

### 5. Atalhos e Dicas

- **Zoom**: Use a roda do mouse ou os controles no canto
- **Pan**: Clique e arraste no fundo do canvas
- **Conexões**: Arraste dos círculos de conexão (handles)
- **Minimap**: Use o minimapa no canto para navegação rápida
- **Auto-save**: Lembre-se de clicar em "Publicar" periodicamente

### 6. Tipos de Nós Disponíveis

| Nó | Cor | Uso | Editável |
|---|---|---|---|
| Gatilho | Azul | Inicia o fluxo quando palavras-chave são detectadas | Keywords |
| Mensagem | Verde | Envia mensagem para o usuário | Conteúdo |
| Condição | Amarelo | Divide o fluxo baseado em condições | Condição |
| Ação - Tag | Roxo | Adiciona tags ao contato | Detalhes |
| Ação - API | Roxo | Chama APIs externas | Detalhes |
| Ação - Sequência | Roxo | Inicia outra sequência | Detalhes |
| Broadcast | Roxo claro | Envia mensagem para múltiplos contatos | Conteúdo |

## Próximas Melhorias Sugeridas

- [ ] Adicionar botões de ação rápida nas mensagens
- [ ] Preview da mensagem antes de publicar
- [ ] Histórico de versões do fluxo
- [ ] Templates de fluxos prontos (já implementado na tela principal)
- [ ] Teste do fluxo em tempo real
- [ ] Analytics de performance dos nós

---

Desenvolvido para ChatFlow Pro - Sistema de Automação de Chat Marketing
