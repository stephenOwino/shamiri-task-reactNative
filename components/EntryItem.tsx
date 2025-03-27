import React from "react";
import { View, Text, Button } from "react-native";
import { Entry } from "../screens/DashboardScreen";

type Props = {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
};

export default function EntryItem({ entry, onEdit, onDelete }: Props) {
  return (
    <View className="p-2 border-b">
      <Text className="font-bold">{entry.title}</Text>
      <Text>{entry.content}</Text>
      <Text>Category: {entry.category}</Text>
      <Text>Date: {entry.date}</Text>
      <View className="flex-row mt-2">
        <Button title="Edit" onPress={() => onEdit(entry)} />
        <Button title="Delete" onPress={() => onDelete(entry.id)} />
      </View>
    </View>
  );
}