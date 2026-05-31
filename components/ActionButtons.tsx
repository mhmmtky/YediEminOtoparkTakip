import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export const ActionButtons = () => {
  const router = useRouter();
  const pathname = usePathname();
  const getTabStyle = (route: string, color: string, fColor: string) => ({
    backgroundColor: pathname === route ? color : fColor,
  });
  return (
    <View style={styles.container}>
      {/* Araç Giriş Butonu */}
      <TouchableOpacity
        style={[
          styles.button,
          getTabStyle("/addCar", "rgb(37, 255, 4)", "rgb(13, 97, 0)"),
        ]}
        onPress={() => router.navigate("/addCar")}>
        <MaterialCommunityIcons name="car" size={36} color="#000000" />
      </TouchableOpacity>

      {/* Sorgulama Butonu */}
      <TouchableOpacity
        style={[
          styles.button,
          { transform: [{ translateY: -15 }] },
          getTabStyle(
            "/detailCar",
            "rgb(15, 203, 255)rgb(1, 107, 137)",
            "rgb(1, 107, 137)",
          ),
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
        style={[
          styles.button,
          getTabStyle("/deleteCar", "rgb(255, 68, 11)", "rgb(119, 30, 2)"),
        ]}
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
