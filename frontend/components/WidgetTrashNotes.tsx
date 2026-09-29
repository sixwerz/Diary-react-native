import { Pressable, ScrollView, StyleSheet, Text, useAnimatedColor, View } from "react-native";
import WidgetTrashNotesProps from "../types/WidgetTrashNotesProps";
import { useCallback, useEffect, useState } from "react";
import NoteProps from "../types/NoteProps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import Animated, { FadeInLeft, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Note from "./Note";
import { Feather, Ionicons } from "@expo/vector-icons";


const WidgetTrashNotes = ({ returnNote, handleClose, visible }: WidgetTrashNotesProps) => {
  const [deletedNotes, setDeletedNotes] = useState<NoteProps[]>([]);

  const loadDeletedNotes = async () => {
    try {
      const response = await AsyncStorage.getItem('deleted_notes');
      setDeletedNotes(response ? JSON.parse(response) : []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadDeletedNotes();
  }, [visible]);


  const handleReturnNote = async (noteId: number) => {
    await returnNote(noteId);
    await loadDeletedNotes();
  }


  return (
    <Pressable 
      style={stylesFormMain.container}
    >
      <Pressable onPress={handleClose} style={stylesCloseButton.container}>
        <Text style={stylesCloseButton.text}>X</Text>
      </Pressable>

      {deletedNotes.length === 0 ? (
        <View style={stylesEmpty.container}>
          <Feather name="trash" size={80} color="#B9AFC7" />
          <Text style={stylesEmpty.title}>Корзина пуста</Text>
          <Text style={stylesEmpty.subtitle}>
            Удалённые заметки появятся здесь
          </Text>
        </View>
      ) : (
        <ScrollView style={stylesNotesContainer.scroll}>
          {deletedNotes.map((note, index) => (
            <Animated.View key={note.noteId}>
              <Note {...note} handleDeleteNote={() => {}} returnNote={handleReturnNote} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </Pressable>
  );
}



const stylesEmpty = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#2A2333",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#B9AFC7",
    marginTop: 8,
    textAlign: "center",
  },
});

const stylesFormMain = StyleSheet.create({
  container: {
    backgroundColor: "#F8F1E4",
    width: "85%",
    maxWidth: 450,
    maxHeight: "75%",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
});

const stylesCloseButton = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#2A2333",
  },
});

const stylesNotesContainer = StyleSheet.create({
  scroll: {
    width: "100%",
  },
  content: {
    gap: 10,
    paddingVertical: 10,
  },
});

export default WidgetTrashNotes;