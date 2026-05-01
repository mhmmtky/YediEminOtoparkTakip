import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons"; // Expo'nun hazır ikonları
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export const AppNavigator = () => {
  return (
    <View
      style={{
        backgroundColor: Colors.bars,
        flexDirection: "row", // İkonları yan yana dizer
        justifyContent: "space-around", // Aralarına eşit boşluk bırakır
        alignItems: "center", // Dikeyde ortalar
        height: 70, // Barın yüksekliği
        paddingBottom: 10,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10, // Android için gölge
        shadowOpacity: 0.1, // iOS için gölge
        borderRadius: 40,
        zIndex: 999,
      }}>
      <View>
        <TouchableOpacity onPress={() => console.log("Dashboard")}>
          <Ionicons name="stats-chart" color="white" size={26} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => console.log("Find")}>
          <Ionicons name="search" size={26} color="white" />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => console.log("process")}>
          <Ionicons name="apps-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => console.log("Archive")}>
          <MaterialCommunityIcons name="car-info" size={26} color="white" />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={() => console.log("Maps")}>
          <MaterialCommunityIcons name="floor-plan" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
