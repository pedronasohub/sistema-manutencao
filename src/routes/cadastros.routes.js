const express = require('express');
const router = express.Router();

const cadastrosController = require('../controllers/cadastros.controller');

// ======================================================
// ROTAS DE APOIO AO NOVO MÓDULO DE CADASTRO DE ATIVIDADES
// ======================================================

// Lista clientes ativos
// GET /api/cadastros/clientes
router.get('/clientes', cadastrosController.listarClientes);

// Lista contratos ativos
// GET /api/cadastros/contratos
router.get('/contratos', cadastrosController.listarContratos);

// Busca equipamento pela TAG
// GET /api/cadastros/equipamentos/tag/EM30009
router.get('/equipamentos/tag/:tag', cadastrosController.buscarEquipamentoPorTag);

// Lista técnicos ativos com filtros opcionais
// Exemplos:
// GET /api/cadastros/tecnicos
// GET /api/cadastros/tecnicos?contrato_id=1
// GET /api/cadastros/tecnicos?turno=A
// GET /api/cadastros/tecnicos?contrato_id=1&turno=A
router.get('/tecnicos', cadastrosController.listarTecnicos);

module.exports = router;