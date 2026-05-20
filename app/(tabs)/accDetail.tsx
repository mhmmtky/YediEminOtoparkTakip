import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { handleUpdateUser } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function accDetail() {
  // status card
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [userId, setUserId] = useState<string>("");

  //  Form Elemanlarının Stateleri
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Değiştirilemez Statik Veriler
  const [personalNumber, setPersonalNumber] = useState("");
  const [role, setRole] = useState("Personel");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const sessionData = await AsyncStorage.getItem("@user_session");
        if (sessionData !== null) {
          const parsedUser = JSON.parse(sessionData);

          // Stateleri user bilgileriyle doldur
          setUserId(parsedUser.id.toString());
          setName(parsedUser.name || "");
          setSurname(parsedUser.surname || "");
          setUsername(parsedUser.username || "");
          setPersonalNumber(parsedUser.personal_number || "---");
          setRole(parsedUser.role ? parsedUser.role.toUpperCase() : "PERSONEL");
        }
      } catch (error) {
        console.error("Profil yüklenirken session okunamadı:", error);
      }
    };

    loadUserData();
  }, []);

  const onSaveProfile = async () => {
    const userData = {
      id: userId,
      name: name,
      surname: surname,
      username: username,
      password: password,
    };

    const result = await handleUpdateUser(userData);

    if (result.success) {
      setStatus({ message: result.msg || "İşlem başarılı!", type: "success" });

      setTimeout(() => {
        setStatus(null);
      }, 3000);
      setPassword("");

      // AsyncStoragedeki verileri yeni verilerle değiştir
      const sessionData = await AsyncStorage.getItem("@user_session");
      if (sessionData !== null) {
        const parsedUser = JSON.parse(sessionData);
        const updatedSession = {
          ...parsedUser,
          name: name,
          surname: surname,
          username: username,
        };
        await AsyncStorage.setItem(
          "@user_session",
          JSON.stringify(updatedSession),
        );
      }
    } else {
      setStatus({ message: result.msg || "HATA", type: "error" });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      {status && <StatusCard message={status.message} type={status.type} />}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Hesap Bilgileri</Text>

        {/* Değiştirilemez alanlar */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sistem Bilgileri</Text>

          {/* Personel No */}
          <View style={styles.lockedInputWrapper}>
            <Ionicons
              name="id-card-outline"
              size={20}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <View style={styles.lockedTextContainer}>
              <Text style={styles.inputLabel}>Personel Numarası</Text>
              <Text style={styles.lockedValueText}>{personalNumber}</Text>
            </View>
          </View>

          {/* */}
          <View style={styles.lockedInputWrapper}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <View style={styles.lockedTextContainer}>
              <Text style={styles.inputLabel}>Sistem Yetkisi</Text>
              <Text style={styles.lockedValueText}>{role}</Text>
            </View>
          </View>
        </View>

        {/* DÜZENLENEBİLİR ALANLAR SEKSİYONU */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          {/* Ad İntput */}
          <Text style={styles.fieldLabel}>Ad</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Adınızı giriniz"
              placeholderTextColor={Colors.gray}
            />
          </View>

          {/* Soyad Input */}
          <Text style={styles.fieldLabel}>Soyad</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
              placeholder="Soyadınızı giriniz"
              placeholderTextColor={Colors.gray}
            />
          </View>

          {/* Kullanıcı Adı Input */}
          <Text style={styles.fieldLabel}>Kullanıcı Adı</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="at-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Kullanıcı adınızı giriniz"
              placeholderTextColor={Colors.gray}
              autoCapitalize="none"
            />
          </View>

          {/* Şifre Input */}
          <Text style={styles.fieldLabel}>Yeni Şifre</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="key-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Yeni şifrenizi giriniz"
              placeholderTextColor={Colors.gray}
              secureTextEntry
            />
          </View>
        </View>

        {/* Güncelleme Butonu */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => onSaveProfile()}>
          <Text style={styles.updateButtonText}>DEĞİŞİKLİKLERİ KAYDET</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 140,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 5,
    marginBottom: 25,
    fontFamily: Fonts.expFont,
  },
  sectionContainer: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
    fontFamily: Fonts.mainFont,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldLabel: {
    color: Colors.white,
    fontSize: 13,
    marginBottom: 6,
    fontFamily: Fonts.mainFont,
    fontWeight: "600",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
    height: "100%",
  },

  lockedInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bars,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 54,
    paddingHorizontal: 12,
    marginBottom: 12,
    opacity: 0.75,
  },
  lockedTextContainer: {
    flex: 1,
  },
  inputLabel: {
    color: Colors.gray,
    fontSize: 11,
    fontFamily: Fonts.mainFont,
  },
  lockedValueText: {
    color: Colors.softGreen,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
    marginTop: 2,
  },
  // Buton
  updateButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    elevation: 2,
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
});
