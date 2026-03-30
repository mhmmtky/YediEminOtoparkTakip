import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { GlobalStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text style={[Fonts.bigTitle, { color: Colors.header }]}>
        YEDİEMİN OTOPARK
      </Text>
      <Text
        style={[
          Fonts.smallTitle,
          {
            color: Colors.header,
            marginBottom: "1%",
          },
        ]}>
        TAKİP SİSTEMİ
      </Text>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: "45%",
          width: "90%",
          borderWidth: 2,
          borderColor: Colors.header,
          borderStyle: "solid",
          borderRadius: 10,
        }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            marginBottom: 25,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#333",
          }}>
          <Ionicons
            name="person-circle"
            size={64}
            color={Colors.white}
            style={{ marginLeft: "5%" }}
          />
          <Text
            style={[
              Fonts.content,
              GlobalStyles.content,
              { marginLeft: "10%" },
            ]}>
            Personel Giriş Sayfası
          </Text>
        </View>

        {/* Kullanıcı Adı*/}
        <View style={{ width: "90%", marginBottom: 15 }}>
          <Text
            style={[
              Fonts.smallContent,
              {
                color: Colors.white,
                marginBottom: 5,
              },
            ]}>
            Kullanıcı Adı
          </Text>
          <TextInput
            placeholder="Kullanıcı adınızı giriniz"
            placeholderTextColor={Colors.placeholder}
            style={GlobalStyles.inputs}
          />
        </View>
        {/* Şifre */}
        <View style={{ width: "90%", marginBottom: 25 }}>
          <Text
            style={[
              Fonts.smallContent,
              {
                color: Colors.white,
                marginBottom: 5,
              },
            ]}>
            Şifre
          </Text>
          <TextInput
            placeholder="Şifrenizi giriniz"
            placeholderTextColor={Colors.placeholder}
            secureTextEntry={true} // Şifreyi gizler (****)
            style={GlobalStyles.inputs}
          />
        </View>
        {/*Giriş Butonu*/}
        <TouchableOpacity style={GlobalStyles.buttons}>
          <Text
            style={{
              color: Colors.white,
              fontWeight: "bold",
              fontSize: 14,
              fontFamily: "serif",
            }}>
            GİRİŞ YAP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
