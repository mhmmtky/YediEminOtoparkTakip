import { Fonts } from "@/constants/Fonts";
import { fetchLogs } from "@/src/api/logApi";
import { handleGetUsers } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface LogItem {
  id: number;
  username: string;
  action_type: string;
  description: string;
  created_at: string;
}

interface UserItem {
  id: string;
  username: string;
}

export default function SystemLogsScreen() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Veri yükleniyor mu takibi
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Tarih Fİltreleme
  const [date, setDate] = useState(new Date()); // Takvimin başlangıç değeri için gerçek Date objesi
  const [showDatePicker, setShowDatePicker] = useState(false); // Takvim açık mı kapalı mı

  // Personel Filtreleme
  const [showUserModal, setShowUserModal] = useState(false); // Modal açık mı
  const [searchQuery, setSearchQuery] = useState(""); // Arama çubuğuna yazılan metin

  const [users, setUsers] = useState<UserItem[]>([]);

  const loadLogsData = async () => {
    try {
      setLoading(true);

      const LogService = require("@/src/services/logs").default;

      const data = await fetchLogs({ selectedDate, selectedUser });
      setLogs(data || []);
    } catch (e) {
      console.error("Log verisi çekilirken hata oluştu:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersFromDB = async () => {
    try {
      const dbUsers = await handleGetUsers();

      const formattedUsers = dbUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
      }));

      setUsers(formattedUsers);
    } catch (e) {
      console.error("Personel listesi servis üzerinden çekilemedi: ", e);
    }
  };

  // Sayfa ilk açıldığında personelleri DB'den yükle
  useEffect(() => {
    loadUsersFromDB();
  }, []);

  const onChangeDate = (event: any, selectedDateValue?: Date) => {
    // Android'de iptal basılırsa takvimi kapat
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    setShowDatePicker(Platform.OS === "ios"); // iOS ise açık kalabilir, Android ise hemen kapansın

    if (selectedDateValue) {
      setDate(selectedDateValue);

      // Tarihi YYYY-MM-DD formatına çeviriyoruz
      const year = selectedDateValue.getFullYear();
      const month = String(selectedDateValue.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDateValue.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setSelectedDate(formattedDate); // Bu state değiştiği an useEffect tetiklenecek ve logları filtreleyecek!
    }
  };

  useEffect(() => {
    loadLogsData();
  }, [selectedUser, selectedDate]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getActionColor = (type: string) => {
    switch (type) {
      case "INSERT":
        return Colors.success; // Yeşil
      case "DELETE":
        return Colors.error; // Kırmızı
      case "UPDATE":
        return Colors.primary; // Mavi
      default:
        return Colors.system; // Gri
    }
  };

  const renderLogItem = ({ item }: { item: LogItem }) => {
    const borderColor = getActionColor(item.action_type);

    return (
      <View style={[styles.logCard, { borderLeftColor: borderColor }]}>
        <View style={styles.logHeader}>
          <Text style={styles.logUser}>{item.username}</Text>
          <Text style={styles.logTime}>{item.created_at}</Text>
        </View>
        <Text style={styles.logText}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* FİLTRE BUTONLARI */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.filterText}>Tarih Seç</Text>
          <Ionicons name="chevron-down" size={14} color="white" />
        </TouchableOpacity>
        {/* PERSONEL SEÇME BUTONU */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowUserModal(true)}>
          {/* Basınca modalı açar */}
          <Text style={styles.filterText}>
            {selectedUser ? selectedUser : "Personel Seç"}
          </Text>
          {selectedUser ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedUser("");
              }}>
              <Ionicons name="close-circle" size={16} color="white" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={14} color="white" />
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
            maximumDate={new Date()} // Gelecekteki tarihleri seçtirmeyelim
          />
        )}
      </View>

      {/* PERSONEL SEÇME MODALI */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Başlığı */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personel Seç</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowUserModal(false);
                  setSearchQuery("");
                }}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Arama Çubuğu */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={18}
                color={Colors.system}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Personel ara..."
                placeholderTextColor={Colors.system}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Personel Listesi */}
            <FlatList
              data={filteredUsers} // Süzülmüş liste gidiyor
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    setSelectedUser(item.username);
                    setShowUserModal(false);
                    setSearchQuery(""); // Aramayı sıfırla
                  }}>
                  <Text style={styles.userItemText}>{item.username}</Text>
                  {selectedUser === item.username && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.success}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 75,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
    marginTop: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.border,
    padding: 12,
    borderRadius: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.mainFont,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logCard: {
    backgroundColor: Colors.bars,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  logUser: {
    color: Colors.system,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  logTime: {
    color: Colors.header,
    fontSize: 8,
  },
  logText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: Colors.bars,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "75%",
  },
  modalHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.mainFont,
  },
  userItem: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userItemText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.mainFont,
  },
});
