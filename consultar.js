const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'manutencao.db');

console.log('📁 Banco:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao abrir banco:', err.message);
    return;
  }

  console.log('✅ Banco conectado!');

  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
      console.error('❌ Erro ao listar tabelas:', err.message);
      db.close();
      return;
    }

    console.log('\n📋 Tabelas encontradas:');
    console.table(tables);

    db.all("SELECT * FROM tecnicos", [], (err, rows) => {
      if (err) {
        console.error('❌ Erro ao consultar técnicos:', err.message);
      } else {
        console.log('\n👨‍🔧 Tabela TECNICOS:');
        console.table(rows);
      }

      db.all("SELECT * FROM equipamentos", [], (err, rows2) => {
        if (err) {
          console.error('❌ Erro ao consultar equipamentos:', err.message);
        } else {
          console.log('\n⚙️ Tabela EQUIPAMENTOS:');
          console.table(rows2);
        }

        db.all("SELECT * FROM atividades", [], (err, rows3) => {
          if (err) {
            console.error('❌ Erro ao consultar atividades:', err.message);
          } else {
            console.log('\n🛠️ Tabela ATIVIDADES:');
            console.table(rows3);
          }

          db.close();
        });
      });
    });
  });
});