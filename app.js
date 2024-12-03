require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Models
const User = require("./models/User");

// Middleware para verificar o token
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ msg: "Token inválido!" });
  }
}

// Rotas públicas
app.get("/", (req, res) => {
  res.status(200).json({ msg: "OK" });
});

// Rota privada
app.get("/protected", checkToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro no servidor" });
  }
});

// Registrar usuário
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(422)
      .json({ msg: "Preencha todos os campos obrigatórios!" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: passwordHash,
    });

    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Erro no servidor. Tente novamente mais tarde." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ msg: "E-mail e senha são obrigatórios!" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha inválida!" });
    }

    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1h" });

    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Erro no servidor. Tente novamente mais tarde." });
  }
});

// Conexão com MongoDB
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const secret = process.env.SECRET;
const dbName = process.env.DB_NAME;

if (!dbUser || !dbPassword || !secret) {
  console.error("Variáveis de ambiente não configuradas corretamente!");
  process.exit(1);
}

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.u9hok.mongodb.net/${dbName}?retryWrites=true&w=majority`
  )
  .then(() => {
    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log("Conectado ao MongoDB!");
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB:", error);
  });
