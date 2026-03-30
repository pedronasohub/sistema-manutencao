const atividadeService = require('../services/atividades.service');

async function listarTecnicos(req, res) {
  try {
    const items = await atividadeService.listarTecnicos();
    return res.json(items);
  } catch (error) {
    console.error('Erro ao listar técnicos:', error);
    return res.status(500).json({
      erro: error.message || 'Erro ao listar técnicos.'
    });
  }
}

async function criarAtividade(req, res) {
  try {
    const resultado = await atividadeService.criarAtividadeComTecnicos(req.body);

    return res.status(201).json({
      message: 'Atividade criada com sucesso.',
      ...resultado
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return res.status(400).json({
      erro: error.message || 'Erro ao criar atividade.'
    });
  }
}

module.exports = {
  listarTecnicos,
  criarAtividade
};