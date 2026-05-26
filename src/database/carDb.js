import { db } from "./db";

export const saveCar = async (carData) => {
  const {
    brand,
    model,
    plate,
    mileage,
    year,
    category_id,
    personal_id,
    park_id,
  } = carData;

  try {
    const result = await db.runAsync(
      `INSERT INTO cars (brand, model, plate, mileage, year, category_id, owner_id, personal_id, park_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        brand,
        model,
        plate.toUpperCase().trim(),
        mileage,
        year,
        category_id,
        null,
        personal_id,
        park_id,
      ],
    );

    return result;
  } catch (e) {
    console.error("SQL Katmanında saveCar hatası:", e);
    return false;
  }
};

export const getAllCar = async () => {
  try {
    const sql = `SELECT c.id, c.brand, c.model, c.plate, c.mileage, c.year, c.is_paid, c.entry_date, c.exit_date, c.category_id, c.personal_id, c.park_id, cate.name AS category_name, cate.daily_price AS category_price, u.name AS personal_name, u.surname AS personal_surname, u.username AS personal_username, ps.slot_code AS car_slot FROM cars c 
      LEFT JOIN categories cate ON c.category_id = cate.id 
      LEFT JOIN users u ON c.personal_id = u.id 
      LEFT JOIN parking_slots ps ON c.park_id = ps.id 
      WHERE c.status = ? `;
    const rows = await db.getAllAsync(sql, ["inside"]);
    console.log("servise gönderiliyor.");
    return rows;
  } catch (e) {
    console.error(`CarDb SQL Katmanında Araçlar çekilirken hata oluştu: `, e);
    return [];
  }
};

export const updateCarInfoById = async (carData) => {
  try {
    const { brand, model, slot, id } = carData;
    const sql = `UPDATE cars SET brand = ?, model = ?, park_id = ? WHERE id = ?`;
    const result = await db.runAsync(sql, [
      brand,
      model,
      Number(slot),
      Number(id),
    ]);

    return result;
  } catch (e) {
    console.error("SQL Katmanında updateCar hatası:", e);
    return false;
  }
};

export const deleteCarById = async (carData) => {
  try {
    const { status, exit_date, owner_id, is_paid, park_id, id, personal_id } =
      carData;
    const sql = `UPDATE cars SET status = ?, exit_date = ?, owner_id = ?, is_paid = ?, park_id = ?, exit_personal_id = ? WHERE id = ?`;
    const result = await db.runAsync(sql, [
      status,
      exit_date,
      owner_id,
      is_paid,
      park_id,
      personal_id,
      id,
    ]);

    console.log(exit_date + " " + personal_id);
    return result;
  } catch (e) {
    console.error("SQL Katmanında deleteCarById hatası:", e);
    return false;
  }
};

export const getReleasedCars = async () => {
  try {
    const sql = `
      SELECT 
        c.id, 
        c.brand, 
        c.model, 
        c.plate, 
        c.mileage, 
        c.year, 
        c.entry_date, 
        c.exit_date, 
        c.is_paid,
        cate.name AS category_name, 
        cate.daily_price AS category_price,
        u.username AS personal_username,
        o.full_name AS owner_name,
        o.phone AS owner_phone,
        o.tc_no AS owner_tc
      FROM cars c
      LEFT JOIN categories cate ON c.category_id = cate.id
      LEFT JOIN users u ON c.exit_personal_id = u.id
      LEFT JOIN owners o ON c.owner_id = o.id 
      WHERE c.status = ?
      ORDER BY c.exit_date DESC
    `;

    const rows = await db.getAllAsync(sql, ["out"]);
    return rows;
  } catch (e) {
    console.error("SQL Katmanında getReleasedCars hatası:", e);
    return [];
  }
};

export const getAddedCarCount = async (today, id) => {
  try {
    const sql = `SELECT COUNT(*) as count FROM cars WHERE date(entry_date) = ? AND personal_id = ? `;
    const rows = await db.getAllAsync(sql, [today, id]);
    console.log(rows);
    return rows;
  } catch (e) {
    console.log("getAddedCarCount fonksiyonunda hata oluştu: " + e);
    return 0;
  }
};

export const getReleasedCarCount = async (today, id) => {
  try {
    const sql = `SELECT COUNT(*) as count FROM cars WHERE date(exit_date) = ? AND exit_personal_id = ?`;
    const rows = await db.getAllAsync(sql, [today, id]);
    console.log(rows);
    return rows;
  } catch (e) {
    console.log("getReleasedCarCount fonksiyonunda hata oluştu: " + e);
    return 0;
  }
};

export const getPrices = async (today) => {
  try {
    const sql = `SELECT c.entry_date, c.exit_date, c.category_id, cate.daily_price AS dailyPrice FROM cars c LEFT JOIN categories cate ON cate.id = c.category_id WHERE date(c.exit_date) = ?`;
    const rows = await db.getAllAsync(sql, [today]);
    console.log(rows);
    return rows;
  } catch (e) {
    console.log("getPrices fonksiyonunda hata oluştu: " + e);
    return 0;
  }
};

export const getCarCount = async () => {
  try {
    const sql = `SELECT COUNT(*) as count FROM cars WHERE status = ?`;
    const rows = await db.getAllAsync(sql, ["inside"]);
    return rows;
  } catch (e) {
    console.error(
      "getCarCount fonksiyonunda araç sayısı hesaplanırken hata oluştu: " + e,
    );
  }
};

export const getCarsWithFilters = async (plate, startDate, endDate) => {
  try {
    let query = `
      SELECT c.*, cate.name as category_name, cate.daily_price as category_price, park.slot_code as car_slot
      FROM cars c
      LEFT JOIN categories cate ON c.category_id = cate.id
      LEFT JOIN parking_slots park ON  c.park_id = park.id
      WHERE status = 'inside'
    `;
    let params = [];

    // Kullanıcı plakayı doldurduysa
    if (plate && plate.trim() !== "") {
      query += " AND c.plate LIKE ?";
      params.push(`%${plate.trim()}%`);
    }

    // Tarihler doluysa
    if (startDate && endDate) {
      query += " AND date(c.entry_date) BETWEEN date(?) AND date(?)";
      params.push(startDate, endDate);
    }

    query += " ORDER BY c.entry_date DESC;";

    // sorguyu çalıştır.
    const rows = await db.getAllAsync(query, params);
    return rows;
  } catch (e) {
    console.error("searchCarsWithFilters SQL katmanında hata oluştu: ", e);
    return [];
  }
};
