import { useFocusEffect, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NoteProps from "../../types/NoteProps";
import Note from "../../components/Note";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteProps[]>([]);

  const handlePress = () => {
    router.push("/note/new");
  };

  const loadNotes = async () => {
    try {
      const response = await AsyncStorage.getItem('notes');
      setNotes(response ? JSON.parse(response) : []);
      console.log('Заметки загружены');
    } catch (error) {
      console.error(error);
    }
  }

  useFocusEffect(useCallback(() => {
    loadNotes();
    return () => {}
  }, []));

  return (
    <View style={stylesMain.container}>
      <View style={stylesPad.container}>
        <Text style={styleDate.container}>
          {new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <Text style={stylesTitle.container}>Мои заметки</Text>
      </View>

      <ScrollView contentContainerStyle={stylesScrollContent.container}>
        {notes.map((note) => (
          <View key={note.noteId}>
            <Note {...note}/>
          </View>
        ))}

      </ScrollView>

      <View>
        <TouchableOpacity
          style={stylesFab.container}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#F1E7D4" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stylesMain = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    fontFamily: 'Inter-Bold',
    backgroundColor: '#F8F1E4'
  },
});

const styleDate = StyleSheet.create({
  container: {
    fontStyle: 'italic', 
    color: '#4B3F72', 
    fontSize: 12,
  }
})

const stylesPad = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
});

const stylesTitle = StyleSheet.create({
  container: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: 'Inter-Bold',
  },
});

const stylesScrollContent = StyleSheet.create({
  container: {
    // padding: 20,
  },
});

const stylesFab = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 26,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#D98A3D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#D98A3D",       
    shadowOffset: { 
      width: 0,                 
      height: 10                
    },
    shadowOpacity: 0.45,        
    shadowRadius: 12,              
    elevation: 10,                 
  },
  icon: {
    fontSize: 32,
    color: "#fff",
    marginTop: -3,
  },
});