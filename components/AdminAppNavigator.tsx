import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ActionButtons } from "./AdminActionButtons";

export const AdminAppNavigator = () => {
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
      {showActions && (
        <View
          style={{
            position: "absolute",
            bottom: 70,
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
            onPress={() => router.navigate("/systemLogs")}
            style={getTabStyle("/systemLogs")}>
            <Feather
              name="file-text"
              size={26}
              style={getIconStyle("/systemLogs")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => router.navigate("/parkingSettings")}
            style={getTabStyle("/parkingSettings")}>
            <Feather
              name="settings"
              size={26}
              color="white"
              style={getIconStyle("/parkingSettings")}
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
            <Feather
              name={showActions ? "x" : "users"}
              size={45}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => router.navigate("/reports")}
            style={getTabStyle("/reports")}>
            <Ionicons
              name="stats-chart-outline"
              size={26}
              color="white"
              style={getIconStyle("/reports")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => router.navigate("/dashboard")}
            style={getTabStyle("/dashboard")}>
            <FontAwesome5
              name="arrow-left"
              size={26}
              style={getIconStyle("/dashboard")}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};
