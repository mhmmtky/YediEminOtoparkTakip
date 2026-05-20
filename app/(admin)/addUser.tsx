import StatusCard from "@/components/StatusCard";
import { Fonts } from "@/constants/Fonts";
import { handleSaveUser } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
export default function AddUserScreen() {
  // Status Card
  const [status, setStatus] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Şifre göz ikonu için kontrol state'i
  const [secureText, setSecureText] = useState(true);

  // Sicil No
  const [nextPersonalNumber, setNextPersonalNumber] = useState("");

  // Rol
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "manager" | "employee"
  >("employee");

  // Sayfa açıldığında son id den 1 sonrakini alan fonksiypn
  const fetchNextId = async () => {
    try {
      const UserDb = require("@/src/database/userDb");
      const dbUsers = await UserDb.getUsers();

      let nextId = 1; // varsayılan değer 1

      if (dbUsers && dbUsers.length > 0) {
        // En son eklenen kullanıcının idsini bulup 1 fazlasını alır
        const lastUser = dbUsers[dbUsers.length - 1];
        nextId = Number(lastUser.id) + 1;
      }

      // Mevcut yılı alıyoruz
      const currentYear = new Date().getFullYear();

      // ID'yi 3 haneli formatta sola sıfır doldurarak biçimlendirir
      const formattedId = String(nextId).padStart(3, "0");

      // Yıl ve biçimli id birleştirir
      const generatedPersonalNum = `${currentYear}${formattedId}`;

      setNextPersonalNumber(generatedPersonalNum);
    } catch (error) {
      console.error("Sicil no çekilemedi:", error);
      setNextPersonalNumber("1000000"); // hata anında sicil no
    }
  };

  useEffect(() => {
    fetchNextId();
  }, []);

  const SaveUser = async () => {
    if (!name || !surname || !username || !password) {
      setStatus({ msg: "Lütfen tüm alanları doldurunuz.", type: "error" });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      const userData = {
        name,
        surname,
        username,
        password,
        personal_number: nextPersonalNumber,
        role: selectedRole,
      };
      const success = await handleSaveUser(userData);

      if (success) {
        setName("");
        setSurname("");
        setUsername("");
        setPassword("");
        setSelectedRole("employee");
        fetchNextId();
        setStatus({ msg: "Personel başarıyla kaydedildi!", type: "success" });

        setTimeout(() => {
          setStatus(null);
          fetchNextId();
        }, 1500);
      }
    } catch (e) {
      setStatus({ msg: "Kayıt yapılırken bir hata oluştu!", type: "error" });
      setTimeout(() => setStatus(null), 3000);
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      {status && <StatusCard message={status.msg} type={status.type} />}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ÜST BAŞLIK VE İKON ALANI */}
        <View style={styles.headerArea}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={32} color={Colors.white} />
          </View>
          <Text style={styles.title}>Yeni Personel Kaydı</Text>
        </View>

        <View style={styles.badge}>
          <Ionicons
            name="id-card"
            size={18}
            color={Colors.header}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.badgeText}>
            Personel Numarası: {nextPersonalNumber}
          </Text>
        </View>

        {/* PERSONEL ADI */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Personel Adı"
            placeholderTextColor={Colors.system}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* PERSONEL SOYADI */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Personel Soyadı"
            placeholderTextColor={Colors.system}
            value={surname}
            onChangeText={setSurname}
          />
        </View>

        {/* KULLANICI ADI */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            placeholderTextColor={Colors.system}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* GİRİŞ ŞİFRESİ */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Giriş Şifresi"
            placeholderTextColor={Colors.system}
            secureTextEntry={secureText}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={styles.eyeButton}>
            <Ionicons
              name={secureText ? "eye-off" : "eye"}
              size={20}
              color={Colors.system}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sistem Yetkisi</Text>
        <View style={styles.roleSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "employee" && styles.activeRoleButton,
            ]}
            onPress={() => setSelectedRole("employee")}>
            <Ionicons
              name="people"
              size={16}
              color={
                selectedRole === "employee" ? Colors.softGreen : Colors.system
              }
            />
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "employee" && styles.activeRoleButtonText,
              ]}>
              Personel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "admin" && styles.activeRoleButton,
            ]}
            onPress={() => setSelectedRole("admin")}>
            <Ionicons
              name="shield"
              size={16}
              color={
                selectedRole === "admin" ? Colors.softGreen : Colors.system
              }
            />
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "admin" && styles.activeRoleButtonText,
              ]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* KAYDET BUTONU */}
        <TouchableOpacity style={styles.saveButton} onPress={SaveUser}>
          <Text style={styles.saveButtonText}>Personeli Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerArea: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.system,
    textAlign: "center",
    fontFamily: Fonts.mainFont,
    paddingHorizontal: 15,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: Colors.logs,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.mainFont,
  },
  eyeButton: {
    padding: 5,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.mainFont,
  },
  boldText: {
    fontWeight: "bold",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: Colors.softGreen,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.bars,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  badgeLabel: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.mainFont,
  },
  badge: {
    flexDirection: "row",
    backgroundColor: Colors.logs,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  badgeText: {
    color: Colors.header,
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
    fontFamily: Fonts.mainFont,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.mainFont,
    marginBottom: 10,
    marginTop: 5,
    paddingLeft: 4,
  },
  roleSelectorContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 6,
    gap: 6,
    marginBottom: 25,
    alignItems: "center",
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
  },
  roleButtonText: {
    color: Colors.system,
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Fonts.mainFont,
  },
  activeRoleButton: {
    backgroundColor: "rgba(222, 255, 154, 0.15)", // Seçilen buton transparan neon yeşil parlayacak kanka
    borderWidth: 1,
    borderColor: Colors.softGreen,
  },
  activeRoleButtonText: {
    color: Colors.softGreen,
    fontWeight: "bold",
  },
});
