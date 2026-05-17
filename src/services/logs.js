import { getLogs, saveLog } from "../database/logsDb";

class LogService {
  async createLog(logData) {
    try {
      const { userId, username, actionType, description } = logData;
      await saveLog(userId, username, actionType, description);
      return true;
    } catch (e) {
      console.error("Log kayıt anındabir hata oluştu! " + e);
    }
  }

  async getLog(filters = {}) {
    try {
      const { selectedDate = null, selectedUser = null } = filters;

      const dateParam =
        selectedDate && selectedDate.trim() !== "" ? selectedDate : null;
      const userParam =
        selectedUser && selectedUser.trim() !== "" ? selectedUser : null;

      return await getLogs(dateParam, userParam);
    } catch (e) {
      console.error("Log çekilirken bir sorun oluştu.");
    }
  }
}
