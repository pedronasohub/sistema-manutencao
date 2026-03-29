const db = require('../database/db');

function listarFiltrado(filtros, callback) {
  const { dataInicio, dataFim, tecnico_id } = filtros;

  let sql = `
    SELECT 
      a.*,
      t.nome AS tecnico_nome_rel,
      e.tag AS equipamento_tag_rel,
      e.serie AS equipamento_serie_rel
    FROM atividades a
    LEFT JOIN tecnicos t ON a.tecnico_id = t.id
    LEFT JOIN equipamentos e ON a.equipamento_id = e.id
    WHERE 1=1
  `;

  const params = [];

  if (dataInicio) {
    sql += ` AND a.data >= ?`;
    params.push(dataInicio);
  }

  if (dataFim) {
    sql += ` AND a.data <= ?`;
    params.push(dataFim);
  }

  if (tecnico_id) {
    sql += ` AND a.tecnico_id = ?`;
    params.push(tecnico_id);
  }

  sql += ` ORDER BY a.data DESC, a.id DESC`;

  db.all(sql, params, callback);
}

module.exports = {
  listarFiltrado
};