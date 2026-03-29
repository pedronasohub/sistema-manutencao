const db = require('../database/db');

function listar(callback) {
  db.all(`SELECT * FROM equipamentos ORDER BY id DESC`, [], callback);
}

function buscarPorId(id, callback) {
  db.get(`SELECT * FROM equipamentos WHERE id = ?`, [id], callback);
}

// ======================================================
// BUSCA POR TAG EXATA
// ======================================================
function buscarPorTag(tag, callback) {
  db.get(`SELECT * FROM equipamentos WHERE tag = ?`, [tag], callback);
}

function criar(dados, callback) {
  const {
    serie,
    tag,
    modelo,
    codigo,
    data_entrega,
    data_garantia,
    observacoes
  } = dados;

  db.run(
    `INSERT INTO equipamentos 
    (serie, tag, modelo, codigo, data_entrega, data_garantia, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [serie, tag, modelo, codigo, data_entrega, data_garantia, observacoes],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
}

function editar(id, dados, callback) {
  const {
    serie,
    tag,
    modelo,
    codigo,
    data_entrega,
    data_garantia,
    observacoes
  } = dados;

  db.run(
    `UPDATE equipamentos
     SET serie = ?, tag = ?, modelo = ?, codigo = ?, data_entrega = ?, data_garantia = ?, observacoes = ?
     WHERE id = ?`,
    [serie, tag, modelo, codigo, data_entrega, data_garantia, observacoes, id],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    }
  );
}

function excluir(id, callback) {
  db.run(`DELETE FROM equipamentos WHERE id = ?`, [id], function (err) {
    if (err) return callback(err);
    callback(null, this.changes);
  });
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorTag,
  criar,
  editar,
  excluir
};