import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import {
  handleGetAddedCarCount,
  handleGetCarCount,
  handleGetPrices,
  handleGetReleasedCarCount,
} from "@/src/services/carService";
import { handleGetParkCount } from "@/src/services/parkingService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  // araç girişi state
  const [userInsertedCount, setUserInsertedCount] = useState<number>(0);
  // çıkışı ypaılanla state
  const [userReleasedCount, setUserReleasedCount] = useState<number>(0);
  // bilanço state
  const [dailyIncome, setDailyIncome] = useState<number>(0);
  // toplam park slotu state
  const [totalCapacity, setTotalCapacity] = useState<number>(0);
  // kayıtlı araç state
  const [currentCars, setCurrentCars] = useState<number>(0);

  const fetchDailyData = async () => {
    try {
      const addedCount = await handleGetAddedCarCount();
      const releasedCount = await handleGetReleasedCarCount();
      const totalPrice = await handleGetPrices();
      const totalCapacity = await handleGetParkCount();
      const currentCars = await handleGetCarCount();

      setUserInsertedCount(addedCount); // Veritabanından gelen sayıyı state e atar
      setUserReleasedCount(releasedCount);
      setDailyIncome(totalPrice);
      setTotalCapacity(totalCapacity);
      setCurrentCars(currentCars);
    } catch (error) {
      console.error("Dashboard veri çekme hatası:", error);
    }
  };
  useEffect(() => {
    fetchDailyData();
  });

  // Doluluk oranı hesabı
  const occupancyRate = Math.round((currentCars / totalCapacity) * 100);
  let progressColor = null;

  if (occupancyRate <= 40) {
    progressColor = Colors.softGreen;
  } else if (occupancyRate > 40 && occupancyRate <= 75) {
    progressColor = Colors.primary;
  } else if (occupancyRate > 75 && occupancyRate <= 95) {
    progressColor = Colors.danger;
  } else {
    progressColor = Colors.softRed;
  }

  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.mainCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Otopark Doluluk Oranı</Text>
          <Ionicons name="pie-chart-outline" size={20} color={Colors.primary} />
        </View>

        <View style={styles.occupancyRow}>
          <Text style={styles.occupancyPercent}>%{occupancyRate}</Text>
          <Text style={styles.occupancyCount}>
            {currentCars} / {totalCapacity} Araç
          </Text>
        </View>

        {/* PROGRESS BAR TRACK */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${occupancyRate}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
      </View>
      <View style={styles.incomeCard}>
        <View style={styles.incomeInfo}>
          <Text style={styles.incomeLabel}>Bugün Toplam Tahsilat</Text>
          <Text style={styles.incomeValue}>
            {dailyIncome.toLocaleString("tr-TR")} TL
          </Text>
        </View>
        <View style={styles.incomeIconBg}>
          <Ionicons name="wallet-outline" size={26} color={Colors.softGreen} />
        </View>
      </View>
      {/* İşlemler */}
      <Text style={styles.sectionTitle}>Bugünkü İşlemleriniz</Text>
      <View style={styles.statsGrid}>
        {/* Giriş Kartı */}
        <View style={styles.gridCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: "rgba(52, 152, 219, 0.1)" },
            ]}>
            <Ionicons name="log-in-outline" size={24} color="#3498DB" />
          </View>
          <Text style={styles.gridValue}>{userInsertedCount}</Text>
          <Text style={styles.gridLabel}>Araç Girişi</Text>
        </View>

        {/* Çıkış Kartı */}
        <View style={styles.gridCard}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: "rgba(230, 126, 34, 0.1)" },
            ]}>
            <Ionicons name="log-out-outline" size={24} color="#E67E22" />
          </View>
          <Text style={styles.gridValue}>{userReleasedCount}</Text>
          <Text style={styles.gridLabel}>Araç Çıkışı</Text>
        </View>
      </View>
      {/* Kısayol */}
      <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
      <View style={styles.actionGrid}>
        {/* Araç Kayıt */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.navigate("/addCar")}>
          <View
            style={[
              styles.actionIconBg,
              { backgroundColor: "rgba(46, 204, 113, 0.1)" },
            ]}>
            <MaterialCommunityIcons
              name="car"
              size={32}
              color={Colors.softGreen}
            />
          </View>
          <Text style={styles.actionText}>Araç Kayıt</Text>
        </TouchableOpacity>

        {/* Otopark Haritası */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.navigate("/maps")}>
          <View
            style={[
              styles.actionIconBg,
              { backgroundColor: "rgba(52, 152, 219, 0.1)" },
            ]}>
            <MaterialCommunityIcons
              name="floor-plan"
              size={32}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.actionText}>Otopark Haritası</Text>
        </TouchableOpacity>

        {/* Araç Çıkışı */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.navigate("/deleteCar")}>
          <View
            style={[
              styles.actionIconBg,
              { backgroundColor: "rgba(231, 76, 60, 0.1)" },
            ]}>
            <MaterialCommunityIcons
              name="car-off"
              size={32}
              color={Colors.softRed}
            />
          </View>
          <Text style={styles.actionText}>Araç Çıkışı</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
    marginBottom: 25,
    fontFamily: Fonts.expFont,
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 25,
    marginBottom: 15,
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },

  // Progress Bar Kartı
  mainCard: {
    width: "100%",
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Fonts.mainFont,
    textTransform: "uppercase",
  },
  occupancyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  occupancyPercent: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
  },
  occupancyCount: {
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.expFont,
  },
  progressBarTrack: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.bars,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },

  // Kasa Kartı
  incomeCard: {
    width: "100%",
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  incomeInfo: { flex: 1 },
  incomeLabel: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Fonts.mainFont,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  incomeValue: {
    color: Colors.softGreen,
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
  },
  incomeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  // İstatistik
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    width: "100%",
  },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: "center",
    elevation: 3,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  gridValue: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
    marginBottom: 2,
  },
  gridLabel: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Fonts.mainFont,
  },
  // Kısayol
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    marginTop: 5,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Fonts.mainFont,
    textAlign: "center",
  },
});
