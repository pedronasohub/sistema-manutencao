const atividadesService = require('../services/atividades.service');

async function create(req, res) {
  try {
    const resultado = await atividadesService.create(req.body);

    return res.status(201).json({
      sucesso: true,
      message: 'Atividade criada com sucesso.',
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return res.status(400).json({
      sucesso: false,
      erro: error.message || 'Erro ao criar atividade.'
    });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};