import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import {
  handleGetAddedCarCount,
  handleGetAllCarCount,
  handleGetCarCount,
  handleGetReleasedCarCount,
} from "@/src/services/carService";
import { handleGetTopCategory } from "@/src/services/categoryService";
import { handleGetUsers } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ReportsScreen() {
  const [data, setData] = useState({
    todayIn: 0,
    todayOut: 0,
    totalInside: 0,
    totalEver: 0,
    personnel: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [topCategory, setTopCategory] = useState({ name: "...", count: 0 });

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const added = await handleGetAddedCarCount();
      const released = await handleGetReleasedCarCount();
      const inside = await handleGetCarCount();
      const users = await handleGetUsers();
      const totalCount = await handleGetAllCarCount();

      const adminList = users.filter((u) => u.role === "admin");
      const staffList = users.filter((u) => u.role !== "admin");

      const topCat = await handleGetTopCategory();

      setTopCategory(topCat);
      setData({
        todayIn: added,
        todayOut: released,
        totalInside: inside,
        totalEver: totalCount,
        personnel: staffList.length,
        admins: adminList.length,
      });
    } catch (e) {
      console.error("Rapor verileri çekilirken hata:", e);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadReportsData();
    }, []),
  );

  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <Text style={styles.headerTitle}>Uygulama Merkezi</Text>

      <Text style={styles.sectionTitle}>Bugün Yapılan İşlemler</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Araç Girişi"
          value={data.todayIn}
          color={Colors.primary}
        />
        <StatCard
          label="Araç Çıkışı"
          value={data.todayOut}
          color={Colors.softRed}
        />
      </View>

      <Text style={styles.sectionTitle}>Tüm Zamanlar</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="İçerideki"
          value={data.totalInside}
          color={Colors.softGreen}
        />
        <StatCard
          label="Toplam Araç"
          value={data.totalEver}
          color={Colors.primary}
        />
      </View>

      <Text style={styles.sectionTitle}>Sistem Personel Durumu</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Toplam Personel"
          value={data.personnel}
          color="#9B59B6"
        />
        <StatCard
          label="Toplam Admin"
          value={data.admins}
          color={Colors.danger}
        />
      </View>
      <Text style={styles.sectionTitle}>Analiz</Text>
      <View style={styles.wideCard}>
        <View style={styles.iconWrapper}>
          <Ionicons name="trophy-outline" size={24} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.gridLabel}>En Çok Tercih Edilen</Text>
          <Text style={styles.wideValue}>
            {topCategory.name} ({topCategory.count} Adet)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const StatCard = ({ label, value, color }: any) => (
  <View style={styles.gridCard}>
    <Text style={styles.gridLabel}>{label}</Text>
    <Text style={[styles.gridValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 150 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.gray,
    marginTop: 25,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  dateText: { color: Colors.white, fontWeight: "bold" },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: "center",
  },
  gridValue: { fontSize: 24, fontWeight: "bold", marginTop: 8 },
  gridLabel: {
    color: Colors.gray,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  wideCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 10,
  },
  wideValue: { color: Colors.white, fontSize: 18, fontWeight: "bold" },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
});
