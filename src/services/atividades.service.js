const db = require('../database/db');

function listar(callback) {
  db.all(
    `
    SELECT 
      a.*,
      t.nome AS tecnico_nome_rel,
      e.tag AS equipamento_tag_rel,
      e.serie AS equipamento_serie_rel
    FROM atividades a
    LEFT JOIN tecnicos t ON a.tecnico_id = t.id
    LEFT JOIN equipamentos e ON a.equipamento_id = e.id
    ORDER BY a.id DESC
    `,
    [],
    callback
  );
}

function buscarPorId(id, callback) {
  db.get(`SELECT * FROM atividades WHERE id = ?`, [id], callback);
}

function criar(dados, callback) {
  const {
    turno,
    contrato,
    tipo,
    data,
    matricula,
    nome,
    tag,
    serie,
    equipamento,
    hh,
    horimetro,
    om,
    atividade_requisitada,
    job,
    comp,
    os,
    ov,
    status,
    observacao,
    valor,
    classificacao,
    tecnico_id,
    equipamento_id
  } = dados;

  db.run(
    `
    INSERT INTO atividades (
      turno, contrato, tipo, data, matricula, nome, tag, serie, equipamento,
      hh, horimetro, om, atividade_requisitada, job, comp, os, ov, status,
      observacao, valor, classificacao, tecnico_id, equipamento_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      turno, contrato, tipo, data, matricula, nome, tag, serie, equipamento,
      hh, horimetro, om, atividade_requisitada, job, comp, os, ov, status,
      observacao, valor, classificacao, tecnico_id || null, equipamento_id || null
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
    data,
    matricula,
    nome,
    tag,
    serie,
    equipamento,
    hh,
    horimetro,
    om,
    atividade_requisitada,
    job,
    comp,
    os,
    ov,
    status,
    observacao,
    valor,
    classificacao,
    tecnico_id,
    equipamento_id
  } = dados;

  db.run(
    `
    UPDATE atividades SET
      turno = ?, contrato = ?, tipo = ?, data = ?, matricula = ?, nome = ?, tag = ?, serie = ?, equipamento = ?,
      hh = ?, horimetro = ?, om = ?, atividade_requisitada = ?, job = ?, comp = ?, os = ?, ov = ?, status = ?,
      observacao = ?, valor = ?, classificacao = ?, tecnico_id = ?, equipamento_id = ?
    WHERE id = ?
    `,
    [
      turno, contrato, tipo, data, matricula, nome, tag, serie, equipamento,
      hh, horimetro, om, atividade_requisitada, job, comp, os, ov, status,
      observacao, valor, classificacao, tecnico_id || null, equipamento_id || null, id
    ],
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