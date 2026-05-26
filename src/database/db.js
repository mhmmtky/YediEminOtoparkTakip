import * as SQLite from "expo-sqlite";
import { hashPassword } from "../services/hashPassword";

export const db = SQLite.openDatabaseSync("yediemin.db");

export const setupDB = async () => {
  try {
    db.execSync("PRAGMA foreign_keys = ON;");
    {
      /* Kullanıcılar tablosu */
    }
    db.execSync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      surname TEXT,    
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      personal_number TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
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
            personal_id INTEGER,
            exit_personal_id INTEGER,
            owner_id INTEGER,        
            status TEXT DEFAULT 'inside', 
            park_id INTEGER UNIQUE,          
            entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      
            exit_date TIMESTAMP         
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
            tc_no TEXT UNIQUE
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
        slot_code TEXT UNIQUE, -- A-1, A-2... 
        is_full INTEGER DEFAULT 0,
        car_id INTEGER,
        FOREIGN KEY (car_id) REFERENCES cars (id)
      );
    `);

    {
      /* Log tablosu */
    }
    db.execAsync(`CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        action_type TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
      );
    `);

    // ADMİN OLUŞTURMA

    const userCount = db.getFirstSync("SELECT COUNT(*) as count FROM users;");

    if (userCount.count === 0) {
      console.log("Admin hesabı oluşturuluyor...");
      const psw = await hashPassword("1234");
      db.runSync(
        `INSERT INTO users (name, surname, username, password, personal_number, role, status, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'));`,
        ["admin", "admin", "admin", psw, "2026001", "admin", "active"],
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

  const categoryCount = db.getFirstSync(
    "SELECT COUNT(*) as count FROM categories;",
  );
  if (categoryCount.count === 0) {
    console.log("Araç kategorileri yükleniyor...");

    const defaultCategories = [
      { name: "Otomobil", price: 150.0 },
      { name: "Motosiklet", price: 75.0 },
      { name: "Hafif Ticari", price: 200.0 },
      { name: "Ticari", price: 400.0 },
      { name: "İş Makinesi", price: 500.0 },
      { name: "Çeici & Dorse", price: 1000.0 },
    ];

    for (const cat of defaultCategories) {
      db.runSync("INSERT INTO categories (name, daily_price) VALUES (?, ?);", [
        cat.name,
        cat.price,
      ]);
    }
    console.log("Kategoriler başarıyla oluşturuldu! ");
  }
};
