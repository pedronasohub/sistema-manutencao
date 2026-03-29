const express = require('express');
const router = express.Router();

const equipamentosController = require('../controllers/equipamentos.controller');

router.get('/', equipamentosController.listar);
router.get('/:id', equipamentosController.buscarPorId);
router.post('/', equipamentosController.criar);
router.put('/:id', equipamentosController.editar);
router.delete('/:id', equipamentosController.excluir);

module.exports = router;