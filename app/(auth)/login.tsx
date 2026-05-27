import StatusCard from "@/components/StatusCard";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { GlobalStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/hooks/userAuth";

export default function LoginScreen() {
  const { username, setUsername, password, setPassword, handleLogin, status } =
    useAuth();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        keyboardShouldPersistTaps="handled">
        {status && <StatusCard message={status.msg} type={status.type} />}
        <Image
          source={require("@/assets/images/logo.png")}
          style={{
            width: 130,
            height: 130,
            resizeMode: "contain",
            marginTop: -50,
            marginBottom: 20,
            opacity: 0.5,
          }}
        />

        <Text
          style={[
            Fonts.bigTitle,
            { color: Colors.header, textAlign: "center" },
          ]}>
          {"YEDİEMİN OTOPARK "}
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
            width: "90%",
            borderWidth: 2,
            borderColor: Colors.header,
            borderStyle: "solid",
            borderRadius: 10,
            paddingVertical: 20,
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
              style={[GlobalStyles.inputs, { color: Colors.white }]}
              value={username}
              onChangeText={setUsername}
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
              secureTextEntry={true}
              style={GlobalStyles.inputs}
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {/*Giriş Butonu*/}
          <TouchableOpacity style={GlobalStyles.buttons} onPress={handleLogin}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
