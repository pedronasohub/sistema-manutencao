const db = require('../database/db');

function listar(callback) {
  db.all(
    `
    SELECT
      id,
      turno,
      contrato,
      tipo,
      atividade_requisitada,
      classificacao,
      status,
      observacao,
      created_at
    FROM atividades
    ORDER BY id DESC
    `,
    [],
    callback
  );
}

function buscarPorId(id, callback) {
  db.get(
    `
    SELECT
      id,
      turno,
      contrato,
      tipo,
      atividade_requisitada,
      classificacao,
      status,
      observacao,
      created_at
    FROM atividades
    WHERE id = ?
    `,
    [id],
    callback
  );
}

function criar(dados, callback) {
  const {
    turno,
    contrato,
    tipo,
    atividade_requisitada,
    classificacao,
    status,
    observacao
  } = dados;

  db.run(
    `
    INSERT INTO atividades (
      turno,
      contrato,
      tipo,
      atividade_requisitada,
      classificacao,
      status,
      observacao
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      turno || null,
      contrato || null,
      tipo || null,
      atividade_requisitada || null,
      classificacao || null,
      status || 'PENDENTE',
      observacao || null
    ],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    }
  );
}

function editar(id, dados, callback) {
  const {
    turno,
    contrato,
    tipo,
    atividade_requisitada,
    classificacao,
    status,
    observacao
  } = dados;

  db.run(
    `
    UPDATE atividades
    SET
      turno = ?,
      contrato = ?,
      tipo = ?,
      atividade_requisitada = ?,
      classificacao = ?,
      status = ?,
      observacao = ?
    WHERE id = ?
    `,
    [
      turno || null,
      contrato || null,
      tipo || null,
      atividade_requisitada || null,
      classificacao || null,
      status || 'PENDENTE',
      observacao || null,
      id
    ],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    }
  );
}

function excluir(id, callback) {
  db.run(
    `DELETE FROM atividades WHERE id = ?`,
    [id],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    }
  );
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  editar,
  excluir
};