import {
  getBlocks,
  getEmptySlotsByBlock,
  getParkCount,
  getParkInfoByCarId,
  getParkInfoByIdSql,
  savePark,
  updateParkInfoById,
} from "@/src/database/parkingDb";

export const handleGetBlocks = async () => {
  return await getBlocks();
};

export const handleGetEmptySlotsByBlock = async (blockName) => {
  if (!blockName) return [];
  return await getEmptySlotsByBlock(blockName);
};

export const handleSaveParking = async (parkId, carId) => {
  if (!parkId || parkId < 1 || parkId > 780) {
    return { success: false, error: "Geçersiz Slot ID'si!" };
  }

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
