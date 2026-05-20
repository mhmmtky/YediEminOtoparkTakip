import StatusCard from "@/components/StatusCard"; // 🎯 Senin canavar animasyonlu kart amk
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

export default function AddCarScreen() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: 1,
    name: "Otomobil",
  });

  const categories = [
    { id: 1, name: "Otomobil" },
    { id: 2, name: "Motosiklet" },
    { id: 3, name: "Hafif Ticari" },
    { id: 4, name: "Ticari(Ekskavatör vb.)" },
    { id: 5, name: "Tır" },
  ];

  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [year, setYear] = useState("");

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const onAddCarPress = () => {
    if (!plate.trim()) {
      setStatus({
        message: "Lütfen araç plakasını giriniz!",
        type: "error",
      });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setStatus({
      message: `${plate.toUpperCase()} plakalı araç otoparka kabul eidldi!`,
      type: "success",
    });

    setPlate("");
    setBrand("");
    setModel("");
    setMileage("");
    setYear("");

    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      {status && <StatusCard message={status.message} type={status.type} />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
              placeholder="Örn: 34 MAMI 508"
              placeholderTextColor={Colors.gray}
              autoCapitalize="characters" // Otomatik büyük harf
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
              placeholder="Örn: Peugeot"
              placeholderTextColor={Colors.gray}
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
              placeholder="Örn: 508 GT"
              placeholderTextColor={Colors.gray}
            />
          </View>

          {/* Kilometre (Mileage) */}
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
              placeholder="Örn: 45000"
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
            />
          </View>

          {/* Araç Yılı (Year) */}
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
              placeholder="Örn: 2024"
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
        <Text style={styles.fieldLabel}>Araç Kategorisi *</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.8}>
            <View style={styles.dropdownHeaderLeft}>
              <Ionicons
                name="layers-outline"
                size={18}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <Text style={styles.dropdownSelectedText}>
                {selectedCategory.name}
              </Text>
            </View>
            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.gray}
            />
          </TouchableOpacity>

          {/* Liste Açık Olduğunda Aşağı Dökülecek Elemanlar amk */}
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.dropdownItem,
                    selectedCategory.id === cat.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setDropdownOpen(false); // Seçince kapat kanka
                  }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedCategory.id === cat.id && {
                        color: Colors.softGreen,
                        fontWeight: "bold",
                      },
                    ]}>
                    {cat.name}
                  </Text>
                  {selectedCategory.id === cat.id && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors.softGreen}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Aracı Kabul Et Butonu */}
        <TouchableOpacity style={styles.submitButton} onPress={onAddCarPress}>
          <Text style={styles.submitButtonText}>ARACI OTOPARKA AL</Text>
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
    paddingBottom: 40,
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
    marginTop: 10,
    elevation: 2,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: Fonts.mainFont,
    letterSpacing: 0.5,
  },
  dropdownContainer: {
    width: "100%",
    marginBottom: 15,
    position: "relative",
    zIndex: 50, // Açıldığında alttaki elemanların üstüne binsin amk
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  dropdownHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownSelectedText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
  },
  dropdownList: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 5,
    paddingVertical: 5,
    // Android gölgesi amk
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  dropdownItemActive: {
    backgroundColor: "rgba(222, 255, 154, 0.05)", // Seçili olana hafif ton geç kanka
  },
  dropdownItemText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.expFont,
  },
});
