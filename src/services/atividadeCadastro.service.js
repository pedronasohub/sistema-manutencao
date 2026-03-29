const db = require('../database/db');

function listar(callback) {
  db.all(`SELECT * FROM atividades ORDER BY id DESC`, [], callback);
}

function buscarPorId(id, callback) {
  db.get(`SELECT * FROM atividades WHERE id = ?`, [id], callback);
}

function criar(dados, callback) {
  const { codigo, nome, tipo, descricao } = dados;

  db.run(
    `INSERT INTO atividades (codigo, nome, tipo, descricao)
     VALUES (?, ?, ?, ?)`,
    [codigo || null, nome || null, tipo || null, descricao || null],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
}

function editar(id, dados, callback) {
  const { codigo, nome, tipo, descricao } = dados;

  db.run(
    `UPDATE atividades
     SET codigo = ?, nome = ?, tipo = ?, descricao = ?
     WHERE id = ?`,
    [codigo || null, nome || null, tipo || null, descricao || null, id],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    }
  );
}

function excluir(id, callback) {
  db.run(`DELETE FROM atividades WHERE id = ?`, [id], function (err) {
    if (err) return callback(err);
    callback(null, this.changes);
  });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  editar,
  excluir
};