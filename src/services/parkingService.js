import {
  addParkingSlot,
  deleteParkingSlot,
  getBlocks,
  getEmptySlotsByBlock,
  getLastSlotByBlockName,
  getParkCount,
  getParkInfoByCarId,
  getParkInfoByIdSql,
  savePark,
  updateParkInfoById,
} from "@/src/database/parkingDb";
import LogService from "@/src/services/logs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const handleGetBlocks = async () => {
  return await getBlocks();
};

export const handleGetEmptySlotsByBlock = async (blockName) => {
  if (!blockName) return [];
  return await getEmptySlotsByBlock(blockName);
};

export const handleSaveParking = async (parkId, carId) => {
  if (!parkId || parkId < 1) {
    return { success: false, error: "Geçersiz Slot ID'si!" };
  }

  console.log(carId);

  if (!carId) {
    return { success: false, error: "Geçersiz Araç ID'si!" };
  }

  try {
    const result = await savePark(parkId, carId);

    if (result && result.changes > 0) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Böyle bir slot bulunamadı veya güncellenemedi!",
      };
    }
  } catch (e) {
    console.error("Servis katmanında park kaydı işlenirken hata oluştu: ", e);
    return {
      success: false,
      error: "Servis katmanında park kaydı işlenirken hata oluştu!",
    };
  }
};

export const getParkInfoById = async (parkId) => {
  {
    if (!parkId) return [];
    return await getParkInfoByIdSql(parkId);
  }
};

export const handleGetParkInfoByCarId = async (carId) => {
  {
    try {
      if (!carId) return [];
      return await getParkInfoByCarId(carId);
    } catch (e) {
      console.error(
        "ParkService katmanında handleGetParkInfoByCarId fonksiyonunda hata oluştu: " +
          e,
      );
    }
  }
};

export const handleUpdateParkInfoById = async (parkId) => {
  try {
    if (!parkId) {
      return false;
    }
    const result = await updateParkInfoById(parkId);
    if (!result) {
      console.log(
        "Serivis Katmanında handleUpdateParkInfoById fonksiyonunda Park Bilgileri güncellenemedi! Lütfen tekrar deneyin.",
      );
      return false;
    }
    return true;
  } catch (e) {
    console.log(
      "Serivis Katmanında handleUpdateParkInfoById fonksiyonunda Park Bilgileri güncellenirken hata oluştu: " +
        e,
    );
  }
};

export const handleGetParkCount = async () => {
  try {
    const count = await getParkCount();
    return count[0].count;
  } catch (e) {
    console.log(
      "Serivis Katmanında handleGetParkCount fonksiyonunda Park sayısı hesaplanırken hata oluştu: " +
        e,
    );
    return 0;
  }
};

export const handleGetLastSlotByBlockName = async (blockName) => {
  try {
    const result = await getLastSlotByBlockName(blockName);
    return result;
  } catch (e) {
    console.error(
      "handleGetLastSlotByBlockName fonksiyonunda hata oluştu: " + e,
    );
    return { maxNumber: 0 };
  }
};

export const handleUpdateBlockCapacity = async (blockName, newCapacity) => {
  try {
    const maxResult = await getLastSlotByBlockName(blockName);
    const currentMaxNumber = maxResult.maxNumber ? maxResult.maxNumber : 0;

    const diff = newCapacity - currentMaxNumber;

    const sessionData = await AsyncStorage.getItem("@user_session");
    let personal_username = "Bilinmeyen";
    let personal_id = null;
    console.log("session alındı");

    if (sessionData) {
      const parsedUser = JSON.parse(sessionData);
      personal_username = parsedUser.username;
      personal_id = parsedUser.id;
    }

    if (diff > 0) {
      for (let i = 1; i <= diff; i++) {
        const nextNumber = currentMaxNumber + i;
        const slotCode = `${blockName}-${nextNumber}`;

        await addParkingSlot(blockName, slotCode, nextNumber);
      }
      console.log(`${blockName} bloğuna ${diff} tane yeni slot eklendi!`);

      const logData = {
        userId: personal_id,
        username: personal_username,
        actionType: "UPDATE",
        description:
          personal_username +
          " kişisi " +
          blockName +
          " bloğundaki slot sayısını " +
          newCapacity +
          " olarak güncelledi!",
      };

      await LogService.createLog(logData);
      return { success: true, message: `${diff} adet slot başarıyla eklendi.` };
    } else if (diff < 0) {
      const deletedCount = Math.abs(diff);

      await deleteParkingSlot(blockName, deletedCount);

      console.log(
        `${blockName} bloğundan ${deletedCount} adet boş slot silindi.`,
      );

      const logData = {
        userId: personal_id,
        username: personal_username,
        actionType: "UPDATE",
        description:
          personal_username +
          " kişisi " +
          blockName +
          " bloğundaki slot sayısını " +
          newCapacity +
          " olarak güncelledi!",
      };

      await LogService.createLog(logData);
      return { success: true, message: `${deletedCount} adet slot silindi.` };
    }

    return {
      success: true,
      message: "Kapasite zaten aynı, işlem yapılmadı.",
    };
  } catch (e) {
    console.error("Blok kapasitesi güncellenirken hata oluştu:", e);
    return { success: false, error: e.message };
  }
};
