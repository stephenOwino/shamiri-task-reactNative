import React, { useState, useEffect } from "react";
import { NavigationContainer, NavigationProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppRegistry } from "react-native";
import { Modal, View, Text, Button } from "react-native";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { setNavigation, onSessionExpired } from "./api/api";

const Stack = createStackNavigator();

function App() {
  const [sessionExpired, setSessionExpired] = useState(false);
  // Use a ref with proper NavigationContainerRef type
  const navigationRef = React.useRef<NavigationProp<any> | null>(null);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      console.log("Session expired event received, showing modal...");
      setSessionExpired(true);
    });
    return () => {
      // Cleanup listener
      const index = sessionExpiredListeners.indexOf(unsubscribe);
      if (index !== -1) sessionExpiredListeners.splice(index, 1);
    };
  }, []);

  const handleNavigationRef = (nav: NavigationProp<any>) => {
    navigationRef.current = nav;
    setNavigation(nav);
  };

  return (
    <NavigationContainer
      onReady={() => {
        if (navigationRef.current) {
          handleNavigationRef(navigationRef.current);
        }
      }}
      ref={(navigator) => {
        if (navigator) {
          navigationRef.current = navigator as NavigationProp<any>;
        }
      }}
    >
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      <Modal
        visible={sessionExpired}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSessionExpired(false);
          if (navigationRef.current) navigationRef.current.navigate("Login");
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-3/4">
            <Text className="text-lg font-bold mb-4">Session Expired</Text>
            <Text className="mb-4">Your session has expired. Please log in to continue.</Text>
            <Button
              title="OK"
              onPress={() => {
                setSessionExpired(false);
                if (navigationRef.current) navigationRef.current.navigate("Login");
              }}
            />
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent("main", () => App);
export default App;

// Reference to sessionExpiredListeners from api.ts for cleanup
const sessionExpiredListeners = (window as any).sessionExpiredListeners || [];