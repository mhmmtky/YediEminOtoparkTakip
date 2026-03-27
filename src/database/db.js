import * as SQLite from "expo-sqlite";
export const db = SQLite.openDatabaseSync("yediemin.db");

export const setupDB = () => {
  try {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            surname TEXT,    
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
      );
        `);
  } catch (e) {}
};
