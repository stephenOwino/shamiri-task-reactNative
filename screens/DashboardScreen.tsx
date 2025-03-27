import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal, TextInput, FlatList } from "react-native";
import { createEntry, getEntries, updateEntry, deleteEntry } from "../api/api";
import EntryItem from "../components/EntryItem";

export type Entry = {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string | null;
};

export default function DashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchEntries = async () => {
    try {
      const { data } = await getEntries();
      setEntries(data);
      setError("");
    } catch (error: any) {
      console.error("Fetch entries failed:", error);
      setError(error.response?.data?.message || "Failed to load entries");
    }
  };

  const handleSaveEntry = async () => {
    try {
      const entryData = { title, content, category, date };
      if (editMode && editId) {
        await updateEntry(editId, entryData);
      } else {
        await createEntry(entryData);
      }
      setModalVisible(false);
      setEditMode(false);
      setTitle("");
      setContent("");
      setCategory("");
      setEditId(null);
      fetchEntries();
      setError("");
    } catch (error: any) {
      console.error("Save entry failed:", error);
      setError(error.response?.data?.message || "Failed to save entry");
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditMode(true);
    setModalVisible(true);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setDate(entry.date);
    setEditId(entry.id);
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await deleteEntry(id);
      fetchEntries();
      setError("");
    } catch (error: any) {
      console.error("Delete entry failed:", error);
      setError(error.response?.data?.message || "Failed to delete entry");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl mb-4">Journal Entries</Text>
      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}
      <Button title="Add Entry" onPress={() => setModalVisible(true)} />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EntryItem entry={item} onEdit={handleEditEntry} onDelete={handleDeleteEntry} />
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 justify-center p-4">
          <Text className="text-xl mb-4">{editMode ? "Edit Entry" : "New Entry"}</Text>
          <TextInput
            className="border p-2 mb-4"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="border p-2 mb-4"
            placeholder="Content"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TextInput
            className="border p-2 mb-4"
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            className="border p-2 mb-4"
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
          />
          <Button title="Save" onPress={handleSaveEntry} />
          <Button
            title="Cancel"
            onPress={() => {
              setModalVisible(false);
              setEditMode(false);
              setTitle("");
              setContent("");
              setCategory("");
              setEditId(null);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}