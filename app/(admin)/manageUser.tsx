import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { handleDeleteUser, handleGetUsers } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface User {
  id: string;
  name: string;
  surname: string;
  username: string;
  personal_number: string;
  role: string;
  status: string;
}

export default function ManageUserScreen() {
  const [users, setUsers] = useState<User[]>([]);

  // sayfa her açıldığında çaışacak fonksiyon.
  const loadUsersData = async () => {
    const data = await handleGetUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const handleDeletePress = (id: number, username: string) => {
    Alert.alert(
      "Personeli Sil",
      `${username} kullanıcısını silmek istediğinize emin misiniz?`,
      [
        { text: "VAZGEÇ", style: "cancel" },
        {
          text: "SİL",
          style: "destructive",
          onPress: async () => {
            const success = await handleDeleteUser(id, username);
            if (success) {
              Alert.alert("Başarılı", "Personel sistemden silindi!");
              loadUsersData();
            } else {
              Alert.alert("Hata", "Silme işlemi sırasında sorun çıktı.");
            }
          },
        },
      ],
    );
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.infoArea}>
        <View style={styles.rowTop}>
          <Text style={styles.usernameText}>{item.username}</Text>
          <Text style={styles.personalNumberText}>
            Pers. No.: {item.personal_number}
          </Text>
        </View>

        {/* Ad Soyad ve Badgeler */}
        <View style={styles.rowBottom}>
          <Text style={styles.fullNameText}>
            {item.name} {item.surname}
          </Text>

          {/* Dinamik Rol ve Statü */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                styles.roleBadge,
                item.role === "admin" && { backgroundColor: Colors.softRed },
              ]}>
              <Text style={styles.badgeText}>
                {item.role === "admin" ? "Admin" : "Personel"}
              </Text>
            </View>
            <View style={[styles.badge, styles.statusBadge]}>
              <Text style={styles.badgeText}>
                {item.status === "active" ? "Aktif" : "Pasif"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* İşlem Butonları */}
      <View style={styles.buttonArea}>
        {/* Düzenle */}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => console.log(`Düzenleme açılacak ID: ${item.id}`)}>
          <Ionicons name="pencil" size={16} color={Colors.white} />
        </TouchableOpacity>

        {/* Sil */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePress(Number(item.id), item.username)}>
          <Ionicons name="trash" size={14} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingTop: 50,
  },
  listContent: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    width: "90%",
    minHeight: 80,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row", // Bilgiler ve butonlar yan yana
    padding: 10,
    marginBottom: 10,
    elevation: 3,
  },

  // İsim Soyisim Kul Adı
  infoArea: {
    flex: 1, // Butonlardan kalan tüm genişliği kapla
    justifyContent: "space-between",
    paddingRight: 10,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between", // Kullanıcı adı sola, numara sağa yaslanacak
    alignItems: "center",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  usernameText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: Fonts.mainFont,
  },
  personalNumberText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Fonts.expFont,
  },
  fullNameText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.mainFont,
  },

  // Badge
  badgeRow: { flexDirection: "row", gap: 5 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleBadge: { backgroundColor: "#34495E" },
  statusBadge: { backgroundColor: Colors.softGreen },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
  },

  buttonArea: {
    width: 45,
    justifyContent: "space-between",
    gap: 4,
  },
  actionButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  editButton: {
    // düzenle
    flex: 0.65,
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    // sil
    flex: 0.35,
    backgroundColor: Colors.softRed,
  },
});
