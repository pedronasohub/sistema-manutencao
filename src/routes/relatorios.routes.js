const express = require('express');
const router = express.Router();

const relatoriosController = require('../controllers/relatorios.controller');

router.get('/', relatoriosController.listarFiltrado);

module.exports = router;