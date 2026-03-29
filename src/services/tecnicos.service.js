const db = require('../database/db');

function listar(filtros = {}, callback) {
  const { contrato_id, turno } = filtros;

  let sql = `SELECT * FROM tecnicos WHERE 1=1`;
  const params = [];

  // ======================================================
  // FILTRO POR CONTRATO
  // ======================================================
  if (contrato_id) {
    sql += ` AND contrato_id = ?`;
    params.push(contrato_id);
  }

  // ======================================================
  // FILTRO POR TURNO
  // ======================================================
  if (turno) {
    sql += ` AND turno = ?`;
    params.push(turno);
  }

  sql += ` ORDER BY nome ASC`;

  db.all(sql, params, callback);
}

function buscarPorId(id, callback) {
  db.get(`SELECT * FROM tecnicos WHERE id = ?`, [id], callback);
}

function criar(dados, callback) {
  const { matricula, nome, contrato_id, supervisor, turno } = dados;

  db.run(
    `INSERT INTO tecnicos (matricula, nome, contrato_id, supervisor, turno)
     VALUES (?, ?, ?, ?, ?)`,
    [matricula || null, nome, contrato_id || null, supervisor || null, turno || null],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
}

function editar(id, dados, callback) {
  const { matricula, nome, contrato_id, supervisor, turno } = dados;

  db.run(
    `UPDATE tecnicos
     SET matricula = ?, nome = ?, contrato_id = ?, supervisor = ?, turno = ?
     WHERE id = ?`,
    [matricula || null, nome, contrato_id || null, supervisor || null, turno || null, id],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    }
  );
}

function excluir(id, callback) {
  db.run(`DELETE FROM tecnicos WHERE id = ?`, [id], function (err) {
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