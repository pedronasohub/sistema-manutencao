const express = require('express');
const router = express.Router();

const controller = require('../controllers/tecnicos.controller');

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.editar);
router.delete('/:id', controller.excluir);

module.exports = router;