Sistema de Agendamento de Serviços

Este é um sistema de agendamento de serviços com painel de administração, desenvolvido com Node.js, MongoDB e frontend em HTML, CSS e JavaScript puro.

Funcionalidades

- Agendamento de horários com verificação de disponibilidade
- Envio automático de confirmação por e-mail para o cliente e o profissional
- Painel de administração com login protegido por token JWT
- Visualização e exclusão de agendamentos no painel
- Modo escuro e responsividade mobile com design moderno

Tecnologias Utilizadas

Frontend

- HTML5
- CSS3 (com uso de Google Fonts, animações e responsividade)
- JavaScript (DOM, fetch, flatpickr)

Backend

- Node.js com Express
- MongoDB com Mongoose
- JWT para autenticação
- Bcryptjs para criptografia de senha
- Nodemailer para envio de e-mails

Como rodar o projeto localmente

1. Clone este repositório
2. Instale as dependências do backend: npm install
3. Inicie o servidor backend: node server.js
4. Abra o arquivo index.html no navegador para acessar o formulário de agendamento
5. Para acessar o painel admin, abra admin.html

Configuração do e-mail

Para usar o envio automático de e-mails, configure um e-mail no serviço Gmail e gere uma senha de app para colocar no transporter do Nodemailer.

Observações

- Após criar o admin via rota /api/admin/criar, apague essa rota do servidor por segurança.
- Certifique-se que o MongoDB esteja rodando localmente na porta 27017 com o banco de dados chamado agendamentos


