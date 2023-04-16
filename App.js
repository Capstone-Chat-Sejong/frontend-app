import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  return (
    <>
      <StatusBar />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <WebView source={{ uri: "" }} />
      </SafeAreaView>
    </>
  );
}
