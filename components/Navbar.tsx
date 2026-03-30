import { Ionicons } from "@expo/vector-icons"; // Expo'nun hazır ikonları
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export const Navbar = () => {
  return (
    <View style={styles.container}>
      {/* Sol Taraf: Menü İkonu (Gelecekte soldan menü açmak için) */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => console.log("Menü açılacak kanka")}>
        <Ionicons name="menu-outline" size={26} color="white" />
      </TouchableOpacity>

      {/* Orta Taraf: Ana Başlık */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleMain}>YEDİEMİN OTOPARK</Text>
        <Text style={styles.titleSub}>TAKİP SİSTEMİ</Text>
      </View>

      {/* Sağ Taraf: Profil İkonu (Gelecekte profil sayfasını açmak için) */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => console.log("Profil açılacak kanka")}>
        <Ionicons name="person-circle-outline" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Elemanları yan yana dizer
    alignItems: "center", // Dikeyde ortalar
    justifyContent: "space-between", // Sol, orta, sağ arası boşluk bırakır
    backgroundColor: "transparent", // Arka plan saydam (renksiz)
    width: "100%",
    paddingHorizontal: 15,
    // Çentikli (Notch) telefonlar için güvenli alan bırakır
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    // Alt kısıma çok hafif bir ayraç çizgisi
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  titleContainer: {
    alignItems: "center", // Başlıkları kendi içinde ortalar
  },
  titleMain: {
    color: "white",
    fontSize: 16,
    fontWeight: "900", // Çok kalın
    letterSpacing: 1.5, // Harf arası boşluk (kurumsal durur)
    opacity: 0.9, // Hafif saydamlık
  },
  titleSub: {
    color: "white",
    fontSize: 10,
    fontWeight: "400", // İnce
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.6, // Daha fazla saydamlık
  },
  iconButton: {
    padding: 5,
    opacity: 0.7, // İkonlar daha sönük dursun
  },
});
