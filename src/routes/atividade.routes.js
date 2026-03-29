const express = require('express');
const router = express.Router();
const atividadesController = require('../controllers/atividades.controller');

router.get('/', atividadesController.list);
router.get('/:id', atividadesController.getById);
router.post('/', atividadesController.create);
router.put('/:id', atividadesController.update);
router.delete('/:id', atividadesController.remove);

module.exports = router;