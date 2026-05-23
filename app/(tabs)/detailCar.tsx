import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import {
  handleGetAllCar,
  handleUpdateCarInfoById,
} from "@/src/services/carService";
import {
  handleGetBlocks,
  handleGetEmptySlotsByBlock,
} from "@/src/services/parkingService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface Car {
  id: string;
  plate: string;
  brand: string;
  model: string;
  mileage: string;
  year: string;
  is_paid: number;
  entry_date: string;
  category_name: string; // Sorgudan gelen kategori adı
  category_price: number; // Sorgudan gelen günlük ücret
  personal_username: string; // Aracı alan personelin kullanıcı adı
  car_slot: string; // Hangi slotta durduğu
  status?: string;
  park_id: number;
}

export default function detailCar() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // MODAL
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [editBrand, setEditBrand] = useState<string>("");
  const [editModel, setEditModel] = useState<string>("");
  const [editSlot, setEditSlot] = useState<string>("");

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const [formattedBlocks, setFormattedBlocks] = useState<any[]>([]);
  const [formattedSlots, setFormattedSlots] = useState<any[]>([]);

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const openEditModal = async (car: any) => {
    setSelectedCar(car);
    setEditBrand(car.brand);
    setEditModel(car.model);
    setEditSlot(car.car_slot || "");

    const currentSlotCode = car.car_slot || "";
    const blockChar = currentSlotCode.includes("-")
      ? currentSlotCode.split("-")[0]
      : null;
    const currentSlotNumber = currentSlotCode.includes("-")
      ? currentSlotCode.split("-")[1]
      : null;

    try {
      const blocks = await handleGetBlocks();
      const formattedB = blocks
        ? blocks.map((b: any) => ({
            label: b.toString(),
            value: b.toString(),
          }))
        : [];
      setFormattedBlocks(formattedB);

      if (blockChar) {
        setSelectedBlock(blockChar.toString());

        const slots = await handleGetEmptySlotsByBlock(blockChar);
        const formattedS = slots
          ? slots.map((s: any) => ({
              label: s.number.toString(),
              value: Number(s.id),
            }))
          : [];

        const hasCurrentSlot = formattedS.some(
          (s: any) => s.value === Number(car.park_id),
        );
        if (!hasCurrentSlot && car.park_id && currentSlotNumber) {
          formattedS.unshift({
            label: currentSlotNumber.toString(),
            value: Number(car.park_id),
          });
        }

        setFormattedSlots(formattedS);

        setSelectedSlot(Number(car.park_id));
      } else {
        setSelectedBlock(null);
        setSelectedSlot(null);
        setFormattedSlots([]);
      }
    } catch (e) {
      console.error("Modal yüklenirken hata oluştu:", e);
    }

    setModalVisible(true);
  };

  const handleUpdateCar = async () => {
    if (!selectedCar || !selectedCar.id || !selectedSlot || !selectedBlock) {
      setStatus({
        message: "Lütfen boş alanları doldurunuz!",
        type: "error",
      });
      setTimeout(() => {
        setStatus(null);
      }, 3000);
      return;
    }

    try {
      const res = await handleUpdateCarInfoById({
        id: Number(selectedCar.id),
        brand: editBrand,
        model: editModel,
        blockName: selectedBlock,
        slot: selectedSlot,
        plate: selectedCar.plate,
      });

      if (res && res.success) {
        setModalVisible(false);
        fetchActiveCars(); // Listeyi anlık olarak db'den tekrar yeniliyoruz

        setStatus({
          message: res.msg || "Araç bilgileri başarıyla güncellendi!",
          type: "success",
        });
        setTimeout(() => {
          setStatus(null);
        }, 3000);
      } else {
        setStatus({
          message: res?.msg || "Araç güncellenirken bir sorun oluştu!",
          type: "error",
        });
        setTimeout(() => {
          setStatus(null);
        }, 3000);
      }
    } catch (e) {
      setStatus({ message: "Sistemsel bir hata oluştu!", type: "error" });
      setTimeout(() => {
        setStatus(null);
      }, 3000);
      console.error("Ön yüzde servis tetiklenirken hata oluştu:", e);
    }
  };

  const fetchActiveCars = async () => {
    try {
      setLoading(true);
      const activeCars = await handleGetAllCar();
      setCars(activeCars);
    } catch (e) {
      console.error("Ön yüzde araçlar listelenirken hata oluştu:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveCars();
    }, []),
  );

  const renderCarCard = ({ item }: { item: Car }) => {
    const entryDate = new Date(item.entry_date);
    const currentDate = new Date();

    const diffInMs = currentDate.getTime() - entryDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // 1 saati güne yuvarlar
    const totalDays = diffInDays <= 0 ? 1 : Math.ceil(diffInDays);

    // Toplam güncel borç cirosu
    const currentFee = totalDays * (item.category_price || 0);

    return (
      <View style={styles.card}>
        <View style={styles.infoArea}>
          <View style={styles.rowTop}>
            <Text style={styles.plateText}>{item.plate.toUpperCase()}</Text>
            <Text style={styles.yearText}>
              {item.category_name} | {item.year}
            </Text>
          </View>

          <View style={styles.rowBottom}>
            <View style={styles.brandModelContainer}>
              <Text style={styles.brandModelText}>
                {item.brand} {item.model}
              </Text>
              <Text style={styles.mileageText}>
                {item.mileage} KM • {item.category_price} TL/Gün •{" "}
                <Text style={{ color: "#F1C40F", fontWeight: "bold" }}>
                  Borç: {currentFee} TL
                </Text>
              </Text>
            </View>

            {/* Dinamik Konum ve Statü Badgeleri */}
            <View style={styles.badgeRow}>
              <View style={[styles.badge, styles.slotBadge]}>
                <Text style={styles.badgeText}>📍{item.car_slot || "YOK"}</Text>
              </View>

              <View style={[styles.badge, styles.statusBadge]}>
                <Text style={styles.badgeText}>İçeride</Text>
              </View>
            </View>
          </View>
        </View>

        {/* İşlem Butonları */}
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={16} color={Colors.white} />
          </TouchableOpacity>
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
            Otopark taranıyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={renderCarCard}
          contentContainerStyle={styles.listContent}
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Otoparkta şu an araç yok!</Text>
          }
        />
      )}
      {/* GÜNCELLEME MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Başlık */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Araç Bilgilerini Düzenle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#E74C3C" />
              </TouchableOpacity>
            </View>

            {/* Plaka (Kilitli) */}
            <Text style={styles.inputLabel}>Araç Plakası</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                {selectedCar?.plate.toUpperCase()}
              </Text>
            </View>

            {/* Marka */}
            <Text style={styles.inputLabel}>Araç Markası</Text>
            <TextInput
              style={styles.modalInput}
              value={editBrand}
              onChangeText={setEditBrand}
              placeholder="Örn: Peugeot"
              placeholderTextColor="#888"
            />

            {/* Model */}
            <Text style={styles.inputLabel}>Araç Modeli</Text>
            <TextInput
              style={styles.modalInput}
              value={editModel}
              onChangeText={setEditModel}
              placeholder="Örn: 508"
              placeholderTextColor="#888"
            />

            {/* Park Bilgileri */}
            <Text style={styles.inputLabel}>Park Bilgileri</Text>
            <View style={{ flexDirection: "row", width: "100%" }}>
              <View style={{ flex: 1 }}>
                <Dropdown
                  style={styles.modalDropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.dropdownContainerStyle}
                  activeColor="rgba(222, 255, 154, 0.05)"
                  itemTextStyle={{ color: Colors.white }}
                  data={formattedBlocks}
                  labelField="label"
                  valueField="value"
                  placeholder="Blok Seç..."
                  value={selectedBlock}
                  onChange={async (item) => {
                    setSelectedBlock(item.value);
                    setSelectedSlot(null);
                    try {
                      // Blok her değiştiğinde slotları yeniler.
                      const slots = await handleGetEmptySlotsByBlock(
                        item.value,
                      );
                      const formattedS = slots
                        ? slots.map((s: any) => ({
                            label: s.number.toString(),
                            value: Number(s.id),
                          }))
                        : [];
                      setFormattedSlots(formattedS);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  renderLeftIcon={() => (
                    <Ionicons
                      name="grid-outline"
                      size={16}
                      color={Colors.primary}
                      style={{ marginRight: 10 }}
                    />
                  )}
                />
              </View>

              <View style={{ width: 10 }} />

              <View style={{ flex: 1 }}>
                <Dropdown
                  style={styles.modalDropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  containerStyle={styles.dropdownContainerStyle}
                  activeColor="rgba(222, 255, 154, 0.05)"
                  itemTextStyle={{ color: Colors.white }}
                  data={formattedSlots}
                  labelField="label"
                  valueField="value"
                  placeholder="Slot Seç..."
                  value={selectedSlot}
                  onChange={(item) => {
                    setSelectedSlot(Number(item.value));
                    setEditSlot(item.label);
                  }}
                  renderLeftIcon={() => (
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={Colors.softGreen}
                      style={{ marginRight: 10 }}
                    />
                  )}
                />
              </View>
            </View>

            {/* Butonlar */}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleUpdateCar}>
                <Text style={styles.modalButtonText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {status && <StatusCard message={status.message} type={status.type} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  emptyText: {
    color: Colors.gray,
    fontFamily: Fonts.mainFont,
    marginTop: 40,
    fontSize: 14,
  },
  card: {
    width: "90%",
    minHeight: 85,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    padding: 12,
    marginBottom: 10,
    elevation: 3,
  },
  infoArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: 10,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
  },
  plateText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
  yearText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Fonts.expFont,
  },
  brandModelContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 2,
  },
  brandModelText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.mainFont,
    fontWeight: "500",
  },
  mileageText: {
    color: Colors.gray,
    fontSize: 11,
    fontFamily: Fonts.expFont,
  },
  badgeRow: { flexDirection: "row", gap: 5 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  slotBadge: { backgroundColor: "#34495E" },
  statusBadge: { backgroundColor: Colors.softGreen },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: Fonts.expFont,
  },
  buttonArea: {
    width: 45,
    justifyContent: "space-between",
    gap: 4,
  },
  actionButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: "100%",
  },
  deleteButton: {
    flex: 0.35,
    backgroundColor: Colors.softRed,
  },
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#444",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#555",
  },
  disabledInput: {
    backgroundColor: "#121212",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  disabledInputText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButton: {
    backgroundColor: "#555",
  },
  saveModalButton: {
    backgroundColor: "#2ECC71",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalDropdown: {
    backgroundColor: "#2C2C2C",
    borderRadius: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#555",
    height: 45,
    justifyContent: "center",
  },
  dropdownContainerStyle: {
    backgroundColor: "#1E1E1E",
    borderColor: "#444",
    borderRadius: 6,
  },

  selectedTextStyle: {
    fontSize: 14,
    color: "#fff",
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#888",
  },
});
