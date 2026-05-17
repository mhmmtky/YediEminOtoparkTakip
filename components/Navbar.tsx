import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export const Navbar = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getRole = async () => {
      const session = await AsyncStorage.getItem("@user_session");
      if (session) {
        const user = JSON.parse(session);
        setUserRole(user.role);
      }
    };
    getRole();
  }, []);

  const handleLogout = async () => {
    setShowMenu(false);
    await AsyncStorage.removeItem("@user_session");
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={{
          width: 50,
          height: 37,
          resizeMode: "contain",
          opacity: 0.5,
          marginRight: "5%",
        }}
      />

      <View style={styles.titleContainer}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.titleMain}>YEDİEMİN OTOPARK</Text>
          <Text style={styles.titleSub}>TAKİP SİSTEMİ</Text>
        </View>
      </View>

      {/* Profil İkonu Butonu */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          setShowMenu(true);
        }}>
        <Ionicons name="person-circle-outline" size={26} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowMenu(false)}>
        {/* Ekranın herhangi bir yerine basınca kapanır */}
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuBox}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push("/");
                }}>
                <Text style={styles.menuText}>Hesap Bilgileri</Text>
              </TouchableOpacity>

              {userRole === "admin" && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    router.push("/systemLogs");
                  }}>
                  <Text style={[styles.menuText, { color: Colors.header }]}>
                    Admin Paneli
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuText, { color: Colors.header }]}>
                  Çıkış Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bars,
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleMain: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  titleSub: {
    color: "white",
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.6,
  },
  iconButton: {
    padding: 5,
    opacity: 0.7,
  },
  // --- MODAL VE KUTU STİLLERİ ---
  modalOverlay: {
    flex: 1,
  },
  menuBox: {
    position: "absolute",
    right: 0,
    // yükekllik
    top: 63,
    backgroundColor: "#1e1e1e",
    borderRadius: 6,
    paddingVertical: 5,
    width: 140,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    color: Colors.header,
    fontSize: 13,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 2,
  },
});
