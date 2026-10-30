# Destrava

MVP funcional para acompanhar títulos, motivos de bloqueio, responsáveis, ações, evidências e confirmação manual de pagamento.

## Executar

Requer Node.js 24 ou superior. Não precisa instalar dependências.

```sh
npm start
```

Abra http://localhost:3000 e crie sua conta administradora. Não há credenciais padrão. A primeira configuração é única; faça-a antes de expor a instalação a uma rede. Para conhecer o produto, use “Explorar com dados de exemplo” na carteira vazia. Os exemplos ficam identificados por `[EXEMPLO]`.

## Funcionalidades

- Login com senha derivada por scrypt, sessão de oito horas e cookies HttpOnly/SameSite.
- Carteira persistente no SQLite; valores guardados em centavos.
- Importação CSV com prévia, detecção de duplicatas e transação integral em caso de conflito.
- Filtros, pesquisa, paginação e exportação com neutralização de fórmulas.
- Motivo, responsável, próxima ação, prazo e histórico por título.
- Controle de edição concorrente no acompanhamento do caso.
- PDF, PNG e JPEG privados de até 8 MB, com validação básica de assinatura do arquivo.
- Administrador, financeiro e colaborador; colaborador acessa apenas títulos atribuídos.
- Resolução operacional separada da confirmação manual de pagamento.
- Indicadores da carteira acessível ao usuário.

## Planilha

CSV UTF-8 com `;` ou `,` como separador. Exemplo com ponto e vírgula:

```csv
cliente;referencia;valor;vencimento
Empresa Exemplo;NF-001;1250,90;2026-10-30
```

Cliente e referência juntos identificam o título. Parcelas precisam de referências diferentes. O arquivo inteiro é recusado quando contém conflito de valor ou vencimento com título existente. Duplicatas idênticas são ignoradas. Limite de 1.000 registros por lote.

## Configuração

- `PORT`: padrão `3000`.
- `HOST`: padrão `127.0.0.1`.
- `DATA_DIR`: diretório de persistência; padrão `./data`.
- `APP_ORIGIN`: origem HTTPS exata quando implantado atrás de proxy.
- `COOKIE_SECURE=1`: obrigatório ao hospedar em HTTPS.

Exemplo de execução atrás de proxy HTTPS:

```sh
HOST=0.0.0.0 APP_ORIGIN=https://seu-dominio.example COOKIE_SECURE=1 npm start
```

Mantenha volume persistente para `DATA_DIR`. Esta versão usa uma instância de aplicação e SQLite; não é uma configuração para múltiplas réplicas. Não é compatível diretamente com o runtime Workers do Sites. Não há versão publicada.

## Verificação

```sh
npm run check
npm test
```

A suíte cobre importação, dinheiro, datas, sessão, CSRF, permissões, isolamento entre organizações, anexos, edição concorrente, pagamentos e exportação. Os testes criam banco temporário e não alteram a carteira real.

## Backup e recuperação

Pare o serviço antes de copiar o diretório `data` inteiro, incluindo banco, arquivos WAL/SHM se presentes e pasta de anexos. Guarde uma cópia protegida em destino separado. Para restaurar, com a aplicação parada, recoloque o diretório completo em `DATA_DIR` e inicie. Não substitua um banco em uso. Backups automáticos, criptografia de disco e teste de restauração precisam ser configurados na hospedagem.

## Limites antes de um piloto externo

Não há cobrança integrada, WhatsApp, envio de e-mails, recuperação de senha, convites, MFA, notificações agendadas, exclusão de registros ou varredura antivírus. Não há conciliação bancária. Os indicadores não comprovam valores recuperados. Apenas a primeira organização é criada pela interface; o isolamento por organização é aplicado e testado no servidor. Não há gestão de organizações pela interface.

O administrador cadastra pessoas e define suas senhas de acesso. Para uma implantação comercial, substitua esse processo por convite e definição individual de senha, adicione recuperação e gestão do ciclo de vida de contas. Configure TLS, backups e monitoramento. A validação de formato de anexo não substitui antivírus. O histórico é preservado pela aplicação, sem garantia de imutabilidade contra administradores do banco.

## Estrutura

- `server.mjs`: API, autenticação, autorização, SQLite e anexos.
- `domain.mjs`: valores, datas e CSV.
- `public/`: interface responsiva em português.
- `tests/`: testes automatizados.

Nenhum serviço externo é contratado pelo aplicativo.
