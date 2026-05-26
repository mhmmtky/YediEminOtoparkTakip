import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import {
  handleAddCategory,
  handleGetCategories,
  handleUpdateCategoryPrice,
} from "@/src/services/categoryService";
import {
  handleGetBlocks,
  handleGetLastSlotByBlockName,
  handleUpdateBlockCapacity,
} from "@/src/services/parkingService";

import { Dropdown } from "react-native-element-dropdown";

export default function ParkingSettingsScreen() {
  const [blocksList, setBlocksList] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [newCapacity, setNewCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  // Kategori State'i
  const [categoriesList, setCategoriesList] = useState<
    { id: number; name: string; daily_price: number; editablePrice?: string }[]
  >([]);

  // Yeni Kategori Modal State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatPrice, setNewCatPrice] = useState("");

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const blocks = await handleGetBlocks();
      setBlocksList(blocks || []);
      if (blocks && blocks.length > 0) {
        setSelectedBlock(blocks[0]);
      }
      await refreshCategories();
    } catch (e) {
      console.error("Ayarlar sayfasında veriler yüklenirken hata: ", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    const cats = await handleGetCategories();
    if (cats && cats.length > 0) {
      const formattedCats = cats.map((c: any) => ({
        ...c,
        editablePrice:
          c.daily_price !== undefined ? c.daily_price.toString() : "0",
      }));
      setCategoriesList(formattedCats);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchCurrentCapacity = async () => {
      if (!selectedBlock) return;
      try {
        const maxResult = await handleGetLastSlotByBlockName(selectedBlock);
        const currentMax =
          maxResult && maxResult.maxNumber ? maxResult.maxNumber : 0;
        setNewCapacity(currentMax.toString());
      } catch (e) {
        console.error("Mevcut kapasite çekilirken hata oluştu:", e);
      }
    };
    fetchCurrentCapacity();
  }, [selectedBlock]);

  // Kapasite Güncelleme
  const handleSaveCapacity = async () => {
    const capacityNum = parseInt(newCapacity);
    if (!selectedBlock || isNaN(capacityNum) || capacityNum <= 0) {
      setStatus({
        message: "Lütfen geçerli bir kapasite değeri giriniz!",
        type: "error",
      });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    Alert.alert(
      "Kapasite Güncelleme",
      `${selectedBlock} bloğunun kapasitesini ${newCapacity} yapmak istediğinize emin misiniz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await handleUpdateBlockCapacity(
                selectedBlock,
                capacityNum,
              );
              if (result && result.success) {
                setStatus({
                  message: `${selectedBlock} bloğu ${capacityNum} slot olarak güncellendi!`,
                  type: "success",
                });
                setNewCapacity(capacityNum.toString());
              } else {
                setStatus({
                  message: result?.error,
                  type: "error",
                });
              }
            } catch (err: any) {
              setStatus({
                message: "Sistemsel bir hata oluştu!",
                type: "error",
              });
            } finally {
              setLoading(false);
              setTimeout(() => setStatus(null), 3000);
            }
          },
        },
      ],
    );
  };

  const handlePriceChangeText = (catId: number, text: string) => {
    setCategoriesList((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, editablePrice: text } : cat,
      ),
    );
  };

  //Satır İçi Fiyat Güncelleme
  const handleSaveSinglePrice = async (
    catId: number,
    catName: string,
    priceText: string,
  ) => {
    try {
      setLoading(true);
      const result = await handleUpdateCategoryPrice(catId, priceText);
      if (result && result.success) {
        setStatus({
          message: `${catName} günlük ücreti ${priceText} TL olarak güncellendi!`,
          type: "success",
        });
      } else {
        setStatus({
          message: result?.error || "Fiyat güncellenirken hata oluştu!",
          type: "error",
        });
      }
    } catch (err) {
      setStatus({
        message: "Sistemsel bir fiyat hatası oluştu!",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  //  Yeni Kategori Ekleme
  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !newCatPrice.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz!");
      return;
    }

    try {
      setLoading(true);
      const result = await handleAddCategory(newCatName, newCatPrice);

      if (result && result.success) {
        setStatus({
          message: `${newCatName} kategorisi başarıyla eklendi!`,
          type: "success",
        });
        setIsModalOpen(false);
        setNewCatName("");
        setNewCatPrice("");
        await refreshCategories();
      } else {
        setStatus({
          message: `Kategori ekleme başarısız oldu!`,
          type: "error",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const formattedBlocks = blocksList.map((bl) => ({
    label: `${bl} Bloğu`,
    value: bl,
  }));

  if (loading && blocksList.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
          style={{
            color: Colors.white,
            marginTop: 10,
            fontFamily: Fonts.expFont,
          }}>
          Otopark ayarları yükleniyor
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      {status && <StatusCard message={status.message} type={status.type} />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Sistem Ayarları</Text>

        {/* BLOK KAPASİTE AYARLARI */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Blok Kapasite Yönetimi</Text>
          <View style={styles.rowContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Blok Seçin</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropdownContainerStyle}
                activeColor="rgba(222, 255, 154, 0.05)"
                itemTextStyle={{ color: Colors.white }}
                data={formattedBlocks}
                labelField="label"
                valueField="value"
                placeholder="Blok..."
                value={selectedBlock}
                onChange={(item) => setSelectedBlock(item.value)}
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
            <View style={{ width: 12 }} />
            <View style={{ flex: 1.2 }}>
              <Text style={styles.fieldLabel}>Kapasite Değeri</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="speedometer-outline"
                  size={16}
                  color={Colors.gray}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={styles.input}
                  value={newCapacity}
                  onChangeText={setNewCapacity}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSaveCapacity}
            disabled={loading}>
            <Text style={styles.submitButtonText}>
              {loading
                ? "VERİTABANI GÜNCELLENİYOR..."
                : "BLOK KAPASİTESİNİ GÜNCELLE"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Kategori Günlük Ücretleri</Text>

          {categoriesList.map((cat) => (
            <View key={cat.id} style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={styles.priceCategoryName}>{cat.name}</Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    value={cat.editablePrice}
                    onChangeText={(text) => handlePriceChangeText(cat.id, text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyText}>TL</Text>
                </View>

                <TouchableOpacity
                  style={styles.inlineSaveButton}
                  onPress={() =>
                    handleSaveSinglePrice(
                      cat.id,
                      cat.name,
                      cat.editablePrice || "0",
                    )
                  }>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.softGreen}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: Colors.softGreen, marginTop: 20 },
            ]}
            onPress={() => setIsModalOpen(true)}>
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={Colors.white}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.submitButtonText}>YENİ KATEGORİ EKLE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Araç Kategorisi</Text>

            <Text style={styles.fieldLabel}>Kategori Adı</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="text-outline"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Örn: Çekici, Karavan vb."
                placeholderTextColor={Colors.placeholder}
              />
            </View>

            <Text style={styles.fieldLabel}>Günlük Ücret (TL)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="cash-outline"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                value={newCatPrice}
                onChangeText={setNewCatPrice}
                placeholder="250"
                placeholderTextColor={Colors.placeholder}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { flex: 1, backgroundColor: "#E74C3C" },
                ]}
                onPress={() => setIsModalOpen(false)}>
                <Text style={styles.submitButtonText}>VAZGEÇ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { flex: 1, backgroundColor: Colors.primary },
                ]}
                onPress={handleCreateCategory}>
                <Text style={styles.submitButtonText}>KAYDET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
    paddingBottom: 10,
  },
  sectionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  sectionHeader: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts.mainFont,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  rowContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
    alignItems: "flex-end",
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
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
    height: "100%",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginTop: 5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
  dropdown: {
    height: 48,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.cardBg,
    marginBottom: 15,
  },
  placeholderStyle: {
    fontSize: 14,
    color: Colors.placeholder,
    fontFamily: Fonts.expFont,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: Fonts.expFont,
  },
  dropdownContainerStyle: {
    backgroundColor: Colors.cardBg,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  priceCategoryName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Fonts.mainFont,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 90,
    height: 38,
  },
  priceInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
    textAlign: "right",
    paddingRight: 4,
  },
  currencyText: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
  },
  inlineSaveButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 10,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    marginBottom: 18,
    textAlign: "center",
  },
});
