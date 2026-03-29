const express = require("express");
const router = express.Router();

const programacaoController = require("../controllers/programacao.controller");

// Gerar programação mensal
router.post("/gerar", programacaoController.gerarProgramacao);

// Listar programação por mês/ano
router.get("/", programacaoController.listarProgramacao);

// Atualizar status de um registro
router.put("/:id/status", programacaoController.atualizarStatus);

module.exports = router;