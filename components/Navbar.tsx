import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons"; // Expo'nun hazır ikonları
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const Navbar = () => {
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

      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => console.log("Profil")}>
        <Ionicons name="person-circle-outline" size={26} color="white" />
      </TouchableOpacity>
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
