import { Navbar } from "@/components/Navbar";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <Tabs screenOptions={{ headerShown: false }}></Tabs>
    </View>
  );
}
