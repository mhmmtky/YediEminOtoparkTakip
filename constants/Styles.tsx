import { StyleSheet } from "react-native";
import { Colors } from "./Colors";

export const GlobalStyles = StyleSheet.create({
  pageHeader: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.header,
    textAlign: "center",
    marginBottom: 10,
  },
  inputs: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttons: {
    backgroundColor: Colors.primary,
    width: "90%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    color: Colors.white,
  },
  navIcons: {
    padding: 5,
    opacity: 0.7,
    color: "white",
  },
});
