const programacaoService = require("../services/programacao.service");

// =========================
// POST /api/programacao/gerar
// =========================
async function gerarProgramacao(req, res) {
  try {
    const { mes, ano, tipoEscala, turnoInicial, dataBase } = req.body;

    const resultado = await programacaoService.gerarProgramacaoMensal({
      mes,
      ano,
      tipoEscala,
      turnoInicial,
      dataBase
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("❌ Erro ao gerar programação:", error.message);
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message
    });
  }
}

// =========================
// GET /api/programacao?mes=3&ano=2026
// =========================
async function listarProgramacao(req, res) {
  try {
    const { mes, ano } = req.query;

    const resultado = await programacaoService.buscarProgramacaoPorMes({
      mes,
      ano
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("❌ Erro ao listar programação:", error.message);
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message
    });
  }
}

// =========================
// PUT /api/programacao/:id/status
// =========================
async function atualizarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, observacao } = req.body;

    const resultado = await programacaoService.atualizarStatusProgramacao({
      id: Number(id),
      status,
      observacao
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("❌ Erro ao atualizar status da programação:", error.message);
    return res.status(400).json({
      sucesso: false,
      mensagem: error.message
    });
  }
}

module.exports = {
  gerarProgramacao,
  listarProgramacao,
  atualizarStatus
};