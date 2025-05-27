// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/agendamentos')
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('❌ Erro ao conectar:', err));

// Modelos
const Agendamento = mongoose.model('Agendamento', {
  nome: String,
  email: String,
  data: String,
  hora: String,
  servico: String
});

const Admin = mongoose.model('Admin', {
  email: String,
  senha: String
});

// Configuração de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sueli123silva@gmail.com',
    pass: 'jzlo oywd hsom imln' // senha de app do Gmail
  }
});

// Rota para criar admin (use uma vez e remova!)
app.post('/api/admin/criar', async (req, res) => {
  const { email, senha } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  const novo = new Admin({ email, senha: hash });
  await novo.save();
  res.send({ message: 'Admin criado com sucesso!' });
});

// Login de admin
app.post('/api/admin/login', async (req, res) => {
  const { email, senha } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: 'Usuário não encontrado.' });

  const valida = await bcrypt.compare(senha, admin.senha);
  if (!valida) return res.status(401).json({ message: 'Senha incorreta.' });

  const token = jwt.sign({ id: admin._id }, 'segredo123', { expiresIn: '1h' });
  res.json({ token });
});

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 👈 quebra o Bearer

  if (!token) return res.status(401).send({ message: 'Token ausente' });

  jwt.verify(token, 'segredo123', (err, user) => {
    if (err) return res.status(403).send({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}


// Rota de agendamento
app.post('/api/agendar', async (req, res) => {
  try {
    const { nome, email, data, hora, servico } = req.body;
    const existe = await Agendamento.findOne({ data, hora });
    if (existe) return res.status(400).json({ message: 'Horário já agendado.' });

    const novo = new Agendamento({ nome, email, data, hora, servico });
    await novo.save();

    const mailCliente = {
      from: 'sueli123silva@gmail.com',
      to: email,
      subject: 'Confirmação de Agendamento',
      text: `Olá ${nome}, seu agendamento para ${servico} foi confirmado para o dia ${data} às ${hora}.`
    };

    const mailProfissional = {
      from: 'sueli123silva@gmail.com',
      to: 'sueli123silva@gmail.com',
      subject: 'Novo Agendamento Recebido',
      text: `Novo agendamento de ${nome} para ${servico} no dia ${data} às ${hora}.`
    };

    await transporter.sendMail(mailCliente);
    await transporter.sendMail(mailProfissional);

    res.send({ message: 'Agendamento salvo e e-mails enviados com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao processar agendamento:', error);
    res.status(500).send({ message: 'Erro ao processar agendamento.' });
  }
});

// Rota para horários ocupados por data
app.get('/api/horarios-ocupados/:data', async (req, res) => {
  try {
    const { data } = req.params;
    const agendamentos = await Agendamento.find({ data });
    const horariosOcupados = agendamentos.map(item => item.hora);
    res.json(horariosOcupados);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar horários.' });
  }
});

// Rota para todos os agendamentos
app.get('/api/horarios-ocupados', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find();
    res.json(agendamentos);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar agendamentos.' });
  }
});

// Rota protegida para admin
app.get('/api/admin/agendamentos', autenticarToken, async (req, res) => {
  try {
    const agendamentos = await Agendamento.find();
    res.json(agendamentos);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar agendamentos.' });
  }
});
// Rota para excluir agendamento (protegida)
app.delete('/api/admin/agendamentos/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Agendamento.findByIdAndDelete(id);
    res.send({ message: 'Agendamento excluído com sucesso!' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao excluir agendamento.' });
  }
});


// Iniciar servidor
app.listen(5000, () => {
  console.log('🚀 Servidor rodando na porta 5000');
});
