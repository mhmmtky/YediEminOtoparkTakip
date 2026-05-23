import { db } from "./db";

export async function getParkInfoByIdSql(parkId) {
  try {
    const result = await db.getFirstAsync(
      `SELECT id, block, number, slot_code FROM parking_slots WHERE id = ?;`,
      [parkId],
    );
    return result;
  } catch (e) {
    console.error(
      `SQL Katmanında Slot (${parkId}) getirilirken hata oluştu: `,
      e,
    );
    return null;
  }
}

export const getBlocks = async () => {
  try {
    const rows = await db.getAllAsync(
      "SELECT DISTINCT block FROM parking_slots ORDER BY block ASC;",
    );
    return rows.map((row) => row.block);
  } catch (e) {
    console.error("SQL Katmanında bloklar çekilirken hata oluştu: ", e);
    return [];
  }
};

export const getEmptySlotsByBlock = async (blockName) => {
  try {
    const rows = await db.getAllAsync(
      "SELECT id, number, slot_code FROM parking_slots WHERE block = ? AND is_full = 0 ORDER BY number ASC;",
      [blockName],
    );
    return rows;
  } catch (e) {
    console.error(
      `SQL Katmanında ${blockName} bloğu slotları çekilirken hata oluştu: `,
      e,
    );
    return [];
  }
};

export const savePark = async (parkId, carId) => {
  try {
    const parkInfo = await getParkInfoByIdSql(parkId);

    const slotCode = parkInfo.block + "-" + parkInfo.number;
    const result = await db.runAsync(
      `UPDATE parking_slots SET is_full = ?, car_id = ?, slot_code = ? WHERE id = ?;`,
      [1, carId, slotCode, parkId],
    );

    return result;
  } catch (e) {
    console.error(
      `SQL Katmanında Slot (${parkId}) güncellenirken hata oluştu: `,
      e,
    );
    return false;
  }
};

export const getParkInfoByCarId = async (carId) => {
  try {
    const rows = await db.getAllAsync(
      "SELECT * FROM parking_slots WHERE car_id = ?;",
      [carId],
    );
    return rows;
  } catch (e) {
    console.error(
      `SQL Katmanında ${carId} park bilgileri çekilirken hata oluştu: `,
      e,
    );
    return [];
  }
};

export const updateParkInfoById = async (parkId) => {
  try {
    const result = await db.runAsync(
      `UPDATE parking_slots SET is_full = ?, car_id = ? WHERE id = ?;`,
      [0, null, parkId],
    );

    return result;
  } catch (e) {
    console.error(
      `SQL Katmanında Slot (${parkId}) güncellenirken hata oluştu: `,
      e,
    );
    return false;
  }
};
