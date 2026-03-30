// ===============================
// ARQUIVO: controllers/atividades.controller.js
// ===============================

const atividadesService = require('../services/atividades.service');

function listar(req, res) {
  atividadesService.listar((err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
}

function buscarPorId(req, res) {
  const { id } = req.params;

  atividadesService.buscarPorId(id, (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ erro: 'Atividade não encontrada.' });
    res.json(row);
  });
}

function criar(req, res) {
  const dados = req.body;

  if (!dados.atividade_requisitada || !String(dados.atividade_requisitada).trim()) {
    return res.status(400).json({ erro: 'O campo atividade_requisitada é obrigatório.' });
  }

  atividadesService.criar(dados, (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });

    res.status(201).json({
      mensagem: 'Atividade cadastrada com sucesso.',
      id: result.id
    });
  });
}

function editar(req, res) {
  const { id } = req.params;
  const dados = req.body;

  if (!dados.atividade_requisitada || !String(dados.atividade_requisitada).trim()) {
    return res.status(400).json({ erro: 'O campo atividade_requisitada é obrigatório.' });
  }

  atividadesService.editar(id, dados, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Atividade não encontrada.' });

    res.json({ mensagem: 'Atividade atualizada com sucesso.' });
  });
}

function excluir(req, res) {
  const { id } = req.params;

  atividadesService.excluir(id, (err, changes) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (changes === 0) return res.status(404).json({ erro: 'Atividade não encontrada.' });

    res.json({ mensagem: 'Atividade excluída com sucesso.' });
  });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  editar,
  excluir
};