import React, { useEffect, Component } from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppRegistry, Text, View } from "react-native";
import { Modal, Button, Animated } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, RootState } from "./store";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { reset, setSessionExpired } from "./slices/authSlice";

const Stack = createStackNavigator();

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Something went wrong. Please restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const dispatch = useDispatch();
  const { sessionExpired } = useSelector((state: RootState) => state.auth);
  const navigationRef = React.useRef<NavigationContainerRef<{
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Settings: undefined;
  }> | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sessionExpired) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [sessionExpired, fadeAnim]);

  const handleModalClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      dispatch(reset());
      if (navigationRef.current) {
        navigationRef.current.navigate("Login");
      }
    });
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      <Modal visible={sessionExpired} transparent={true} animationType="none">
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            opacity: fadeAnim,
          }}
        >
          <View className="bg-white p-6 rounded-lg w-3/4 shadow-lg">
            <Text className="text-lg font-bold mb-4 text-center">Session Expired</Text>
            <Text className="mb-4 text-center">Your session has expired. Please log in to continue.</Text>
            <Button title="OK" onPress={handleModalClose} color="#007AFF" />
          </View>
        </Animated.View>
      </Modal>
    </NavigationContainer>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
}

AppRegistry.registerComponent("main", () => App);
export default App;