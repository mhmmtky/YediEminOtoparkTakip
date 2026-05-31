import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { handleGetReleasedCars } from "@/src/services/carService";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

interface ReleasedCar {
  id: number;
  plate: string;
  brand: string;
  model: string;
  mileage: string;
  year: string;
  entry_date: string;
  exit_date: string;
  category_name: string;
  category_price: number;
  personal_username: string;
  owner_name: string;
  owner_phone: string;
  owner_tc: string;
}

export default function ReleasedCarsScreen() {
  const [releasedCars, setReleasedCars] = useState<ReleasedCar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await handleGetReleasedCars();
      setReleasedCars(data);
    } catch (e) {
      console.error("Ön yüzde geçmiş listelenirken hata oluştu:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const renderReleasedCard = ({ item }: { item: ReleasedCar }) => {
    return (
      <View style={styles.card}>
        {/* Plaka  */}
        <View style={styles.plateContainer}>
          <Text style={styles.plateText}>{item.plate.toUpperCase()}</Text>
        </View>

        {/* Araç Bilgisi */}
        <Text style={styles.brandModelText} numberOfLines={1}>
          {item.brand} {item.model}
        </Text>
        <Text style={styles.subInfoText}>
          {item.year} | {item.mileage} KM
        </Text>

        {/* Tarihler Bölümü */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Giriş: {formatDate(item.entry_date)}
          </Text>
          <Text style={styles.dateText}>
            Çıkış: {formatDate(item.exit_date)}
          </Text>
        </View>

        <View style={styles.ownerInfoBox}>
          <Text style={styles.ownerTitle}>Teslim Alan</Text>
          <Text style={styles.ownerDetailText} numberOfLines={1}>
            Ad:{" "}
            <Text style={styles.whiteText}>
              {item.owner_name?.toUpperCase() || "BİLİNMİYOR"}
            </Text>
          </Text>
          <Text style={styles.ownerDetailText} numberOfLines={1}>
            Tel: <Text style={styles.whiteText}>{item.owner_phone || "-"}</Text>
          </Text>
          <Text style={styles.ownerDetailText} numberOfLines={1}>
            TC: <Text style={styles.whiteText}>{item.owner_tc || "-"}</Text>
          </Text>

          <View style={styles.divider} />
          <Text style={styles.personalText} numberOfLines={1}>
            Personel: {item.personal_username}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.white, marginTop: 10 }}>
            Arşiv yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={releasedCars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReleasedCard}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Çıkış yapmış araç bulunamadı!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.gray,
    fontFamily: Fonts.mainFont,
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    elevation: 3,
  },
  plateContainer: {
    backgroundColor: "#1A252F",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#34495E",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  plateText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  brandModelText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  subInfoText: {
    color: Colors.gray,
    fontSize: 11,
    fontFamily: Fonts.expFont,
    marginBottom: 6,
  },
  dateContainer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 6,
    borderRadius: 4,
    gap: 2,
    marginBottom: 8,
  },
  dateText: {
    color: "#aaa",
    fontSize: 10,
    fontFamily: Fonts.expFont,
  },
  ownerInfoBox: {
    backgroundColor: "#121212",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  ownerTitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ownerDetailText: {
    color: "#777",
    fontSize: 11,
    marginTop: 1,
  },
  whiteText: {
    color: "#fff",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 4,
  },
  personalText: {
    color: "#555",
    fontSize: 10,
    fontFamily: Fonts.expFont,
  },
});
