const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./src/database/db');

const atividadesRoutes = require('./src/routes/atividades.routes');
const tecnicosRoutes = require('./src/routes/tecnicos.routes');
const equipamentosRoutes = require('./src/routes/equipamentos.routes');
const relatoriosRoutes = require('./src/routes/relatorios.routes');
const programacaoRoutes = require('./src/routes/programacao.routes');
const cadastrosRoutes = require('./src/routes/cadastros.routes'); 
const atividadeCadastroRoutes = require('./src/routes/atividadeCadastro.routes');
const clientesRoutes = require('./src/routes/clientes.routes');
const contratosRoutes = require('./src/routes/contratos.routes');
// NOVA ROTA



const app = express();
const PORT = 3000;

// ======================================================
// INICIALIZAÇÃO DO BANCO
// ======================================================
db.initDB();

// ======================================================
// MIDDLEWARES GERAIS
// ======================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// ROTAS DA API
// ======================================================
app.use('/api/atividades', atividadesRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/equipamentos', equipamentosRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/programacao', programacaoRoutes);
app.use('/api/cadastros', cadastrosRoutes); 
app.use('/api/atividade-cadastro', atividadeCadastroRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/contratos', contratosRoutes);
// NOVA ROTA

// ======================================================
// FRONT-END ESTÁTICO
// ======================================================
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================================================
// START DO SERVIDOR
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});