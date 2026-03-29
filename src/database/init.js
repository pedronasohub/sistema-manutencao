const db = require("./db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS atividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turno TEXT,
      contrato TEXT,
      tipo TEXT,
      data TEXT,
      matricula INTEGER,
      nome TEXT,
      tag TEXT,
      serie TEXT,
      equipamento TEXT,
      hh REAL,
      horimetro REAL,
      om TEXT,
      atividade_requisitada TEXT,
      job TEXT,
      comp TEXT,
      os TEXT,
      ov TEXT UNIQUE,
      status TEXT,
      observacao TEXT,
      valor REAL,
      classificacao TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("❌ Erro ao criar tabela:", err.message);
    } else {
      console.log("✅ Tabela 'atividades' pronta.");
    }
  });
});