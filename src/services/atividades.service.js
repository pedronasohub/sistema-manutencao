// ==========================================
// ARQUIVO: services/atividades.service.js
// V2 AJUSTADA PARA NÃO QUEBRAR SE FALTAR CLIENTE
// ==========================================

const db = require('../database/db');

function listar(callback) {
  db.all(
    `
    SELECT *
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
    SELECT *
    FROM atividades
    WHERE id = ?
    `,
    [id],
    callback
  );
}

function criar(dados, callback) {
  const {
    cliente,
    contrato,
    tag,
    serie,
    equipamento,
    horimetro,
    tipo,
    atividade_requisitada,
    om,
    observacao,
    turno,
    duracao,
    job,
    comp,
    data_inicio,
    data_termino,
    tecnicos
  } = dados;

  db.run(
    `
    INSERT INTO atividades (
      contrato,
      tipo,
      atividade_requisitada,
      observacao,
      turno,
      cliente,
      tag,
      serie,
      equipamento,
      horimetro,
      om,
      duracao,
      job,
      comp,
      data_inicio,
      data_termino
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      contrato || null,
      tipo || null,
      atividade_requisitada || null,
      observacao || null,
      turno || null,
      cliente || null,
      tag || null,
      serie || null,
      equipamento || null,
      horimetro || null,
      om || null,
      duracao || null,
      job || null,
      comp || null,
      data_inicio || null,
      data_termino || null
    ],
    function (err) {
      if (err) return callback(err);

      const atividadeId = this.lastID;

      if (!Array.isArray(tecnicos) || tecnicos.length === 0) {
        return callback(null, { id: atividadeId });
      }

      const stmt = db.prepare(`
        INSERT INTO atividade_tecnicos (atividade_id, tecnico_id)
        VALUES (?, ?)
      `);

      let index = 0;

      function inserirProximo() {
        if (index >= tecnicos.length) {
          stmt.finalize((finalizeErr) => {
            if (finalizeErr) return callback(finalizeErr);
            callback(null, { id: atividadeId });
          });
          return;
        }

        const tecnicoId = tecnicos[index];

        stmt.run([atividadeId, tecnicoId], (insertErr) => {
          if (insertErr) return callback(insertErr);
          index++;
          inserirProximo();
        });
      }

      inserirProximo();
    }
  );
}

function editar(id, dados, callback) {
  const {
    cliente,
    contrato,
    tag,
    serie,
    equipamento,
    horimetro,
    tipo,
    atividade_requisitada,
    om,
    observacao,
    turno,
    duracao,
    job,
    comp,
    data_inicio,
    data_termino,
    tecnicos
  } = dados;

  db.run(
    `
    UPDATE atividades
    SET
      contrato = ?,
      tipo = ?,
      atividade_requisitada = ?,
      observacao = ?,
      turno = ?,
      cliente = ?,
      tag = ?,
      serie = ?,
      equipamento = ?,
      horimetro = ?,
      om = ?,
      duracao = ?,
      job = ?,
      comp = ?,
      data_inicio = ?,
      data_termino = ?
    WHERE id = ?
    `,
    [
      contrato || null,
      tipo || null,
      atividade_requisitada || null,
      observacao || null,
      turno || null,
      cliente || null,
      tag || null,
      serie || null,
      equipamento || null,
      horimetro || null,
      om || null,
      duracao || null,
      job || null,
      comp || null,
      data_inicio || null,
      data_termino || null,
      id
    ],
    function (err) {
      if (err) return callback(err);

      if (this.changes === 0) {
        return callback(null, 0);
      }

      db.run(
        `DELETE FROM atividade_tecnicos WHERE atividade_id = ?`,
        [id],
        (deleteErr) => {
          if (deleteErr) return callback(deleteErr);

          if (!Array.isArray(tecnicos) || tecnicos.length === 0) {
            return callback(null, 1);
          }

          const stmt = db.prepare(`
            INSERT INTO atividade_tecnicos (atividade_id, tecnico_id)
            VALUES (?, ?)
          `);

          let index = 0;

          function inserirProximo() {
            if (index >= tecnicos.length) {
              stmt.finalize((finalizeErr) => {
                if (finalizeErr) return callback(finalizeErr);
                callback(null, 1);
              });
              return;
            }

            const tecnicoId = tecnicos[index];

            stmt.run([id, tecnicoId], (insertErr) => {
              if (insertErr) return callback(insertErr);
              index++;
              inserirProximo();
            });
          }

          inserirProximo();
        }
      );
    }
  );
}

function excluir(id, callback) {
  db.run(
    `DELETE FROM atividade_tecnicos WHERE atividade_id = ?`,
    [id],
    (err) => {
      if (err) return callback(err);

      db.run(
        `DELETE FROM atividades WHERE id = ?`,
        [id],
        function (err2) {
          if (err2) return callback(err2);
          callback(null, this.changes);
        }
      );
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