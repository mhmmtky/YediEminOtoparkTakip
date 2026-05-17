import { Ionicons } from "@expo/vector-icons";
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
      {/* Kullanıcı Ekleme */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.addUser,
          getTabStyle("/addUser", "#2ace11", "rgb(13, 97, 0)"),
        ]}
        onPress={() => router.navigate("/addUser")}>
        <Ionicons name="person-add" size={36} color="black" />
      </TouchableOpacity>

      {/* Sorgulama Butonu */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.updateUser,
          getTabStyle("/manageUser", "#00c8ff", "rgb(1, 107, 137)"),
        ]}
        onPress={() => router.navigate("/manageUser")}>
        <Ionicons name="people" size={36} color="black" />
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
  addUser: {
    backgroundColor: "rgb(13, 97, 0)",
  },
  updateUser: {
    backgroundColor: "rgb(1, 107, 137)",
  },
  button: {
    padding: 15,
    borderRadius: "50%",
    alignItems: "center",
    elevation: 5,
  },
});
