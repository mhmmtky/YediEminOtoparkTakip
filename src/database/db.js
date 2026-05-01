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
    
    console.log("Tablo oluşturuldu.");

    const userCount = db.getFirstSync("SELECT COUNT(*) as count FROM users;");

    // Eğer hiç kullanıcı yoksa ilk admini ekle
    if (userCount.count === 0) {
      db.runSync(
        "INSERT INTO users (name, surname, username, password, role) VALUES (?, ?, ?, ?, ?);",
        ["Muhammet", "Kaya", "mhmmt", "1234", "admin"]
      );
      console.log("İlk Admin (mhmmt) başarıyla oluşturuldu.");
    }
    console.log("Kullanıcı sayısı:", userCount.count);
  } catch (e) {
    console.error("Veritabanı kurulum hatası:", e);
  }
};

export const loginUser = (username, password) => {
  try {
    const user = db.getFirstSync(
      "SELECT * FROM users WHERE username = ? AND password = ?;",
      [username, password]
    );
    return user; 
  } catch (e) {
    console.error("LOG: Login Sorgu Hatası:", e);
    return null;
  }
};