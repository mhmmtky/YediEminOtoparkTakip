import { getAllCar, saveCar, updateCarInfoById } from "@/src/database/carDb";
import { db } from "@/src/database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogService from "./logs";
import {
  getParkInfoById,
  handleGetParkInfoByCarId,
  handleSaveParking,
  handleUpdateParkInfoById,
} from "./parkingService";

export const handleAddCar = async (fCarData) => {
  const {
    brand,
    model,
    plate,
    mileage,
    year,
    category_id: tempCategory,
    park_id,
  } = fCarData;

  const cleanCategoryId =
    tempCategory && typeof tempCategory === "object"
      ? tempCategory.id
      : tempCategory;

  try {
    const sessionData = await AsyncStorage.getItem("@user_session");

    let personal_id = null;
    let activeUsername = "Sistem";

    if (sessionData !== null) {
      const parsedUser = JSON.parse(sessionData);
      personal_id = parsedUser.id;
      activeUsername = parsedUser.username;
    }

    const carData = {
      brand,
      model,
      plate,
      mileage,
      year,
      category_id: cleanCategoryId,
      park_id,
      personal_id,
    };

    let newCarId = null;
    let slotCode = "Bilinmeyen";

    await db.withTransactionAsync(async () => {
      const carResult = await saveCar(carData);

      newCarId = carResult.lastInsertRowId; // Oluşan yeni araba idsini alır

      // parking_slots tablosundaki yerini kaydeder
      const parkingResponse = await handleSaveParking(park_id, newCarId);

      if (!parkingResponse || !parkingResponse.success) {
        throw new Error(
          parkingResponse?.error ||
            "Otopark slotu güncellenemedi, transaction iptal ediliyor!",
        );
      }

      const parkInfo = await getParkInfoById(park_id);
      if (parkInfo && parkInfo.slot_code) {
        slotCode = parkInfo.slot_code;
      }
    });

    const logData = {
      userId: personal_id,
      username: activeUsername,
      actionType: "INSERT",
      description:
        activeUsername +
        " kişisi " +
        plate +
        " aracın " +
        slotCode +
        " konumuna kaydını gerçekleştirdi!",
    };

    await LogService.createLog(logData);

    return { success: true, carId: newCarId };
  } catch (e) {
    console.error("Transaction hatası! Yapılan işlemler geri alındı:", e);
    return { success: false, error: "Araç kaydı yapılırken bir sorun oluştu" };
  }
};

export const handleGetAllCar = async () => {
  try {
    const cars = await getAllCar();
    console.log("ön yüze gidiyor");
    return cars;
  } catch (e) {
    console.error(
      "Servis katmanında aktif araçlar çekilirken hata oluştu: ",
      e,
    );
    return [];
  }
};

export const handleUpdateCarInfoById = async (carData) => {
  const { id, brand, model, blockName, slot, park_id, plate } = carData;
  const parkInfo = await handleGetParkInfoByCarId(id);
  let success = null;
  const sessionData = await AsyncStorage.getItem("@user_session");

  let personal_id = null;
  let activeUsername = "Sistem";

  if (sessionData !== null) {
    const parsedUser = JSON.parse(sessionData);
    personal_id = parsedUser.id;
    activeUsername = parsedUser.username;
  }
  try {
    await db.withTransactionAsync(async () => {
      if (!brand || !model || !blockName || !slot) {
        success = { msg: "Lütfen boş alanlar doldurunuz!", success: false };
        return success;
      }
      const result = await updateCarInfoById(carData);
      if (!result) {
        success = {
          msg: "Araç bilgileri güncellenirken bir sorun oluştu! Lütfen tekrar deneyin!",
          success: false,
        };
        return success;
      }

      await handleSaveParking(Number(slot), id);
      if (parkInfo && parkInfo.length > 0 && parkInfo[0]) {
        const oldParkId = parkInfo[0].id;

        if (Number(oldParkId) !== Number(slot)) {
          const clearResult = await handleUpdateParkInfoById(oldParkId);
          if (!clearResult) {
            success = { msg: "Eski park yeri boşaltılamadı!", success: false };
            throw new Error("Eski park yeri silinirken hata oluştu.");
          }
        }
      }
    });
    const logData = {
      userId: personal_id,
      username: activeUsername,
      actionType: "UPDATE",
      description:
        activeUsername +
        " kişisi " +
        plate +
        " aracının bilgilerini güncelledi. " +
        "Otopark Konumu: " +
        blockName +
        "-" +
        parkInfo[0].number +
        " Marka Model: " +
        brand +
        " " +
        model +
        ".",
    };

    await LogService.createLog(logData);
    success = { msg: "Araç başarıyla güncellendi!", success: true };
    return success;
  } catch (e) {
    console.error(
      "CarService katmanında handleUpdateCarInfoById fonksiyonunda hata oluştu: " +
        e,
    );
    success = {
      msg: "Araç bilgileri güncellenirken bir sorun oluştu! Lütfen tekrar deneyin!",
      success: false,
    };
    return success;
  }
};
