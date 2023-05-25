import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaView, Platform, NativeModules, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { KeyboardAvoidingView } from "react-native";
import { useState, useEffect } from "react";
import { WEBVIEW_URL } from "@env";

export default function App() {
  const [topAreaColor, setTopAreaColor] = useState("#F1E9E9");
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  const handleNavigationChange = (navState) => {
    if (navState.url.slice(-4) === "chat") setTopAreaColor("#D0435B");
    else setTopAreaColor("#F1E9E9");
  };

  const handleUrlRequest = (event) => {
    if (!event.url.startsWith(WEBVIEW_URL)) {
      Linking.openURL(event.url);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const { StatusBarManager } = NativeModules;
    Platform.OS == "ios"
      ? StatusBarManager.getHeight((statusBarFrameData) => {
          setStatusBarHeight(statusBarFrameData.height);
        })
      : null;
  }, []);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: topAreaColor }} />
      <StatusBar />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F1E9E9" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={statusBarHeight}
        >
          <WebView
            source={{ uri: `${WEBVIEW_URL}/login` }}
            domStorageEnabled={true}
            keyboardDisplayRequiresUserAction={false}
            automaticallyAdjustContentInsets={true}
            startInLoadingState={true}
            scrollEnabled={false}
            onNavigationStateChange={handleNavigationChange}
            onShouldStartLoadWithRequest={handleUrlRequest}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
