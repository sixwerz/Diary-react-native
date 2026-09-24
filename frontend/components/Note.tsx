import { Pressable, StyleSheet, Text, View } from "react-native";
import NoteProps from "../types/NoteProps";
import { router } from "expo-router";

const Note = ({noteId, noteCreatedAt, noteText, noteTitle}: NoteProps) => {
  const getRelativeDateString  = () => {
    const targetDate = new Date(noteCreatedAt);
    const now = new Date();

    const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const oneDay = 24 * 60 * 60 * 1000;
    const diff = today - targetDay;

    if (diff === 0) return 'Сегодня';
    if (diff === oneDay) return 'Вчера'
    if (diff === oneDay  * 2) return 'Позавчера'

    return targetDate.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).replace("г.", ""); 
  }

  const editNote = (id: number) => {
    router.push(`/note/${id}`);
  }

  return (
    <Pressable 
      onPress={() => editNote(noteId)}
      style={stylesNoteContainer.container}
    >
      <View style={stylesContainerNoteTitle.container}>
        <Text style={stylesNoteTitle.container}>{noteTitle}</Text>
        <Text style={stylesNoteCreatedAt.container}>{getRelativeDateString()}</Text>
      </View>
      
      <View style={stylesNoteText.container}>
        <Text style={stylesNoteText.text}>
          {noteText}
        </Text>
      </View>
    </Pressable>
  );
}

export default Note;

const stylesNoteContainer = StyleSheet.create({
  container: {
    backgroundColor: "#F1E7D4",
    paddingTop: 16,       
    paddingHorizontal: 16, 
    paddingBottom: 14,    
    borderRadius: 10,
    marginBottom: 10,
  },
});

const stylesContainerNoteTitle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

const stylesNoteTitle = StyleSheet.create({
  container: {
    fontFamily: "Inter_700Bold",  
    fontSize: 18,
    color: "#222222",
  },
});

const stylesNoteCreatedAt = StyleSheet.create({
  container: {
    fontFamily: "Inter_400Regular",  
    fontSize: 12,
    color: "#B9AFC7",
  },
});

const stylesNoteText = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  text: {
    fontFamily: "Inter_400Regular",  
    fontSize: 13,
    color: "#6b6178",
    lineHeight: 20,
  },
});