import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditNoteScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (id === "new") {
      setTitle("");
      setText("");
    } else {

      console.log("Загружаем заметку с ID:", id);

      setTitle(`Заметка #${id}`);
      setText(`Текст заметки номер ${id}`);
    }
  }, [id]);

  const handleSave = () => {
    console.log(`Сохраняем заметку ${id}:`, { title, text });
    router.back();
  };

  const handlePress = () => {
    console.log("Нажата кнопка голосового ввода");
  };

  const handleBack = () => {
    router.back();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setIsLocked(false);
        setIsRecording(true);
        console.log('Запись пошла');
      },

      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy < -60) {
          setIsLocked(true);
          console.log('Запись закреплена');
        }
      },

      onPanResponderRelease: (e, gestureState) => {
        setIsRecording(false);
        if (gestureState.dy < -60) {
          return;
        }
        console.log('Запись остановлена');
      },

      onPanResponderTerminate: () => {
         setIsRecording(false);
        console.log("Запись прервана системой");
      },
    })
  ).current;

  const stopLockedRecording = () => {
    setIsLocked(false);
    setIsRecording(false);
    console.log("Запись остановлена вручную");
  };


  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        // style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.8}
      >
        <Text>Назад</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Button title="Сохранить" onPress={handleSave} />
      </View>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Заголовок"
      />

      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Текст заметки..."
        multiline
      />

      {isLocked ? (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: "#FF3B30" }]}
          onPress={stopLockedRecording}
        >
          <Text style={styles.fabIcon}>1</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.fab, 
            isRecording && { backgroundColor: "#34C759" } 
          ]}
          activeOpacity={0.8}
          {...panResponder.panHandlers} 
        >
          <Text style={styles.fabIcon}>
            {isRecording ? "1" : "0"}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#BFEBFF" },
  header: { alignItems: "flex-end", marginBottom: 10 },
  titleInput: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  textInput: { flex: 1, fontSize: 16, textAlignVertical: "top" },
  backButton: {
    color: "#222222",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center", 
    width: 60,
    height: 60,
    borderRadius: 30, 
    backgroundColor: "#007AFF", 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    marginTop: -3, 
  },
});
