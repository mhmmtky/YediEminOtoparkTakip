import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ActionButtons } from "./ActionButtons";

export const AppNavigator = () => {
  const [showActions, setShowActions] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getTabStyle = (route: string) => ({
    backgroundColor: pathname === route ? Colors.white : "transparent",
    padding: 10,
    borderRadius: 25,
  });

  const getIconStyle = (route: string) => ({
    color: pathname === route ? Colors.bars : Colors.white,
  });

  return (
    <>
      {/* Aksiyon Butonları: Sadece showActions true olduğunda ve barın üstünde görünür */}
      {showActions && (
        <View
          style={{
            position: "absolute",
            bottom: 70, // Barın yüksekliğinden fazla veriyoruz ki üstte asılı kalsın
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 1001,
          }}>
          <ActionButtons />
        </View>
      )}
      <View
        style={{
          backgroundColor: Colors.bars,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          height: 70,
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
          <TouchableOpacity
            onPress={() => router.navigate("/dashboard")}
            style={getTabStyle("/dashboard")}>
            <Ionicons
              name="stats-chart"
              color="white"
              size={26}
              style={getIconStyle("/dashboard")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => router.navigate("/find")}
            style={getTabStyle("/find")}>
            <Ionicons
              name="search"
              size={26}
              color="white"
              style={getIconStyle("/find")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => setShowActions(!showActions)}
            style={{
              backgroundColor: Colors.bars,
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
              bottom: 15,
              borderWidth: 5,
              borderColor: "#000000",
              elevation: 10,
              shadowColor: "#000",
              shadowOpacity: 0.3,
            }}>
            <Ionicons
              name={showActions ? "close-circle" : "apps-outline"}
              size={50}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => router.navigate("/archive")}
            style={getTabStyle("/archive")}>
            <MaterialCommunityIcons
              name="car-info"
              size={26}
              color="white"
              style={getIconStyle("/archive")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => router.navigate("/maps")}
            style={getTabStyle("/maps")}>
            <MaterialCommunityIcons
              name="floor-plan"
              size={26}
              color="white"
              style={getIconStyle("/maps")}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};
