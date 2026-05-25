import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import {
  handleDeleteCarById,
  handleGetAllCar,
} from "@/src/services/carService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Car {
  id: string;
  plate: string;
  brand: string;
  model: string;
  mileage: string;
  year: string;
  is_paid: number;
  entry_date: string;
  category_name: string;
  category_price: number;
  personal_username: string;
  car_slot: string;
  status?: string;
  park_id: number;
}

export default function deleteCar() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // MODAL & SELECTION
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // 🎯 OWNERS TABLOSUNA UYUMLU INPUT STATE'LERİ AMK
  const [ownerFullName, setOwnerFullName] = useState<string>("");
  const [ownerPhone, setOwnerPhone] = useState<string>("");
  const [ownerTcNo, setOwnerTcNo] = useState<string>("");

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchActiveCars = async () => {
    try {
      setLoading(true);
      const activeCars = await handleGetAllCar();
      setCars(activeCars);
    } catch (e) {
      console.error("Çıkış ekranında araçlar listelenirken hata oluştu:", e);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa her odaklandığında otoparkı canlı tara kanka amk
  useFocusEffect(
    useCallback(() => {
      fetchActiveCars();
    }, []),
  );

  const openDeleteModal = (car: Car) => {
    setSelectedCar(car);
    // Modal her açıldığında içeriyi sıfırla amk pürüz çıkmasın
    setOwnerFullName("");
    setOwnerPhone("");
    setOwnerTcNo("");
    setModalVisible(true);
  };

  const handleReleaseCarAction = async () => {
    if (!selectedCar) return;

    // Ön yüz validasyonları
    if (!ownerFullName.trim() || !ownerPhone.trim() || !ownerTcNo.trim()) {
      setStatus({
        message: "Lütfen teslim alan şahsın bilgilerini eksiksiz girin!",
        type: "error",
      });
      return;
    }
    if (ownerTcNo.trim().length !== 11) {
      setStatus({
        message: "TC Kimlik Numarası 11 hane olmak zorundadır kral!",
        type: "error",
      });
      return;
    }

    try {
      // 🎯 REÇETE: Bütün verileri tek pakette servise gönderiyoruz amk!
      const res = await handleDeleteCarById({
        id: Number(selectedCar.id),
        park_id: Number(selectedCar.park_id),
        plate: selectedCar.plate, // 🎯 Loglama için plakayı da ekledik, az önce çözdüğümüz mevzu!
        full_name: ownerFullName,
        phone: ownerPhone,
        tc_no: ownerTcNo,
      });

      if (res && res.success) {
        setModalVisible(false);
        // Canlı listeyi anlık yenilemek için detailCar'daki o meşhur fonksiyonu tetikle amk
        if (typeof fetchActiveCars === "function") {
          fetchActiveCars();
        }

        setStatus({
          message: `${selectedCar.plate.toUpperCase()} plakalı araç başarıyla teslim edildi ve çıkışı yapıldı!`,
          type: "success",
        });
      } else {
        setStatus({
          message: res.msg || "Araç çıkışı yapılırken hata oluştu!",
          type: "error",
        });
      }
    } catch (e) {
      console.error("Ön yüzde çıkış esnasında hata koptu:", e);
      setStatus({
        message: "Sistemsel bir çıkış hatası oluştu!",
        type: "error",
      });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const renderCarCard = ({ item }: { item: Car }) => {
    const entryDate = new Date(item.entry_date);
    const currentDate = new Date();
    const diffInMs = currentDate.getTime() - entryDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const totalDays = diffInDays <= 0 ? 1 : Math.ceil(diffInDays);
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

        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => openDeleteModal(item)}>
            <Ionicons name="log-out-outline" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.softRed} />
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Araç Çıkış / Teslim Formu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Araç Özet Kartı */}
              <View style={styles.infoSummaryBox}>
                <Text style={styles.summaryText}>
                  📋 Plaka:{" "}
                  <Text style={{ fontWeight: "bold", color: "#F1C40F" }}>
                    {selectedCar?.plate.toUpperCase()}
                  </Text>
                </Text>
                <Text style={styles.summaryText}>
                  📍 Konum: {selectedCar?.car_slot}
                </Text>
                <Text style={styles.summaryText}>
                  🚗 Araç: {selectedCar?.brand} {selectedCar?.model}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Müşteri / Sahip Bilgileri</Text>

              {/* full_name input */}
              <Text style={styles.inputLabel}>Adı Soyadı</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.modalInput}
                  value={ownerFullName}
                  onChangeText={setOwnerFullName}
                  placeholder="Örn: Muhammet Kaya"
                  placeholderTextColor="#666"
                />
              </View>

              {/* phone input */}
              <Text style={styles.inputLabel}>Telefon Numarası</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.modalInput}
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                  placeholder="Örn: 0532 XXXXXXX"
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                />
              </View>

              {/* tc_no input */}
              <Text style={styles.inputLabel}>T.C. Kimlik Numarası</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={Colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.modalInput}
                  value={ownerTcNo}
                  onChangeText={setOwnerTcNo}
                  placeholder="11 Haneli T.C. No"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>

              {/* Butonlar */}
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmDeleteButton]}
                  onPress={handleReleaseCarAction}>
                  <Text style={styles.modalButtonText}>
                    Teslim Et ve Çıkış Yap
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    paddingBottom: 120,
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
    justifyContent: "center",
  },
  actionButton: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.softRed,
    height: "100%",
  },
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    width: "100%",
    maxHeight: "85%", // Ekrandan taşmasın amk klavye açılınca
    padding: 20,
    borderWidth: 1,
    borderColor: "#444",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    fontFamily: Fonts.mainFont,
  },
  infoSummaryBox: {
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    gap: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  summaryText: {
    color: "#aaa",
    fontSize: 13,
    fontFamily: Fonts.expFont,
  },
  inputLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 4,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 6,
    height: 44,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    height: "100%",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 5,
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
  confirmDeleteButton: {
    backgroundColor: "#E74C3C",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
