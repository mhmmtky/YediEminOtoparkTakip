import { Ionicons } from "@expo/vector-icons"; // Expo ile hazır gelir
import React from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface Props {
  message: string;
  type: "success" | "error";
}

const StatusCard = ({ message, type }: Props) => {
  return (
    <Animated.View
      style={[styles.card, type === "success" ? styles.success : styles.error]}>
      <Ionicons
        name={type === "success" ? "checkmark-circle" : "alert-circle"}
        size={24}
        color="white"
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    position: "absolute",
    top: 20, // Navbar'ın hemen altında veya üstünde görünecek şekilde
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 5,
  },
  success: {
    backgroundColor: "#2ECC71", // Yeşil
  },
  error: {
    backgroundColor: "#E74C3C", // Kırmızı
  },
  text: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default StatusCard;
