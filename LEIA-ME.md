# Controle de contas: instalação

## 1. Supabase (projeto da simulação de financiamento)
1. No painel do projeto, abra **SQL Editor** e crie uma nova consulta.
2. Cole todo o conteúdo de `supabase.sql` e clique em **Run**. Isso cria só a tabela `contas_dados`, com regras para cada pessoa ver apenas os próprios dados.
3. Já preenchido: a URL e a chave pública deste projeto estão no `config.js`.
4. Opcional: em **Authentication**, no provedor de e-mail, desligue "Confirm email" para entrar logo depois de criar a conta.

## 2. Configurar o app
Abra `config.js` e troque os dois textos `COLE_AQUI...` pela URL e pela chave copiadas.

## 3. Publicar no Netlify
**Add new site**, depois **Deploy manually**, e arraste a **pasta descompactada** `controle-de-contas-app` (não o .zip). Anote o endereço gerado.

## 4. Instalar no celular
No Chrome, abra o endereço, toque no menu de três pontos e escolha **Instalar app** (ou **Adicionar à tela inicial**). Depois toque em **Criar conta** e entre.

## Observações
- Os dados cadastrados na página de teste não são trazidos para cá. Cadastre novamente.
- A chave pública pode ficar no código; a proteção vem das regras da tabela.
- Se você editar em dois aparelhos ao mesmo tempo, vale o último salvamento.
- Depois de criar sua conta, você pode bloquear novos cadastros em Authentication, mas só faça isso se a planilha de simulação não depender de cadastro de usuários.
