import { db } from "./db";

export const loginUser = (username, password) => {
  try {
    const user = db.getFirstSync(
      "SELECT * FROM users WHERE username = ? AND password = ?;",
      [username, password],
    );
    return user;
  } catch (e) {
    console.error("LOG: Login Sorgu Hatası:", e);
    return null;
  }
};

export const getUsers = async () => {
  try {
    const rows = await db.getAllAsync(
      "SELECT id, name, surname, username, personal_number, status, role FROM users WHERE status !='deleted';",
    );
    return rows || [];
  } catch (e) {
    console.error("Kullanıcılar getirilirken sorun oluştu.:", e);
    return [];
  }
};

export const saveUser = async (user) => {
  try {
    const { name, surname, username, password, personal_number, role, status } =
      user;

    const result = await db.runAsync(
      `INSERT INTO users (name, surname, username, password, personal_number, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [name, surname, username, password, personal_number, role, status],
    );

    return result;
  } catch (e) {
    console.log(e);
  }
};

export const deleteUserById = async (id, username) => {
  try {
    const result = await db.runAsync(
      "UPDATE users SET username = ?, status = 'deleted' WHERE id = ?;",
      [username, id],
    );
    return true;
  } catch (e) {
    console.error("SQL Katmanında Hata:", e);
    return false;
  }
};

export const updateUserById = async (id, name, surname, username, password) => {
  try {
    const result = await db.runAsync(
      `UPDATE users 
       SET name = ?, surname = ?, username = ?, password = ? 
       WHERE id = ?;`,
      [name, surname, username, password, id],
    );
    return true;
  } catch (e) {
    console.error("SQL Katmanında Profil Güncelleme Hatası:", e);
    return false;
  }
};

export const getUserById = async (id) => {
  try {
    const result = await db.runAsync(`SELECT * FROM users WHERE id=?;`, [id]);
    return result;
  } catch (e) {
    console.error("SQL Katmanında SELECT Hatası:", e);
    return [];
  }
};
