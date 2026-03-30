// ===============================
// ARQUIVO: routes/atividades.routes.js
// ===============================

const express = require('express');
const router = express.Router();
const atividadesController = require('../controllers/atividades.controller');

// CRUD principal da tabela atividades
router.get('/', atividadesController.listar);
router.get('/:id', atividadesController.buscarPorId);
router.post('/', atividadesController.criar);
router.put('/:id', atividadesController.editar);
router.delete('/:id', atividadesController.excluir);

module.exports = router;