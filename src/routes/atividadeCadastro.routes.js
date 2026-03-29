const express = require('express');
const router = express.Router();

const atividadeCadastroController = require('../controllers/atividadeCadastro.controller');

router.get('/', atividadeCadastroController.listar);
router.get('/:id', atividadeCadastroController.buscarPorId);
router.post('/', atividadeCadastroController.criar);
router.put('/:id', atividadeCadastroController.editar);
router.delete('/:id', atividadeCadastroController.excluir);

module.exports = router;