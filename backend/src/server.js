const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes');
const http = require('http');

const app = express();
const server = http.Server(app);

mongoose.connect("mongodb+srv://controle-acesso:controle-acesso@controle-acesso-dggef.mongodb.net/controle-acesso?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(cors())
app.use(express.json());
app.use(routes);

let PORT = process.env.PORT || 3333;
server.listen(PORT);
