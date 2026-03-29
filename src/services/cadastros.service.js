const db = require('../database/db');

// ======================================================
// FUNÇÕES AUXILIARES (PROMISE)
// ======================================================

/**
 * Executa SELECT retornando várias linhas.
 * Usamos Promise para facilitar o async/await.
 *
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Executa SELECT retornando apenas 1 linha.
 *
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Object|null>}
 */
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// ======================================================
// CLIENTES
// ======================================================

/**
 * Lista todos os clientes ativos.
 *
 * @returns {Promise<Array>}
 */
async function listarClientes() {
  const sql = `
    SELECT
      id,
      nome,
      ativo,
      created_at
    FROM clientes
    WHERE ativo = 1
    ORDER BY nome ASC
  `;

  return await allAsync(sql);
}

// ======================================================
// CONTRATOS
// ======================================================

/**
 * Lista todos os contratos ativos.
 *
 * @returns {Promise<Array>}
 */
async function listarContratos() {
  const sql = `
    SELECT
      id,
      nome,
      ativo,
      created_at
    FROM contratos
    WHERE ativo = 1
    ORDER BY nome ASC
  `;

  return await allAsync(sql);
}

// ======================================================
// EQUIPAMENTO POR TAG
// ======================================================

/**
 * Busca um equipamento pela TAG.
 *
 * Retorna:
 * - dados do equipamento
 * - cliente vinculado (se existir)
 * - contrato vinculado (se existir)
 *
 * @param {string} tag
 * @returns {Promise<Object|null>}
 */
async function buscarEquipamentoPorTag(tag) {
  const sql = `
    SELECT
      e.id,
      e.tag,
      e.serie,
      e.modelo,
      e.codigo,
      e.data_entrega,
      e.data_garantia,
      e.observacoes,
      e.cliente_id,
      e.contrato_id,
      c.nome AS cliente_nome,
      ct.nome AS contrato_nome
    FROM equipamentos e
    LEFT JOIN clientes c ON c.id = e.cliente_id
    LEFT JOIN contratos ct ON ct.id = e.contrato_id
    WHERE UPPER(TRIM(e.tag)) = UPPER(TRIM(?))
    LIMIT 1
  `;

  return await getAsync(sql, [tag]);
}

// ======================================================
// TÉCNICOS FILTRADOS POR CONTRATO E TURNO
// ======================================================

/**
 * Lista técnicos ativos, filtrando opcionalmente por:
 * - contrato_id
 * - turno
 *
 * Regras:
 * - Sempre retorna apenas ativos = 1
 * - Se contrato_id vier informado, filtra
 * - Se turno vier informado, filtra
 *
 * @param {number|string|null} contratoId
 * @param {string|null} turno
 * @returns {Promise<Array>}
 */
async function listarTecnicos(contratoId = null, turno = null) {
  let sql = `
    SELECT
      id,
      matricula,
      nome,
      grupo_escala,
      ativo,
      supervisor,
      contrato_id,
      turno,
      created_at
    FROM tecnicos
    WHERE ativo = 1
  `;

  const params = [];

  // Filtra por contrato, se informado
  if (contratoId) {
    sql += ` AND contrato_id = ? `;
    params.push(contratoId);
  }

  // Filtra por turno, se informado
  if (turno) {
    sql += ` AND UPPER(TRIM(turno)) = UPPER(TRIM(?)) `;
    params.push(turno);
  }

  sql += ` ORDER BY nome ASC `;

  return await allAsync(sql, params);
}

// ======================================================
// EXPORTAÇÕES
// ======================================================

module.exports = {
  listarClientes,
  listarContratos,
  buscarEquipamentoPorTag,
  listarTecnicos
};