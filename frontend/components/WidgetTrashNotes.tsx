import { StyleSheet, View } from "react-native";
import WidgetTrashNotesProps from "../types/WidgetTrashNotesProps";
import { useCallback, useEffect, useState } from "react";
import NoteProps from "../types/NoteProps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import Animated, { FadeInLeft, LinearTransition } from "react-native-reanimated";
import Note from "./Note";

const WidgetTrashNotes = ({returnNote, handleClose, visible}: WidgetTrashNotesProps) => {
  const [deletedNotes, setDeletedNotes] = useState<NoteProps[]>([]);

  const loadDeletedNotes = async () => {
    try {
      const response = await AsyncStorage.getItem('deleted_notes');
      setDeletedNotes(response ? JSON.parse(response) : []);
      console.log(deletedNotes);
      
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadDeletedNotes();
  }, [visible]);

  


  return (
    <View style={stylesViewMain.container}>
      <View style={stylesNotesContainer.container}>
        {deletedNotes.map((note, index) => (
          <Animated.View 
            key={note.noteId}
            entering={FadeInLeft.delay(index * 200).duration(300)}
            layout={LinearTransition.springify().mass(0.4)} 
            >
            <Note {...note} handleDeleteNote={() => {}} returnNote={returnNote}/>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const stylesViewMain = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 194, 194, 0.6)'    
  }
});

const stylesNotesContainer = StyleSheet.create({
  container: {
    padding: 20,
    width: '75%',
    backgroundColor: '#F8F1E4'
    
  },
})

export default WidgetTrashNotes;