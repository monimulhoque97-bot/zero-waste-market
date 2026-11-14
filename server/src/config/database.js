const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Environment variables
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'zerowaste_market';
const FORCE_SQLITE = process.env.USE_SQLITE === 'true';

let activeEngine = 'none'; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

/**
 * Initialize Database Connection
 * Attempts MySQL connection first; falls back gracefully to SQLite if MySQL is unreachable.
 */
async function initDatabase() {
  if (FORCE_SQLITE) {
    console.log('[Database] Force SQLite configured via USE_SQLITE=true');
    return setupSqlite();
  }

  try {
    console.log(`[Database] Attempting MySQL connection to ${DB_HOST}:${DB_PORT}/${DB_NAME}...`);
    // First test connection without database to create DB if needed
    const rootConn = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 2000,
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // Create pool for zerowaste_market
    mysqlPool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
    });

    // Test pool connection
    const testConn = await mysqlPool.getConnection();
    testConn.release();

    activeEngine = 'mysql';
    console.log('✅ [Database] MySQL connected successfully to ' + DB_NAME);
    return 'mysql';
  } catch (err) {
    console.warn(`⚠️  [Database] MySQL not reachable (${err.message}). Activating built-in SQLite engine...`);
    return setupSqlite();
  }
}

/**
 * Setup SQLite fallback engine
 */
function setupSqlite() {
  return new Promise((resolve, reject) => {
    const dbDir = path.resolve(__dirname, '../../../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'zerowaste_market.sqlite');

    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[Database] SQLite connection error:', err);
        return reject(err);
      }
      activeEngine = 'sqlite';
      console.log('✅ [Database] SQLite relational database active at: ' + dbPath);
      resolve('sqlite');
    });
  });
}

/**
 * Normalise MySQL vs SQLite SQL dialect where minor variations exist
 */
function normalizeSql(sql) {
  if (activeEngine === 'sqlite') {
    // Convert ENUM(...) to TEXT
    let converted = sql.replace(/ENUM\([^)]+\)/gi, 'TEXT');
    // Convert AUTO_INCREMENT to AUTOINCREMENT (SQLite only allows INTEGER PRIMARY KEY AUTOINCREMENT)
    converted = converted.replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    // Remove ENGINE=InnoDB and character set clauses
    converted = converted.replace(/ENGINE\s*=\s*InnoDB/gi, '');
    converted = converted.replace(/CHARACTER\s+SET\s+[^\s,]+/gi, '');
    converted = converted.replace(/COLLATE\s+[^\s,]+/gi, '');
    // Replace ON UPDATE CURRENT_TIMESTAMP
    converted = converted.replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');
    // Replace boolean TRUE / FALSE
    converted = converted.replace(/BOOLEAN/gi, 'INTEGER');
    return converted;
  }
  return sql;
}

/**
 * Unified Query Interface
 * Returns [rows, fields] like mysql2/promise
 */
async function query(sql, params = []) {
  if (!activeEngine || activeEngine === 'none') {
    await initDatabase();
  }

  if (activeEngine === 'mysql') {
    return await mysqlPool.query(sql, params);
  }

  // SQLite execution
  return new Promise((resolve, reject) => {
    const cleanSql = normalizeSql(sql);
    const trimmed = cleanSql.trim();
    const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed) || /^SHOW/i.test(trimmed);

    if (isSelect) {
      sqliteDb.all(cleanSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows, []]);
      });
    } else {
      sqliteDb.run(cleanSql, params, function (err) {
        if (err) return reject(err);
        resolve([{
          insertId: this.lastID,
          affectedRows: this.changes,
        }, []]);
      });
    }
  });
}

/**
 * Unified Transaction Connection
 */
async function getConnection() {
  if (!activeEngine || activeEngine === 'none') {
    await initDatabase();
  }

  if (activeEngine === 'mysql') {
    const conn = await mysqlPool.getConnection();
    return {
      query: (sql, params) => conn.query(sql, params),
      beginTransaction: () => conn.beginTransaction(),
      commit: () => conn.commit(),
      rollback: () => conn.rollback(),
      release: () => conn.release(),
    };
  }

  // SQLite transaction wrapper
  return {
    query: (sql, params) => query(sql, params),
    beginTransaction: () => query('BEGIN TRANSACTION'),
    commit: () => query('COMMIT'),
    rollback: () => query('ROLLBACK'),
    release: () => {}, // SQLite file handle remains shared
  };
}

module.exports = {
  initDatabase,
  query,
  getConnection,
  getActiveEngine: () => activeEngine,
  getPool: () => mysqlPool,
  getSqliteDb: () => sqliteDb,
};
