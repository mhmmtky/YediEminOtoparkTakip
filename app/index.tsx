import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        width: 300,
        height: 100,
      }}>
      <Text>Saldır Fenerbahçe Oley</Text>
      <Link href="/(auth)/login" style={{ color: "blue", marginTop: 20 }}>
        Giriş Yap Sayfasına Git
      </Link>
      <Button title="Saldır Fenerbahçe Ooley"></Button>
    </View>
  );
}
