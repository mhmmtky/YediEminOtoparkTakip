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
      `getParkInfoByIdSql Slot (${parkId}) getirilirken hata oluştu: `,
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
    console.error(
      "getBlocks fonksiyonunda bloklar çekilirken hata oluştu: ",
      e,
    );
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
      `getEmptySlotsByBlock fonksiyonunda ${blockName} bloğu slotları çekilirken hata oluştu: `,
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
      `savePark fonksiyounda Slot (${parkId}) güncellenirken hata oluştu: `,
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
      ` getParkInfoByCarId fonksiyonunda ${carId} park bilgileri çekilirken hata oluştu: `,
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
      `updateParkInfoById fonksiypunda Slot (${parkId}) güncellenirken hata oluştu: `,
      e,
    );
    return false;
  }
};

export const getParkCount = async () => {
  try {
    const rows = await db.getAllAsync(
      "SELECT COUNT(*) as count FROM parking_slots",
    );
    return rows;
  } catch (e) {
    console.error(
      `getParkCount fonksiyonunda park sayısı çekilirken hata oluştu: `,
      e,
    );
    return 0;
  }
};

export const getLastSlotByBlockName = async (blockName) => {
  try {
    const count = await db.getFirstSync(
      "SELECT MAX(number) as maxNumber FROM parking_slots WHERE block = ?;",
      [blockName],
    );
    return count;
  } catch (e) {
    console.error(
      `getLastSlotByBlockName park bilgileri çekilirken hata oluştu: `,
      e,
    );
    return 0;
  }
};

export const addParkingSlot = async (blockName, slotCode, number) => {
  try {
    db.runSync(
      "INSERT INTO parking_slots (block, number, slot_code) VALUES (?, ?, ?);",
      [blockName, number, slotCode],
    );
    return true;
  } catch (e) {
    console.error("addParkingSlot fonksiyonunda hata oluştu: ", e);
    return false;
  }
};

export const deleteParkingSlot = async (blockName, deletedCount) => {
  try {
    db.runSync(
      `DELETE FROM parking_slots 
       WHERE id IN (
         SELECT id FROM parking_slots 
         WHERE block = ? AND is_full = 0 
         ORDER BY number DESC 
         LIMIT ?
       );`,
      [blockName, deletedCount],
    );

    console.log(
      `${blockName} bloğundan ${deletedCount} adet boş slot başarıyla silindi.`,
    );
    return true;
  } catch (e) {
    console.error("deleteParkingSlot fonksiyonunda hata koptu amk: ", e);
    return false;
  }
};
