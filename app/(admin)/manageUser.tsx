import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import {
  handleAdminUpdateUser,
  handleDeleteUser,
  handleGetUsers,
} from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editSurname, setEditSurname] = useState<string>("");
  const [editUsername, setEditUsername] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("personal");
  const [editPassword, setEditPassword] = useState<string>("");

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadUsersData = async () => {
    try {
      const data = await handleGetUsers();
      const sessionData = await AsyncStorage.getItem("@user_session");

      if (sessionData !== null && data) {
        const parsedUser = JSON.parse(sessionData);
        const currentAdminId = parsedUser.id.toString();

        const filteredUsers = data.filter(
          (user: User) => user.id.toString() !== currentAdminId,
        );
        setUsers(filteredUsers);
      } else {
        setUsers(data || []);
      }
    } catch (e) {
      console.error("Kullanıcı listesi filtrelenirken hata oluştu:", e);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const handleEditPress = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditSurname(user.surname);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditPassword("");
    setModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      const res = await handleAdminUpdateUser({
        id: selectedUser.id,
        name: editName,
        surname: editSurname,
        username: editUsername,
        role: editRole,
        password: editPassword,
      });

      if (res && res.success) {
        setModalVisible(false);
        loadUsersData();

        setStatus({
          message: `${editUsername} isimli personelin bilgileri başarıyla güncellendi!`,
          type: "success",
        });
        setTimeout(() => {
          setStatus(null);
        }, 3000);
      } else {
        setStatus({
          message: res?.error || "Personel güncellenirken bir sorun oluştu!",
          type: "error",
        });
        setTimeout(() => {
          setStatus(null);
        }, 3000);
      }
    } catch (e) {
      setStatus({ message: "Sistemsel bir hata oluştu!", type: "error" });
      setTimeout(() => {
        setStatus(null);
      }, 3000);
      console.error(e);
    }
  };

  const handleDeletePress = (id: number, username: string) => {
    Alert.alert(
      "Personeli Pasife Al",
      `${username} kullanıcısını sistemden silmek istediğinize emin misiniz?`,
      [
        { text: "VAZGEÇ", style: "cancel" },
        {
          text: "PASİFE AL",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await handleDeleteUser(id, username);
              if (success) {
                loadUsersData();

                setStatus({
                  message: `${username} personeli başarıyla silindi!`,
                  type: "success",
                });
                setTimeout(() => {
                  setStatus(null);
                }, 3000);
              } else {
                setStatus({
                  message: "Personel silme işlemi başarısız oldu!",
                  type: "error",
                });
                setTimeout(() => {
                  setStatus(null);
                }, 3000);
              }
            } catch (err) {
              setStatus({
                message: "Sistemsel bir hata koptu!",
                type: "error",
              });
              setTimeout(() => {
                setStatus(null);
              }, 3000);
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

        <View style={styles.rowBottom}>
          <Text style={styles.fullNameText}>
            {item.name} {item.surname}
          </Text>

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
            <View
              style={[
                styles.badge,
                styles.statusBadge,
                item.status !== "active" && { backgroundColor: "#7F8C8D" },
              ]}>
              <Text style={styles.badgeText}>
                {item.status === "active" ? "Aktif" : "Pasif"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPress(item)}>
          <Ionicons name="pencil" size={16} color={Colors.white} />
        </TouchableOpacity>

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
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>Personel Düzenle</Text>
              <Text style={styles.modalSubtitle}>
                Personelin sistem yetki ve bilgilerini ayarlayın.
              </Text>

              <Text style={styles.inputLabel}>Personel Adı</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.inputLabel}>Personel Soyadı</Text>
              <TextInput
                style={styles.modalInput}
                value={editSurname}
                onChangeText={setEditSurname}
              />

              <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
              <TextInput
                style={styles.modalInput}
                value={editUsername}
                onChangeText={setEditUsername}
              />

              <Text style={styles.inputLabel}>Yeni Giriş Şifresi</Text>
              <TextInput
                style={styles.modalInput}
                value={editPassword}
                onChangeText={setEditPassword}
                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                placeholderTextColor="#555"
                secureTextEntry={true}
              />

              <Text style={styles.inputLabel}>Sistem Yetkisi</Text>
              <View style={styles.selectorRow}>
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    editRole === "personal" && styles.selectorActivePersonal,
                  ]}
                  onPress={() => setEditRole("personal")}>
                  <Text style={styles.selectorText}>Personel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    editRole === "admin" && styles.selectorActiveAdmin,
                  ]}
                  onPress={() => setEditRole("admin")}>
                  <Text style={styles.selectorText}>Admin</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmModalButton]}
                  onPress={handleSaveChanges}>
                  <Text style={styles.modalButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {status && <StatusCard message={status.message} type={status.type} />}
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
  listContent: { alignItems: "center", paddingTop: 20, paddingBottom: 20 },
  card: {
    width: "90%",
    minHeight: 80,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
    elevation: 3,
  },
  infoArea: { flex: 1, justifyContent: "space-between", paddingRight: 10 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  buttonArea: { width: 45, justifyContent: "space-between", gap: 4 },
  actionButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  editButton: { flex: 0.65, backgroundColor: Colors.primary },
  deleteButton: { flex: 0.35, backgroundColor: Colors.softRed },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "88%",
    maxHeight: "85%",
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    textAlign: "center",
  },
  modalSubtitle: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    fontFamily: Fonts.expFont,
  },
  inputLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    fontFamily: Fonts.mainFont,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 14,
  },
  selectorRow: { flexDirection: "row", gap: 10, marginTop: 2 },
  selectorButton: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: "center",
  },
  selectorText: { color: Colors.white, fontSize: 13, fontWeight: "bold" },
  selectorActivePersonal: {
    backgroundColor: "#2C3E50",
    borderColor: "#34495E",
  },
  selectorActiveAdmin: {
    backgroundColor: Colors.softRed,
    borderColor: Colors.softRed,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelModalButton: { backgroundColor: "#3A3A3C" },
  confirmModalButton: { backgroundColor: Colors.primary },
  modalButtonText: { color: Colors.white, fontSize: 14, fontWeight: "bold" },
});
