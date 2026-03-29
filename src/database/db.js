const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ======================================================
// CONFIGURAÇÃO DO BANCO
// ======================================================

// Banco na raiz do projeto
const dbPath = path.resolve(process.cwd(), 'manutencao.db');

console.log('📁 Caminho do banco:', dbPath);

// Abre conexão com o SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no SQLite:', err.message);
  } else {
    console.log('✅ Banco SQLite conectado.');
  }
});

// ======================================================
// FUNÇÕES AUXILIARES (PROMISE) PARA MIGRAÇÕES SEGURAS
// ======================================================

/**
 * Executa um SQL de escrita (CREATE, ALTER, INSERT, UPDATE...)
 * em formato Promise, para facilitar uso com async/await.
 *
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<void>}
 */
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * Executa um SELECT que retorna múltiplas linhas.
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
 * Verifica se uma tabela existe no banco.
 *
 * @param {string} tableName
 * @returns {Promise<boolean>}
 */
async function tableExists(tableName) {
  const rows = await allAsync(
    `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = ?
    `,
    [tableName]
  );

  return rows.length > 0;
}

/**
 * Verifica se uma coluna existe em determinada tabela.
 *
 * Usa PRAGMA table_info(nome_tabela)
 *
 * @param {string} tableName
 * @param {string} columnName
 * @returns {Promise<boolean>}
 */
async function columnExists(tableName, columnName) {
  const rows = await allAsync(`PRAGMA table_info(${tableName})`);
  return rows.some((col) => col.name === columnName);
}

/**
 * Adiciona uma coluna em uma tabela SOMENTE se ela ainda não existir.
 *
 * @param {string} tableName
 * @param {string} columnName
 * @param {string} columnDefinition Ex.: "TEXT", "INTEGER DEFAULT 1"
 */
async function addColumnIfNotExists(tableName, columnName, columnDefinition) {
  const exists = await columnExists(tableName, columnName);

  if (!exists) {
    await runAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    console.log(`✅ Coluna '${columnName}' adicionada na tabela '${tableName}'.`);
  } else {
    console.log(`ℹ️ Coluna '${columnName}' já existe na tabela '${tableName}'.`);
  }
}

// ======================================================
// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO BANCO
// ======================================================

/**
 * Inicializa e evolui a estrutura do banco.
 *
 * IMPORTANTÍSSIMO:
 * - Mantém compatibilidade com o projeto atual
 * - Cria tabelas novas se não existirem
 * - Adiciona colunas faltantes em tabelas antigas
 * - Evita erro de coluna duplicada
 */
async function initDB() {
  try {
    console.log('🔧 Iniciando estrutura do banco...');

    // ======================================================
    // 1) TABELA TECNICOS (estrutura base)
    // ======================================================
    // Mantém a tabela antiga e garante criação se ainda não existir.
    await runAsync(`
      CREATE TABLE IF NOT EXISTS tecnicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matricula INTEGER UNIQUE,
        nome TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Como a tabela pode já existir com estrutura antiga,
    // adicionamos as colunas novas de forma segura.
    await addColumnIfNotExists('tecnicos', 'grupo_escala', 'TEXT');
    await addColumnIfNotExists('tecnicos', 'ativo', 'INTEGER DEFAULT 1');
    await addColumnIfNotExists('tecnicos', 'supervisor', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('tecnicos', 'contrato_id', 'INTEGER');
    await addColumnIfNotExists('tecnicos', 'turno', 'TEXT');

    // ======================================================
    // 2) TABELA EQUIPAMENTOS (estrutura base)
    // ======================================================
    await runAsync(`
      CREATE TABLE IF NOT EXISTS equipamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serie TEXT,
        tag TEXT,
        modelo TEXT,
        codigo TEXT,
        data_entrega TEXT,
        data_garantia TEXT,
        observacoes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Evolução da tabela equipamentos:
    // Agora cada equipamento poderá ser vinculado a um cliente e contrato.
    await addColumnIfNotExists('equipamentos', 'cliente_id', 'INTEGER');
    await addColumnIfNotExists('equipamentos', 'contrato_id', 'INTEGER');

    // ======================================================
    // 3) TABELA ATIVIDADES (LEGADO / COMPATIBILIDADE)
    // ======================================================
    // Mantemos essa tabela para não quebrar o módulo atual.
    await runAsync(`
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
        tecnico_id INTEGER,
        equipamento_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id),
        FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
      )
    `);

    // Se a tabela atividades já existia antes sem tecnico_id/equipamento_id,
    // garantimos que essas colunas existam.
    await addColumnIfNotExists('atividades', 'tecnico_id', 'INTEGER');
    await addColumnIfNotExists('atividades', 'equipamento_id', 'INTEGER');

    // ======================================================
    // 4) NOVA TABELA CLIENTES
    // ======================================================
    await runAsync(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ======================================================
    // 5) NOVA TABELA CONTRATOS
    // ======================================================
    await runAsync(`
      CREATE TABLE IF NOT EXISTS contratos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserção segura dos contratos padrão (sem duplicar)
    await runAsync(`
      INSERT OR IGNORE INTO contratos (nome, ativo)
      VALUES ('Performance', 1)
    `);

    await runAsync(`
      INSERT OR IGNORE INTO contratos (nome, ativo)
      VALUES ('Rentavel', 1)
    `);

    // ======================================================
    // 6) NOVA TABELA DE ATIVIDADES ESTRUTURADAS
    // ======================================================
    // Essa será a tabela do NOVO módulo de cadastro de atividades.
    // Não substitui a tabela antiga "atividades" ainda.
    // Ela convive junto com a antiga até concluirmos a migração.
    await runAsync(`
      CREATE TABLE IF NOT EXISTS atividades_manutencao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        -- Relacionamento com cliente e contrato
        cliente_id INTEGER NOT NULL,
        contrato_id INTEGER NOT NULL,

        -- Dados do equipamento (snapshot no momento do cadastro)
        equipamento_id INTEGER,
        tag TEXT NOT NULL,
        serie TEXT,
        codigo_equipamento TEXT,
        modelo TEXT,
        horimetro REAL,

        -- Informações gerais
        tipo TEXT NOT NULL,                  -- preventiva, corretiva, backlog
        atividade_requisitada TEXT NOT NULL,
        om_cliente TEXT,
        observacao TEXT,

        -- Detalhes da atividade
        turno TEXT NOT NULL,                 -- A ou C
        duracao_hh REAL NOT NULL,
        valor_hora REAL NOT NULL DEFAULT 177.49,
        data_inicio TEXT NOT NULL,
        data_termino TEXT,
        job TEXT,
        component TEXT,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ======================================================
    // 7) NOVA TABELA DE VÍNCULO: ATIVIDADE x TÉCNICOS
    // ======================================================
    // Uma atividade pode ter vários técnicos.
    // Essa tabela resolve o relacionamento N:N corretamente.
    await runAsync(`
      CREATE TABLE IF NOT EXISTS atividade_tecnicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atividade_id INTEGER NOT NULL,
        tecnico_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Estrutura do banco pronta (incluindo módulo de atividades).');
  } catch (error) {
    console.error('❌ Erro ao inicializar estrutura do banco:', error.message);
    console.error(error);
  }
}

// ======================================================
// MANTÉM COMPATIBILIDADE COM O PROJETO ANTIGO
// ======================================================
// Seu projeto atual provavelmente chama db.initDB() em algum ponto.
// Mantemos isso exatamente igual para não quebrar nada.
db.initDB = initDB;

module.exports = db;