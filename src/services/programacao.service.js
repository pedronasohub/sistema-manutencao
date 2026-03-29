const db = require('../database/db');

// =========================
// HELPERS
// =========================
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function pad2(num) {
  return String(num).padStart(2, "0");
}

function formatDateISO(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function diffDays(dateA, dateB) {
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
  const diffMs = b - a;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getTurnoDoDiaAlternancia(dataAtual, dataBase, turnoInicial) {
  const dias = diffDays(dataBase, dataAtual);

  if (dias % 2 === 0) {
    return turnoInicial;
  }

  return turnoInicial === "A" ? "C" : "A";
}

// =========================
// GARANTIR TABELA
// =========================
async function garantirTabelaProgramacao() {
  const sql = `
    CREATE TABLE IF NOT EXISTS programacao_mensal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tecnico_id INTEGER NOT NULL,
      matricula TEXT,
      nome TEXT,
      data_programacao TEXT NOT NULL,
      turno TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Disponível',
      observacao TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await run(sql);
}

// =========================
// GERAR PROGRAMAÇÃO MENSAL
// =========================
async function gerarProgramacaoMensal({
  mes,
  ano,
  tipoEscala = "alternancia",
  turnoInicial = "A",
  dataBase = null
}) {
  await garantirTabelaProgramacao();

  const month = Number(mes);
  const year = Number(ano);

  if (!month || month < 1 || month > 12) {
    throw new Error("Mês inválido.");
  }

  if (!year || year < 2000) {
    throw new Error("Ano inválido.");
  }

  if (!["A", "C"].includes(turnoInicial)) {
    throw new Error("turnoInicial deve ser 'A' ou 'C'.");
  }

  if (tipoEscala !== "alternancia") {
    throw new Error("No momento, apenas 'alternancia' está implementado.");
  }

  const dataBaseFinal = dataBase || formatDateISO(year, month, 1);

  // Remove programação do mês antes de recriar
  const inicioMes = formatDateISO(year, month, 1);
  const fimMes = formatDateISO(year, month, getDaysInMonth(year, month));

  await run(
    `
    DELETE FROM programacao_mensal
    WHERE data_programacao BETWEEN ? AND ?
    `,
    [inicioMes, fimMes]
  );

  // Busca técnicos ativos com grupo A/C
  const tecnicos = await all(
    `
    SELECT id, matricula, nome, grupo_escala, ativo
    FROM tecnicos
    WHERE ativo = 1
      AND grupo_escala IN ('A', 'C')
    ORDER BY nome
    `
  );

  if (!tecnicos.length) {
    throw new Error("Nenhum técnico ativo com grupo_escala A/C encontrado.");
  }

  const diasNoMes = getDaysInMonth(year, month);
  let inseridos = 0;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataAtual = formatDateISO(year, month, dia);

    let turnoDoDia;

    if (tipoEscala === "alternancia") {
      turnoDoDia = getTurnoDoDiaAlternancia(dataAtual, dataBaseFinal, turnoInicial);
    }

    const tecnicosDoTurno = tecnicos.filter(
      (t) => t.grupo_escala === turnoDoDia
    );

    for (const tecnico of tecnicosDoTurno) {
      await run(
        `
        INSERT INTO programacao_mensal (
          tecnico_id,
          matricula,
          nome,
          data_programacao,
          turno,
          status,
          observacao
        )
        VALUES (?, ?, ?, ?, ?, 'Disponível', NULL)
        `,
        [
          tecnico.id,
          tecnico.matricula || null,
          tecnico.nome || null,
          dataAtual,
          turnoDoDia
        ]
      );

      inseridos++;
    }
  }

  return {
    sucesso: true,
    mes: month,
    ano: year,
    tipoEscala,
    turnoInicial,
    dataBase: dataBaseFinal,
    totalTecnicos: tecnicos.length,
    totalRegistros: inseridos
  };
}

// =========================
// LISTAR PROGRAMAÇÃO POR MÊS
// =========================
async function buscarProgramacaoPorMes({ mes, ano }) {
  await garantirTabelaProgramacao();

  const month = Number(mes);
  const year = Number(ano);

  if (!month || month < 1 || month > 12) {
    throw new Error("Mês inválido.");
  }

  if (!year || year < 2000) {
    throw new Error("Ano inválido.");
  }

  const inicioMes = formatDateISO(year, month, 1);
  const fimMes = formatDateISO(year, month, getDaysInMonth(year, month));

  const rows = await all(
    `
    SELECT
      id,
      tecnico_id,
      matricula,
      nome,
      data_programacao,
      turno,
      status,
      observacao,
      created_at
    FROM programacao_mensal
    WHERE data_programacao BETWEEN ? AND ?
    ORDER BY data_programacao ASC, turno ASC, nome ASC
    `,
    [inicioMes, fimMes]
  );

  return {
    sucesso: true,
    mes: month,
    ano: year,
    total: rows.length,
    dados: rows
  };
}

// =========================
// ATUALIZAR STATUS
// =========================
async function atualizarStatusProgramacao({
  id,
  status,
  observacao = null
}) {
  await garantirTabelaProgramacao();

  const statusPermitidos = [
    "Disponível",
    "Atestado",
    "Férias",
    "Licença",
    "Afastado",
    "Demitido"
  ];

  if (!id) {
    throw new Error("ID da programação é obrigatório.");
  }

  if (!statusPermitidos.includes(status)) {
    throw new Error(
      `Status inválido. Permitidos: ${statusPermitidos.join(", ")}`
    );
  }

  const existe = await get(
    `SELECT id FROM programacao_mensal WHERE id = ?`,
    [id]
  );

  if (!existe) {
    throw new Error("Registro de programação não encontrado.");
  }

  const result = await run(
    `
    UPDATE programacao_mensal
    SET status = ?, observacao = ?
    WHERE id = ?
    `,
    [status, observacao, id]
  );

  return {
    sucesso: true,
    id,
    status,
    observacao,
    changes: result.changes
  };
}

module.exports = {
  gerarProgramacaoMensal,
  buscarProgramacaoPorMes,
  atualizarStatusProgramacao
};