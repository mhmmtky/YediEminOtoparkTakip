import { saveOwner } from "@/src/database/ownerDb";

export const handleAddOwner = async (ownerData) => {
  const { full_name, phone, tc_no } = ownerData;

  if (!full_name || !phone || !tc_no) {
    return {
      success: false,
      error: "Müşteri bilgileri eksiksiz giriniz!",
    };
  }

  try {
    const result = await saveOwner({
      full_name: full_name.trim(),
      phone: phone.trim(),
      tc_no: tc_no.trim(),
    });

    if (result && result.lastInsertRowId) {
      return {
        success: true,
        ownerId: result.lastInsertRowId,
      };
    } else {
      return {
        success: false,
        error: "Veritabanına sahip kaydı atılırken bir sorun oluştu!",
      };
    }
  } catch (e) {
    console.error("OwnerService katmanında handleAddOwner hatası oluştu: ", e);
    return {
      success: false,
      error: "Müşteri servis katmanı asenkron işlem hatası!",
    };
  }
};
