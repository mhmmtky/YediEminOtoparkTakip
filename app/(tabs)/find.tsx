import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { handleGetCarsWithFilters } from "@/src/services/carService";

export default function VehicleSearchScreen() {
  const [searchPlate, setSearchPlate] = useState("");
  const [carsList, setCarsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Tarih Nesnesi State'leri
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Takvimin sıralı aşama kontrolü
  const [pickerMode, setPickerMode] = useState<"none" | "start" | "end">(
    "none",
  );

  useEffect(() => {
    fetchFilteredCars();
  }, []);

  const fetchFilteredCars = async () => {
    try {
      setLoading(true);
      const result = await handleGetCarsWithFilters(
        searchPlate.trim(),
        startDate,
        endDate,
      );

      if (result && result.success) {
        setCarsList(result.data || []);
      } else {
        console.error(
          "Veritabanından filtreli araçlar çekilemedi:",
          result?.error,
        );
        setCarsList([]);
      }
    } catch (e) {
      console.error("Filtreleme front-end katmanında hata oluştu:", e);
      setCarsList([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysDiff = (entryDateStr: string): number => {
    if (!entryDateStr) return 0;
    try {
      const entryDate = new Date(entryDateStr.replace(" ", "T"));
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - entryDate.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (err) {
      return 0;
    }
  };

  const formatRangeLabel = () => {
    if (!startDate && !endDate) return "Tarih Aralığı Seçiniz...";

    const format = (date: Date | null) => {
      if (!date) return "__.__.____";
      return `${date.getDate().toString().padStart(2, "0")}.${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}.${date.getFullYear()}`;
    };

    return `${format(startDate)}  -  ${format(endDate)}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setPickerMode("none");
      return;
    }

    if (pickerMode === "start" && selectedDate) {
      setStartDate(selectedDate);
      setPickerMode("end");
    } else if (pickerMode === "end" && selectedDate) {
      if (startDate && selectedDate < startDate) {
        setEndDate(startDate);
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      setPickerMode("none");
    }
  };

  const handleResetFilters = async () => {
    setStartDate(null);
    setEndDate(null);
    setSearchPlate("");

    try {
      setLoading(true);
      const result = await handleGetCarsWithFilters("", null, null);
      if (result && result.success) {
        setCarsList(result.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === "inside") {
      return {
        bg: "rgba(46, 204, 113, 0.15)",
        text: Colors.softGreen,
        label: "İçeride",
      };
    }
    return {
      bg: "rgba(149, 165, 166, 0.15)",
      text: Colors.gray,
      label: "Çıktı",
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Araç Arama & Filtreleme</Text>
      </View>

      {/* FİLTRE KART */}
      <View style={styles.filterCard}>
        <Text style={styles.fieldLabel}>Plaka İle Ara</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.gray}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.input}
            value={searchPlate}
            onChangeText={(text) => setSearchPlate(text.toUpperCase())}
            placeholder="Örn: 34 KYA 508"
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="characters"
          />
        </View>

        <Text style={styles.fieldLabel}>Tarih Aralığı Filtresi</Text>
        <TouchableOpacity
          style={styles.dateSelectorButton}
          onPress={() => setPickerMode("start")}
          activeOpacity={0.7}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={Colors.primary}
            style={{ marginRight: 10 }}
          />
          <Text
            style={[
              styles.dateSelectorText,
              startDate ? { color: Colors.white } : null,
            ]}>
            {formatRangeLabel()}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
          {(startDate || endDate || searchPlate !== "") && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
              activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={18} color="#E74C3C" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchFilteredCars}
            activeOpacity={0.8}>
            <Ionicons
              name="funnel-outline"
              size={16}
              color={Colors.white}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.searchButtonText}>KAYITLARI SORGULA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {pickerMode !== "none" && (
        <DateTimePicker
          value={
            pickerMode === "end" && endDate ? endDate : startDate || new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={{ flex: 1, marginTop: 5, paddingBottom: 50 }}>
        <Text style={styles.sectionTitle}>
          Sorgu Sonuçları ({carsList.length})
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={carsList}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const statusConfig = getStatusStyle(item.status);
              const daysDiff = getDaysDiff(item.entry_date);

              const dailyPrice = item.category_price;
              const calculatedDebt = daysDiff * dailyPrice;

              return (
                <View style={styles.resultCard}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.plateText}>{item.plate}</Text>
                    <Text style={styles.brandModelText}>
                      {item.brand || "Bilinmeyen"} {item.model || "Araç"}
                    </Text>
                    <Text style={styles.detailsText}>
                      {item.km || item.mileage || "0"} KM • {dailyPrice} TL/Gün
                      •{" "}
                      <Text style={styles.debtText}>
                        Borç: {calculatedDebt} TL
                      </Text>
                    </Text>

                    <View style={styles.badgeRow}>
                      <View style={styles.slotBadge}>
                        <Ionicons
                          name="pin"
                          size={12}
                          color="#F1C40F"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.slotText}>
                          {item.car_slot || "YOK"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.insideBadge,
                          { backgroundColor: statusConfig.bg },
                        ]}>
                        <Text
                          style={[
                            styles.insideText,
                            { color: statusConfig.text },
                          ]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <Text style={styles.categoryYearText}>
                      {item.category_name || "Otomobil"} |{" "}
                      {item.year || item.model_year || "2024"}
                    </Text>

                    {/* gün */}
                    <View style={styles.daysInsideContainer}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={Colors.primary}
                        style={{ marginBottom: 2 }}
                      />
                      <Text style={styles.daysInsideText}>
                        {daysDiff === 0
                          ? "Bugün\nGirdi"
                          : `${daysDiff} Gündür\nİçeride`}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  headerContainer: { paddingTop: 60, paddingBottom: 20 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
  },
  filterCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    marginBottom: 15,
  },
  fieldLabel: {
    color: Colors.white,
    fontSize: 12,
    marginBottom: 6,
    fontFamily: Fonts.mainFont,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
    height: "100%",
  },
  dateSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  dateSelectorText: {
    color: Colors.placeholder,
    fontSize: 13,
    fontFamily: Fonts.expFont,
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
  resetButton: {
    backgroundColor: "rgba(231, 76, 60, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.3)",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    fontFamily: Fonts.mainFont,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  resultCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
  },
  cardLeft: { flex: 1, justifyContent: "center", gap: 3 },
  plateText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
  brandModelText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Fonts.mainFont,
    marginTop: 1,
  },
  detailsText: {
    color: Colors.gray,
    fontSize: 12,
    fontFamily: Fonts.expFont,
    marginTop: 1,
  },
  debtText: { color: "#F1C40F", fontWeight: "bold" },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    alignItems: "center",
  },
  slotBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(52, 152, 219, 0.3)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  slotText: {
    color: "#99CCFF",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  insideBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  insideText: { fontSize: 11, fontWeight: "bold", fontFamily: Fonts.mainFont },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 90,
  },
  categoryYearText: {
    color: Colors.gray,
    fontSize: 11,
    fontFamily: Fonts.expFont,
    fontWeight: "500",
    textAlign: "right",
  },

  daysInsideContainer: {
    backgroundColor: "rgba(155, 89, 182, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(155, 89, 182, 0.22)",
    borderRadius: 10,
    width: 82,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    marginTop: 4,
  },
  daysInsideText: {
    color: "#D2B4DE",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    textAlign: "center",
    lineHeight: 13,
  },
});
