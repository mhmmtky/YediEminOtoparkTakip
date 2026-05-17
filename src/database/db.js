import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("yediemin.db");

export const setupDB = () => {
  try {
    db.execSync("PRAGMA foreign_keys = ON;");
    {
      /* Kullanıcılar tablosu */
    }
    db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            surname TEXT,    
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            personal_number TEXT,
            status,
            created_at
        );
    `);
    {
      /* Araçlar tablosu */
    }
    db.execSync(`
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT,            
            model TEXT,            
            plate TEXT UNIQUE,     
            mileage INTEGER,       
            year INTEGER,          
            is_paid INTEGER DEFAULT 0,
            category_id INTEGER,
            owner_id INTEGER,        
            status TEXT,           
            entry_date TEXT,       
            exit_date TEXT         
        );
    `);

    {
      /* Kategori tablosu */
    }

    db.execSync(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            daily_price REAL 
        );
    `);

    {
      /* Sahip tablosu */
    }

    db.execSync(`
        CREATE TABLE IF NOT EXISTS owners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT,
            phone TEXT,
            tc_no TEXT UNIQUE -- Yasal takip için tc no iyidir
        );
    `);

    {
      /* Otopark tablosu */
    }

    db.execSync(`
      CREATE TABLE IF NOT EXISTS parking_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        block TEXT,           -- A, B, C...
        number INTEGER,       -- 1, 2, 3...
        slot_code TEXT UNIQUE, -- A-1, A-2... (Hızlı arama için)
        is_full INTEGER DEFAULT 0,
        car_id INTEGER,
        FOREIGN KEY (car_id) REFERENCES cars (id)
      );
    `);

    {
      /* Log tablosu */
    }
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_name TEXT,
        action_type TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
      );
    `);

    // ADMİN OLUŞTURMA

    const userCount = db.getFirstSync("SELECT COUNT(*) as count FROM users;");

    if (userCount.count === 0) {
      console.log("Admin hesabı oluşturuluyor...");
      db.runSync(
        `INSERT INTO users (name, surname, username, password, role, status, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'));`,
        ["Muhammet", "Kaya", "mhmmt", "1234", "admin", "active"],
      );
    }

    // OTOPARK OLUŞTURMA
    const slotCount = db.getFirstSync(
      "SELECT COUNT(*) as count FROM parking_slots;",
    );

    if (slotCount.count === 0) {
      const blocks = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

      for (const block of blocks) {
        for (let i = 1; i <= 30; i++) {
          const slotCode = `${block}-${i}`;
          db.runSync(
            "INSERT INTO parking_slots (block, number, slot_code) VALUES (?, ?, ?);",
            [block, i, slotCode],
          );
        }
      }
      console.log("Otopark tablosu oluşturuldu!");
    }
  } catch (e) {
    console.error("Veritabanı kurulum hatası:", e);
  }
};
