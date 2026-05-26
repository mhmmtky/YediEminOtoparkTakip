import {
  deleteCarById,
  getAddedCarCount,
  getAllCar,
  getCarCount,
  getCarsWithFilters,
  getPrices,
  getReleasedCarCount,
  getReleasedCars,
  saveCar,
  updateCarInfoById,
} from "@/src/database/carDb";
import { db } from "@/src/database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogService from "./logs";
import { handleAddOwner } from "./ownerService";
import {
  getParkInfoById,
  handleGetParkInfoByCarId,
  handleSaveParking,
  handleUpdateParkInfoById,
} from "./parkingService";

// --------- ARAÇ KAYDETME
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

// ------- ARAÇLARI GETİRME
export const handleGetAllCar = async () => {
  try {
    const cars = await getAllCar();
    console.log("front-ende gidiyor");
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
  let success = { msg: "İşlem başlatılamadı", success: false };
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
        throw new Error("Empty Data");
      }
      const result = await updateCarInfoById(carData);
      if (!result) {
        success = {
          msg: "Araç bilgileri güncellenirken bir sorun oluştu! Lütfen tekrar deneyin!",
          success: false,
        };
        throw new Error("Car update failed");
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

// -------- ARAÇ ÇIKIŞI
export const handleDeleteCarById = async (carData) => {
  const { id, park_id, plate, full_name, phone, tc_no } = carData;
  let success = { msg: "İşlem başlatılamadı", success: false };

  const sessionData = await AsyncStorage.getItem("@user_session");

  let personal_id = null;
  let activeUsername = "Sistem";

  if (sessionData !== null) {
    const parsedUser = JSON.parse(sessionData);
    personal_id = parsedUser.id;
    activeUsername = parsedUser.username;
  }

  console.log("KAYDEDİLEN: " + personal_id + " " + activeUsername);
  const sql = `SELECT id, username FROM users WHERE 1=1`;
  const rows = await db.getAllAsync(sql);
  rows.forEach((element) => {
    console.log("SQL: " + element.id + " " + element.username);
  });

  try {
    const ownerRes = await handleAddOwner({ full_name, phone, tc_no });

    if (!ownerRes || !ownerRes.success || !ownerRes.ownerId) {
      return {
        msg:
          ownerRes?.error ||
          "Müşteri kaydı oluşturulamadığı için araç çıkışı iptal edildi!",
        success: false,
      };
    }

    const ownerId = ownerRes.ownerId;

    await db.withTransactionAsync(async () => {
      const carResult = await deleteCarById({
        status: "out",
        exit_date: new Date().toISOString(),
        is_paid: 1,
        park_id: null,
        owner_id: Number(ownerId),
        id: Number(id),
        personal_id,
      });

      if (!carResult) {
        success = { msg: "Araç çıkış kaydı güncellenemedi!", success: false };
        throw new Error("Car update failed"); // Rollback
      }

      const clearSlot = await handleUpdateParkInfoById(Number(park_id));
      if (!clearSlot) {
        success = { msg: "Otopark slotu boşa çıkarılamadı!", success: false };
        throw new Error("Slot clearing failed");
      }

      success = {
        msg: "Araç otoparktan başarıyla çıkışı yapıldı!",
        success: true,
      };
    });

    const logData = {
      userId: personal_id,
      username: activeUsername,
      actionType: "DELETE",
      description:
        activeUsername +
        " kişisi " +
        plate +
        " aracını " +
        full_name +
        " kişisine teslim etti!",
    };

    await LogService.createLog(logData);

    return success;
  } catch (e) {
    console.error("CarService katmanında handleDeleteCarById hatası:", e);
    if (success.success !== true && success.msg === "İşlem başlatılamadı") {
      success = {
        msg: "Araç çıkışı yapılırken bir sorun oluştu! Lütfen tekrar deneyin!",
        success: false,
      };
    }
    return success;
  }
};

export const handleGetReleasedCars = async () => {
  try {
    const releasedCars = await getReleasedCars();
    return releasedCars;
  } catch (e) {
    console.error(
      "Servis katmanında çıkan araçlar listelenirken hata oluştu: ",
      e,
    );
    return [];
  }
};

export const handleGetAddedCarCount = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const sessionData = await AsyncStorage.getItem("@user_session");

    const parsedUser = JSON.parse(sessionData);
    const count = await getAddedCarCount(today, parsedUser.id);
    if (count && count.length > 0) {
      return count[0].count;
    }

    return 0;
  } catch (e) {
    console.error("Bugünün araç sayısı çekilirken hata oluştu:", e);
    return 0;
  }
};

export const handleGetReleasedCarCount = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const sessionData = await AsyncStorage.getItem("@user_session");

    const parsedUser = JSON.parse(sessionData);
    const count = await getReleasedCarCount(today, parsedUser.id);
    if (count && count.length > 0) {
      return count[0].count;
    }

    return 0;
  } catch (e) {
    console.error("Bugünün araç sayısı çekilirken hata oluştu:", e);
    return 0;
  }
};

export const handleGetPrices = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const prices = await getPrices(today);

    let totalPrice = 0;

    if (prices && prices.length > 0) {
      prices.forEach((price) => {
        const entry = new Date(price.entry_date);
        const exit = new Date(price.exit_date);

        // 2 tarih arasındaki ms farkı
        const differenceInMs = exit.getTime() - entry.getTime();

        //ms güne çevirir.
        let daysSpent = differenceInMs / (1000 * 60 * 60 * 24);

        // yuvarla.
        daysSpent = Math.ceil(daysSpent);
        if (daysSpent <= 0) daysSpent = 1; // taban 1

        totalPrice += daysSpent * price.dailyPrice;
      });
    }

    return totalPrice;
  } catch (e) {
    console.error("Bugünün araç sayısı çekilirken hata oluştu:", e);
    return 0;
  }
};

export const handleGetCarCount = async () => {
  try {
    const count = await getCarCount();
    return count[0].count;
  } catch (e) {
    console.log("handlegetCarCount fonksiyonunda hata oluştu: " + e);
    return 0;
  }
};

export const handleGetCarsWithFilters = async (
  plate,
  startDateObj,
  endDateObj,
) => {
  try {
    let formattedStart = null;
    let formattedEnd = null;

    if (startDateObj instanceof Date) {
      formattedStart = startDateObj.toISOString().split("T")[0];
    }

    if (endDateObj instanceof Date) {
      formattedEnd = endDateObj.toISOString().split("T")[0];
    }

    const cars = await getCarsWithFilters(plate, formattedStart, formattedEnd);

    return { success: true, data: cars || [] };
  } catch (e) {
    console.error("carService katmanında filtreleme hatası oluştu:", e);
    return {
      success: false,
      error: "Kayıtlar sorgulanırken sistemsel bir hata oluştu.",
    };
  }
};
