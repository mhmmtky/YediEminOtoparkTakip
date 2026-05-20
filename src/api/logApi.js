import LogService from "@/src/services/logs";

export const fetchLogs = async (filters = {}) => {
  try {
    const response = await LogService.getLog(filters);
    return response;
  } catch (e) {
    console.error("Loglar çekilirken hata oluştu:", e);
    return [];
  }
};
