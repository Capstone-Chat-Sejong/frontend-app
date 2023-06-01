import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaView, Platform, NativeModules, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { KeyboardAvoidingView } from "react-native";
import { useState, useEffect, useRef } from "react";
import { WEBVIEW_URL } from "@env";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export default function App() {
  const [topAreaColor, setTopAreaColor] = useState("#F1E9E9");
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  const handleNavigationChange = (navState) => {
    if (
      navState.url.slice(-4) === "chat" ||
      navState.url.slice(-6) === "notice"
    )
      setTopAreaColor("#D0435B");
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

  /**notifications */
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
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
            onMessage={({ nativeEvent }) => {
              const { type, data } = JSON.parse(nativeEvent.data);
              if (type === "SCHEDULE") {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: "오늘의 일정입니다!",
                    body: data.title,
                    sound: true,
                  },
                  trigger: {
                    seconds: data.date, // 1
                  },
                });
              }
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
