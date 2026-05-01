import { Redirect } from "expo-router";

export default function Index() {
  // Şimdilik direkt Login sayfasına fırlatıyoruz.
  // İleride "Giriş yapılmış mı?" kontrolünü burada yapacaksın.
  return <Redirect href="/(auth)/login" />;
}
