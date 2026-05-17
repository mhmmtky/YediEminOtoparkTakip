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
