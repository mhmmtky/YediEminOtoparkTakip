import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { handleAddCar } from "@/src/services/carService";
import { handleGetCategories } from "@/src/services/categoryService";
import {
  handleGetBlocks,
  handleGetEmptySlotsByBlock,
} from "@/src/services/parkingService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function AddCarScreen() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>({});
  const [categories, setCategories] = useState<
    { id: number; name: string; daily_price?: number }[]
  >([]);

  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [year, setYear] = useState("");

  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
  const [blocksList, setBlocksList] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>("");

  // SLOT NUMARASI SEÇİMİ STATELERİ
  const [slotDropdownOpen, setSlotDropdownOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [freeSlotsInBlock, setFreeSlotsInBlock] = useState<
    { id: number; number: number; slot_code: string }[]
  >([]);

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Veritabanından Kategorileri Çeker
  const loadCategoriesFromDB = async () => {
    try {
      const data = await handleGetCategories();
      setCategories(data || []);

      if (data && data.length > 0) {
        setSelectedCategory({ id: data[0].id, name: data[0].name });
      }
    } catch (e) {
      console.error("Kategoriler ekrana basılırken hata: ", e);
    }
  };

  // Blokları Doldurur
  const loadParkingData = async () => {
    try {
      const blocks = await handleGetBlocks();
      setBlocksList(blocks || []);

      if (blocks && blocks.length > 0) {
        setSelectedBlock(blocks[0]);
      }
    } catch (e) {
      console.error("Bloklar yüklenirken hata oluştu: ", e);
    }
  };

  // Slotları Doldurur
  const loadFreeSlots = async (blockName: string) => {
    if (!blockName) return;
    try {
      const slots = await handleGetEmptySlotsByBlock(blockName);
      setFreeSlotsInBlock(slots || []);
    } catch (e) {
      console.error(
        `${blockName} bloğunun slotları çekilirken hata oluştu: `,
        e,
      );
    }
  };

  useEffect(() => {
    loadCategoriesFromDB();
    loadParkingData();
  }, []);

  useEffect(() => {
    loadFreeSlots(selectedBlock);
  }, [selectedBlock]);

  const onAddCarPress = async () => {
    if (!plate.trim()) {
      setStatus({ message: "Lütfen araç plakasını giriniz!", type: "error" });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    if (!selectedSlot) {
      setStatus({
        message: "Lütfen bir park slotu seçiniz kanka!",
        type: "error",
      });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      const response = await handleAddCar({
        brand: brand,
        model: model,
        plate: plate,
        mileage: mileage,
        year: year,
        category_id: selectedCategory,
        park_id: selectedSlot.id,
      });

      if (response && response.success) {
        setStatus({
          message: `${plate.toUpperCase()} plakalı araç ${selectedSlot.slot_code} konumuna başarıyla kabul edildi!`,
          type: "success",
        });

        setPlate("");
        setBrand("");
        setModel("");
        setMileage("");
        setYear("");
        setSelectedSlot(null);

        if (typeof loadFreeSlots === "function") {
          loadFreeSlots(selectedBlock);
        }
      } else {
        setStatus({
          message:
            response?.error || "Araç kaydedilirken veritabanı hatası oluştu!",
          type: "error",
        });
      }
    } catch (e) {
      console.error("Ön yüzde buton tetiklenirken hat aoluştu: ", e);
      setStatus({ message: "Sistemsel bir hata oluştu!", type: "error" });
    }

    setTimeout(() => setStatus(null), 3000);
  };

  const formattedCategories = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
    original: cat,
  }));

  const formattedBlocks = blocksList.map((bl) => ({
    label: `${bl} Bloğu`,
    value: bl,
  }));

  const formattedSlots = freeSlotsInBlock.map((slot) => ({
    label: `Slot ${slot.number}`,
    value: slot.id,
    original: slot,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      {status && <StatusCard message={status.message} type={status.type} />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>Araç Kabul</Text>
        <Text style={styles.subtitle}>
          Yediemin otoparkına alınan aracın detaylarını eksiksiz giriniz.
        </Text>

        <View style={styles.formContainer}>
          {/* Araç Plakası */}
          <Text style={styles.fieldLabel}>Araç Plakası</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="card-outline"
              size={18}
              color={Colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { fontWeight: "bold", color: Colors.softGreen },
              ]}
              value={plate}
              onChangeText={setPlate}
              placeholder="34 T 1508"
              placeholderTextColor={Colors.placeholder}
              autoCapitalize="characters"
            />
          </View>

          {/* Marka */}
          <Text style={styles.fieldLabel}>Marka</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="car-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="Mercedes-Benz"
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          {/* Model */}
          <Text style={styles.fieldLabel}>Model</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="car-sport-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="CLA 180"
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          {/* Kilometre */}
          <Text style={styles.fieldLabel}>Kilometre (KM)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="speedometer-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={mileage}
              onChangeText={setMileage}
              placeholder="45000"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
            />
          </View>

          {/* Araç Yılı */}
          <Text style={styles.fieldLabel}>Araç Model Yılı</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="2024"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>

        {/* Araç Kategorisi Dropdown */}
        <Text style={styles.fieldLabel}>Araç Kategorisi</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainerStyle}
          activeColor="rgba(222, 255, 154, 0.05)"
          itemTextStyle={{ color: Colors.white }}
          data={formattedCategories}
          labelField="label"
          valueField="value"
          placeholder="Kategori Seç..."
          value={selectedCategory?.id}
          onChange={(item) => {
            setSelectedCategory(item.original);
          }}
          renderLeftIcon={() => (
            <Ionicons
              name="layers-outline"
              size={18}
              color={Colors.primary}
              style={{ marginRight: 10 }}
            />
          )}
        />

        {/* Park Bilgileri */}
        <Text style={styles.fieldLabel}>Park Bilgileri </Text>
        <View style={styles.rowContainer}>
          <View style={{ flex: 1 }}>
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
              placeholder="Blok Seç..."
              value={selectedBlock}
              onChange={(item) => {
                setSelectedBlock(item.value);
                setSelectedSlot(null);
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
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={styles.dropdownContainerStyle}
              activeColor="rgba(222, 255, 154, 0.05)"
              itemTextStyle={{ color: Colors.white }}
              data={formattedSlots}
              labelField="label"
              valueField="value"
              placeholder="Slot Seç..."
              value={selectedSlot?.id}
              onChange={(item) => {
                setSelectedSlot(item.original);
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

        {/* Aracı Kabul Et Butonu */}
        <TouchableOpacity style={styles.submitButton} onPress={onAddCarPress}>
          <Text style={styles.submitButtonText}>ARAÇ KAYDINI TAMAMLA</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: Fonts.mainFont,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 5,
    marginBottom: 25,
    fontFamily: Fonts.expFont,
  },
  formContainer: {
    width: "100%",
    marginBottom: 10,
  },
  fieldLabel: {
    color: Colors.white,
    fontSize: 13,
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
    height: "100%",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
  rowContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
  },
  //Dropdown style:
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
});
