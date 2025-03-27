import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button } from "react-native";
import * as SecureStore from "expo-secure-store";
import { updateProfile, getProfile } from "../api/api";

export default function SettingsScreen() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setUsername(data.username);
    } catch (err) {
      console.error("Fetch profile failed:", err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ username });
      setMessage("Profile updated successfully");
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
      setMessage("");
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    // Navigation to Login would go here (not implemented due to stack simplicity)
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl mb-4">Settings</Text>
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      {message ? <Text className="text-green-500 mb-4">{message}</Text> : null}
      <TextInput
        className="border p-2 mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Update Profile" onPress={handleUpdateProfile} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}