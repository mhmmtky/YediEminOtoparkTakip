import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { handleGetCarsWithFilters } from "@/src/services/carService"; // 🚀 Doğrudan filtreli SQLite servisi!
import {
  handleGetBlocks,
  handleGetLastSlotByBlockName,
} from "@/src/services/parkingService";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParkingMapScreen() {
  const [blocks, setBlocks] = useState<string[]>(["A", "B", "C", "D"]);
  const [selectedBlock, setSelectedBlock] = useState<string>("A"); // Default A bloğu
  const [blockCars, setBlockCars] = useState<any[]>([]); // Sadece bu bloğa ait veritabanından gelen araçlar
  const [slotCount, setSlotCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadParkingMapFromDB = async () => {
    try {
      setLoading(true);

      const dbBlocks = await handleGetBlocks();
      if (dbBlocks && dbBlocks.length > 0) {
        setBlocks(dbBlocks.map((b: any) => b.toString().toUpperCase()));
      }

      const lastSlotResult = await handleGetLastSlotByBlockName(selectedBlock);
      const totalCapacity =
        lastSlotResult && lastSlotResult.maxNumber
          ? Number(lastSlotResult.maxNumber)
          : 0;
      setSlotCount(totalCapacity);

      // slot çekme
      const dbResult = await handleGetCarsWithFilters("", selectedBlock, null);
      if (dbResult && dbResult.success) {
        setBlockCars(dbResult.data || []);
      } else {
        setBlockCars([]);
      }
    } catch (e) {
      console.error("SQLite krokisi yüklenirken hata oluştu:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadParkingMapFromDB();
    }, [selectedBlock]),
  );

  const renderAllSlots = () => {
    const allSlots = [];

    for (let i = 1; i <= slotCount; i++) {
      const slotCode = `${selectedBlock}-${i}`;

      const occupiedCar = blockCars.find(
        (car) =>
          car.car_slot &&
          car.car_slot.toUpperCase().trim() === slotCode.toUpperCase(),
      );

      allSlots.push({
        slotCode,
        isOccupied: !!occupiedCar,
        plate: occupiedCar?.plate,
      });
    }

    return allSlots.map((slot) => (
      <View
        key={slot.slotCode}
        style={[
          styles.straightSlot,
          slot.isOccupied ? styles.slotOccupied : styles.slotEmpty,
        ]}>
        {slot.isOccupied ? (
          /* DOLU SLOT */
          <View style={styles.slotInnerContent}>
            <Text style={styles.occupiedPlateText} numberOfLines={2}>
              {slot.plate?.toUpperCase()}
            </Text>
            <Text style={styles.occupiedSlotCodeText}>{slot.slotCode}</Text>
          </View>
        ) : (
          /* BOŞ SLOT */
          <View style={styles.slotInnerContent}>
            <Text style={styles.emptySlotCodeText}>{slot.slotCode}</Text>
            <Text style={styles.emptyLabelText}>BOŞ</Text>
          </View>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* ÜST PANEL */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Otopark Alanı</Text>
      </View>

      {/* YATAY BLOK MENÜSÜ */}
      <View style={styles.blockRowContainer}>
        <FlatList
          data={blocks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            const isSelected = item === selectedBlock;
            return (
              <TouchableOpacity
                style={[
                  styles.blockButton,
                  isSelected ? styles.blockButtonActive : null,
                ]}
                onPress={() => setSelectedBlock(item)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.blockButtonText,
                    isSelected ? styles.blockButtonTextActive : null,
                  ]}>
                  {item} BLOK
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text
            style={{
              color: Colors.white,
              marginTop: 10,
              fontFamily: Fonts.mainFont,
            }}>
            Veritabanı taranıyor...
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {slotCount === 0 ? (
            <Text style={styles.emptyBlockText}>
              Bu bloğa ait tanımlanmış bir slot yok!
            </Text>
          ) : (
            /* HARİTA KARTI */
            <View style={styles.mapCard}>
              <Text style={styles.mapCardTitle}>
                PARK ALANI - {selectedBlock} BLOK ({slotCount} SLOT)
              </Text>

              <View style={styles.parkingAsphaltRow}>{renderAllSlots()}</View>
            </View>
          )}

          {/* RENK REHBERİ */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendBox,
                  {
                    backgroundColor: "rgba(231, 76, 60, 0.15)",
                    borderColor: "rgba(231, 76, 60, 0.4)",
                  },
                ]}
              />
              <Text style={styles.legendText}>Dolu Slot</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendBox,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                ]}
              />
              <Text style={styles.legendText}>Boş Slot</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  headerContainer: { paddingTop: 60, paddingBottom: 15 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
  },
  headerSubTitle: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: Fonts.expFont,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  blockButton: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  blockButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 3,
  },
  blockButtonText: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  blockButtonTextActive: { color: Colors.white },
  blockRowContainer: { paddingVertical: 10, marginBottom: 15 },

  mapCard: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 5,
    elevation: 4,
  },
  mapCardTitle: {
    color: Colors.gray,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Fonts.mainFont,
    marginBottom: 15,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  parkingAsphaltRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 10,
    gap: 5,
  },
  straightSlot: {
    width: "15.1%",
    height: 75,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  slotEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderStyle: "dashed",
  },
  slotOccupied: {
    backgroundColor: "rgba(231, 76, 60, 0.18)",
    borderColor: "rgba(231, 76, 60, 0.4)",
  },

  slotInnerContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  occupiedPlateText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  occupiedSlotCodeText: {
    color: "rgba(231, 76, 60, 0.8)",
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
    marginTop: 4,
  },

  emptySlotCodeText: {
    color: Colors.placeholder,
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Fonts.mainFont,
  },
  emptyLabelText: {
    color: "rgba(46, 204, 113, 0.4)",
    fontSize: 7,
    fontWeight: "bold",
    marginTop: 2,
  },

  legendContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    justifyContent: "center",
    paddingBottom: 20,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendBox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1 },
  legendText: { color: Colors.gray, fontSize: 12, fontFamily: Fonts.expFont },
  emptyBlockText: {
    color: Colors.gray,
    fontSize: 13,
    fontFamily: Fonts.mainFont,
    textAlign: "center",
    marginTop: 30,
  },
});
