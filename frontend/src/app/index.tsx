import { useFocusEffect, useRouter } from "expo-router";
import {
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import NoteProps from "../../types/NoteProps";
import Note from "../../components/Note";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInLeft, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import WidgetTrashNotes from "../../components/WidgetTrashNotes";
import { runOnJS } from "react-native-worklets";

const { height } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
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
        const response = await AsyncStorage.getItem('notes');
        const loadNotes: NoteProps[] = response ? JSON.parse(response) : [];

        const finalNotes = loadNotes.filter(note => note.noteId !== noteId);
        const deletedNote = notes.find(note => note.noteId === noteId);

        if (!deletedNote) {
          console.log("Заметка не найдена");
          return;
        }

        const newDeletedNote: NoteProps = {
          ...deletedNote,
          status: 'deleted',
          deletedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("notes", JSON.stringify(finalNotes));

        const currentDeletedNotes = await AsyncStorage.getItem("deleted_notes");
        const parsedDeletedNotes: NoteProps[] = currentDeletedNotes
          ? JSON.parse(currentDeletedNotes)
          : [];

        const newDeletedNotes = [...parsedDeletedNotes, newDeletedNote];

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

  const returnNote = async (noteId: number) => {
    try {
      const responseDeletedNotes = await AsyncStorage.getItem('deleted_notes');
      const deletedNotes: NoteProps[] = responseDeletedNotes
        ? JSON.parse(responseDeletedNotes)
        : []

      const response = await AsyncStorage.getItem('notes');
      const ActiveNotes: NoteProps[] = response
        ? JSON.parse(response)
        : []

      const findNote = deletedNotes.find(note => note.noteId === noteId)

      if (!findNote) {
        console.log("Заметка не найдена");
        return;
      }

      const { deletedAt, ...restoredNote } = findNote;

      const note: NoteProps = {
        ...restoredNote,
        status: 'active',
      };

      ActiveNotes.push(note)

      const newDeletedNotes = deletedNotes.filter(note => note.noteId !== noteId)

      await AsyncStorage.setItem(
        "deleted_notes",
        JSON.stringify(newDeletedNotes)
      );

      await AsyncStorage.setItem(
        "notes",
        JSON.stringify(ActiveNotes)
      );

      setNotes(ActiveNotes);
      ToastAndroid.show("Заметка востановленна", ToastAndroid.SHORT);
    } catch (error) {
      console.error(error);
    }
  }

  const cleanExpiredDeletedNotes = async () => {
    try {
      const response = await AsyncStorage.getItem('deleted_notes');
      const deletedNotes: NoteProps[] = response ? JSON.parse(response) : [];

      const twoDays = 2 * 24 * 60 * 60 * 1000;

      const deletedIds: number[] = [];

      deletedNotes.forEach(note => {
        if (!note.deletedAt) return;

        const deletedTime = new Date(note.deletedAt).getTime();

        if (Date.now() - deletedTime >= twoDays) {
          deletedIds.push(note.noteId);
        }
      });

      const finalDeletedNotes = deletedNotes.filter(
        note => !deletedIds.includes(note.noteId)
      )

      await AsyncStorage.setItem(
        'deleted_notes',
        JSON.stringify(finalDeletedNotes)
      );
    } catch (error) {
      console.error(error);
    }
  }

  const handleSetVisibleWidget = () => {
    if (isVisibleWidget) {
      visibleProgress.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setIsVisibleWidget)(false);
        }
      });
    } else {
      setIsVisibleWidget(true);
    }
  };

  const visibleProgress = useSharedValue(0);

  const animatedStyleVisible = useAnimatedStyle(() => {
    return {
      opacity: visibleProgress.value,
    }
  })

  useFocusEffect(useCallback(() => {
    loadNotes();
    cleanExpiredDeletedNotes()
    return () => { };
  }, [])
  );

  useEffect(() => {
    if (isVisibleWidget) {
      visibleProgress.value = 0;
      visibleProgress.value = withTiming(1, { duration: 300, });
    }
  }, [isVisibleWidget]);

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
            onPress={handleSetVisibleWidget}
          >
            <View style={{ position: "relative" }}>
              <Ionicons name="folder-outline" size={28} color="#6b6178" />
              <Ionicons
                name="trash"
                size={12}
                color="#D96A5A"
                style={{ position: "absolute", bottom: 5, right: 8 }}
              />
            </View>
          </Pressable>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={isVisibleWidget}
      >
        <AnimatedPressable
          onPress={handleSetVisibleWidget}
          style={[stylesViewMain.container, animatedStyleVisible]}
        >
          <WidgetTrashNotes
            returnNote={returnNote}
            handleClose={handleSetVisibleWidget}
            visible={isVisibleWidget}
          />
        </AnimatedPressable>
      </Modal>

      {notes.length === 0 ? (
        <View style={stylesEmpty.container}>
          <Feather name="folder" size={80} color="#B9AFC7" />
          <Text style={stylesEmpty.title}>Активных заметок нет</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
            <Text style={stylesEmpty.subtitle}>Нажмите</Text>
            <Ionicons name="add-circle" size={16} color="#D98A3D" />
            <Text style={stylesEmpty.subtitle}>внизу, чтобы создать</Text>
          </View>
        </View>
      ) : (
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
      )}

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

const stylesViewMain = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(42, 35, 51, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});

const stylesEmpty = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: height * 0.2,
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