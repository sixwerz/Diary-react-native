import { useFocusEffect, useRouter } from "expo-router";
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import NoteProps from "../../types/NoteProps";
import Note from "../../components/Note";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInLeft, LinearTransition } from "react-native-reanimated";
import WidgetTrashNotes from "../../components/WidgetTrashNotes";
import { runOnJS } from "react-native-worklets";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteProps[]>([]);

  const [isVisibleWidget, setIsVisibleWidget] = useState<boolean>(false);

  const handlePress = () => {
    router.push("/note/new");
  };

  const loadNotes = async () => {
    try {
      const response = await AsyncStorage.getItem('notes');
      setNotes(response ? JSON.parse(response) : []);
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeleteNote = (noteId: number) => {
    setTimeout(async () => {
      try {
        const currentNotes = await AsyncStorage.getItem("notes");
        const parsedNotes: NoteProps[] = currentNotes
          ? JSON.parse(currentNotes)
          : [];

        const finalNotes = parsedNotes.filter(
          note => note.noteId !== noteId
        );

        const deletedNote = parsedNotes.filter(
          note => note.noteId === noteId
        );

        await AsyncStorage.setItem(
          "notes",
          JSON.stringify(finalNotes)
        );

        const currentDeletedNotes = await AsyncStorage.getItem("deleted_notes");
        const parsedDeletedNotes: NoteProps[] = currentDeletedNotes
          ? JSON.parse(currentDeletedNotes)
          : [];

        const newDeletedNotes = [...parsedDeletedNotes, deletedNote];

        await AsyncStorage.setItem(
          "deleted_notes",
          JSON.stringify(newDeletedNotes)
        );

        setNotes(finalNotes);

        ToastAndroid.show("Запись удалена", ToastAndroid.SHORT);
      } catch (error) {
        console.error(error);
      }
    }, 0);
  };

  useFocusEffect(useCallback(() => {
      loadNotes();
      return () => { };
    }, [])
  );

  const handleVisibleWidget = () => {
    if (!isVisibleWidget) {
      return;
    }
    runOnJS(setIsVisibleWidget)(false)
  }

  return (
    <View style={stylesMain.container}>
      <View style={stylesPad.container}>
        <Text style={styleDate.container}>
          {new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <View style={styleContainerTitle.container}>
          <Text style={stylesTitle.container}>Мои заметки</Text>
          <Pressable
            onPress={handleVisibleWidget}
          >
            <Ionicons
              name="trash"
              size={28}
              color="#6b6178"
            />
          </Pressable>
        </View>
      </View>

      <Modal

        transparent={true}
        visible={isVisibleWidget}
      >
        <WidgetTrashNotes returnNote={() => {} } handleClose={() => setIsVisibleWidget(false)} visible={isVisibleWidget}/>
      </Modal>
      <ScrollView contentContainerStyle={stylesScrollContent.container}>
        {notes.map((note, index) => (
          <Animated.View 
            key={note.noteId}
            entering={FadeInLeft.delay(index * 200).duration(300)}
            layout={LinearTransition.springify().mass(0.4)} 
            >
            <Note {...note} handleDeleteNote={handleDeleteNote} />
          </Animated.View>
        ))}

      </ScrollView>
      <View>
        <AnimatedTouchableOpacity
          style={stylesFab.container}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#F1E7D4" />
        </AnimatedTouchableOpacity>
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

const styleContainerTitle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
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
    borderRadius: 30,
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