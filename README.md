# Avatech Auth Backend

Este é o backend da aplicação **Avatech Auth**, responsável por gerenciar o processo de autenticação de usuários, incluindo registro, login e acesso a rotas privadas.

---

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework web para Node.js.
- **Mongoose**: ODM (Object Data Modeling) para MongoDB e Node.js.
- **JWT (JSON Web Tokens)**: Para autenticação e autorização de usuários.
- **Bcrypt.js**: Para hash de senhas e verificação de credenciais.
- **MongoDB Atlas**: Banco de dados NoSQL hospedado na nuvem.

## Configuração do Ambiente

Este projeto depende de variáveis de ambiente para se conectar ao MongoDB e outras configurações sensíveis. Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

```bash
DB_USER=<seu-usuario-mongodb>
DB_PASSWORD=<sua-senha-mongodb>
SECRET=<sua-chave-secreta-para-jwt>
PORT=3333
```
## Instalação
```bash
git clone https://github.com/seu-usuario/avatech-auth-backend.git

cd avatech-auth-backend

npm install

npm start
```

## Rotas da API

POST /register

```bash
{
  "username": "nome_do_usuario",
  "email": "email_do_usuario",
  "password": "senha_do_usuario"
}
```

POST /login

```bash
{
  "email": "email_do_usuario",
  "password": "senha_do_usuario"
}
```

POST /protected

```bash
{
  "email": "email_do_usuario",
  "password": "senha_do_usuario"
}
```

## Configuração no MongoDB Atlas

Para conectar-se ao MongoDB Atlas, siga as etapas abaixo:

- Crie um cluster no MongoDB Atlas.
- Adicione um usuário e senha para o banco de dados.
- Configure a rede para permitir conexões de IPs permitidos.
- Copie a URL de conexão e use-a para preencher as variáveis de ambiente DB_USER e DB_PASSWORD no arquivo .env.

Exemplo de string de conexão:

```bash
mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.u9hok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```
## Aviso de segurança

Não compartilhe suas variáveis de ambiente (como a chave SECRET, DB_USER, e DB_PASSWORD) em repositórios públicos ou arquivos acessíveis por outras pessoas. Utilize sempre boas práticas de segurança para proteger informações sensíveis.

