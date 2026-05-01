import { AppNavigator } from "@/components/AppNavigator";
import { Navbar } from "@/components/Navbar";
import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Navbar />
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
          sceneStyle: { backgroundColor: Colors.background },
        }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="temps" />
      </Tabs>
      <AppNavigator />
    </View>
  );
}
