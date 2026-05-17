import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";

const MOCK_LOGS = [
  {
    id: "1",
    userName: "Muhammet",
    actionType: "INSERT",
    description: "Muhammet, 33M344 plakalı aracı otoparka kabul etti.",
    time: "17:15",
  },
  {
    id: "2",
    userName: "Eren",
    actionType: "DELETE",
    description:
      "Eren, 34XYZ34 plakalı aracın çıkışını yaptı. (150 TL tahsil edildi)",
    time: "16:40",
  },
  {
    id: "3",
    userName: "Muhammet",
    actionType: "UPDATE",
    description: "Muhammet, otopark kapasitesini 120 olarak güncelledi.",
    time: "15:10",
  },
  {
    id: "4",
    userName: "Yunus",
    actionType: "SYSTEM",
    description: "Yunus isimli personel sisteme giriş yaptı.",
    time: "09:00",
  },
  {
    id: "5",
    userName: "Eren",
    actionType: "INSERT",
    description: "Eren, 41BRK41 plakalı aracı otoparka kabul etti.",
    time: "08:25",
  },
  {
    id: "6",
    userName: "Muhammet",
    actionType: "DELETE",
    description:
      "Muhammet, 06ABC06 plakalı aracın çıkışını yaptı. (200 TL tahsil edildi)",
    time: "07:40",
  },
  {
    id: "7",
    userName: "Muhammet",
    actionType: "DELETE",
    description:
      "Muhammet, 06ABC06 plakalı aracın çıkışını yaptı. (200 TL tahsil edildi)",
    time: "07:40",
  },
  {
    id: "8",
    userName: "Muhammet",
    actionType: "DELETE",
    description:
      "Muhammet, 06ABC06 plakalı aracın çıkışını yaptı. (200 TL tahsil edildi)",
    time: "07:40",
  },
  {
    id: "9",
    userName: "Muhammet",
    actionType: "DELETE",
    description:
      "Muhammet, 06ABC06 plakalı aracın çıkışını yaptı. (200 TL tahsil edildi)",
    time: "07:40",
  },
];

export default function SystemLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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

  const renderLogItem = ({ item }: { item: (typeof MOCK_LOGS)[0] }) => {
    const borderColor = getActionColor(item.actionType);

    return (
      <View style={[styles.logCard, { borderLeftColor: borderColor }]}>
        <View style={styles.logHeader}>
          <Text style={styles.logUser}>{item.userName}</Text>
          <Text style={styles.logTime}>{item.time}</Text>
        </View>
        <Text style={styles.logText}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* FİLTRE BUTONLARI (SABİT) */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Tarih Seç</Text>
          <Ionicons name="chevron-down" size={14} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Personel Seç</Text>
          <Ionicons name="chevron-down" size={14} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_LOGS}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
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
    fontSize: 12,
  },
  logText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
  },
});
