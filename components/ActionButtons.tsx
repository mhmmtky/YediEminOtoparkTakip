import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export const ActionButtons = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Araç Giriş Butonu */}
      <TouchableOpacity
        style={[styles.button, styles.addCar]}
        onPress={() => router.navigate("/addCar")}>
        <MaterialCommunityIcons name="car" size={36} color="#000000" />
      </TouchableOpacity>

      {/* Sorgulama Butonu */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.updateCar,
          { transform: [{ translateY: -15 }] },
        ]}
        onPress={() => router.navigate("/detailCar")}>
        <MaterialCommunityIcons
          name="square-edit-outline"
          size={36}
          color="#000000"
        />
      </TouchableOpacity>

      {/* Araç Çıkış Butonu */}
      <TouchableOpacity
        style={[styles.button, styles.deleteCar]}
        onPress={() => router.navigate("/deleteCar")}>
        <MaterialCommunityIcons name="car-off" size={36} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    alignItems: "flex-end",
    gap: 20,
  },
  addCar: {
    backgroundColor: "rgb(13, 97, 0)",
  },
  deleteCar: {
    backgroundColor: "rgb(119, 30, 2)",
  },
  updateCar: {
    backgroundColor: "rgb(1, 107, 137)",
  },
  button: {
    padding: 15,
    borderRadius: "50%",
    alignItems: "center",
    elevation: 5,
  },
});
