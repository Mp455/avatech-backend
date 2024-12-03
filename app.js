require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

//models
const User = require("./models/User");

//rota privada
app.get("/protected", checkToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: "Erro no servidor" });
  }
});

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
    console.log(error);
    return res.status(400).json({ msg: "Token inválido!" });
  }
}

//rota pública
app.get("/", (req, res) => {
  res.status(200).json({ msg: "OK" });
});

//regitrar usuário
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O e-mail é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  //checkar se usuário já existe
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //Criar usuário
  const user = new User({
    username,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({
      msg: "Usuário criado com sucesso!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, por favor, tente novamente mais tarde",
    });
  }
});

//Login

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O e-mail é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  //checkar se usuário já existe
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  //Logar usuário

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user.id,
      },
      secret
    );

    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, por favor, tente novamente mais tarde",
    });
  }
});

//credenciais
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASSWORD;

mongoose
  .connect(
    `mongodb+srv://${dbuser}:${dbpassword}@cluster0.u9hok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3333);
    console.log("Conectou ao banco!");
  })
  .catch((err) => console.log(err));
