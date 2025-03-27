import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { login } from "../api/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    console.log("Login button clicked", { email: trimmedEmail, password });
    try {
      console.log("Calling login API...");
      const { data } = await login({ email: trimmedEmail, password });
      console.log("Login success:", data);
      await SecureStore.setItemAsync("token", data.token);
      console.log("Token stored, navigating...");
      navigation.navigate("Dashboard" as never);
    } catch (err: any) {
      console.error("Login error:", err.message, "Response:", err.response?.data, "Code:", err.code);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <Text className="text-xl mb-4">Login</Text>
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      <TextInput
        className="border p-2 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        className="border p-2 mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Register"
        onPress={() => {
          console.log("Navigating to Register");
          navigation.navigate("Register" as never);
        }}
      />
    </View>
  );
}