import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const isLockedRef = useRef(false);
  const isRecordingRef = useRef(false);
  const touchStartTime = useRef(0);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecording = () => {
    try {
      isLockedRef.current = false;
      isRecordingRef.current = false;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      setIsLocked(false);
    } catch (error) {
      console.error("Ошибка остановки:", error);

      isRecordingRef.current = false;
      isLockedRef.current = false;
      setIsRecording(false);
      setIsLocked(false);
    }
  };

  const startRecognition = () => {
    try {
      ExpoSpeechRecognitionModule.start({
        lang: "ru-RU",
        interimResults: true,
        continuous: true,
      });

      isRecordingRef.current = true;
      setIsRecording(true);
      console.log("Распознавание запущено");
    } catch (error) {
      console.error("Ошибка запуска распознавания:", error);

      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const startRecording = async () => {
    try {
      if (isRecordingRef.current) return;

      const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permissions.granted) {
        console.log("Нет разрешения на распознавание речи");
        return;
      }

      startRecognition();
    } catch (error) {
      console.error("Ошибка запуска записи:", error);

      isRecordingRef.current = false;
      isLockedRef.current = false;
      setIsRecording(false);
      setIsLocked(false);
    }
  };

  const stopLockedRecording = () => {
    stopRecording();
  };

  const handleSave = () => {
    if (title.trim() === "" || text.trim() === "") {
      console.log("Введите текст и название заметки");
      return;
    }

    console.log(`Сохраняем заметку ${id}:`, { title, text });
  };

  const handleBack = () => {
    stopRecording();
    router.back();
  };

  useSpeechRecognitionEvent("result", (event) => {
    if (!event.isFinal) return;

    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) return;

    console.log("Распознано:", transcript);

    setText((prev) => {
      const previousText = prev.trim();
      if (!previousText) return transcript;
      return `${previousText} ${transcript}`;
    });

    if (!isLockedRef.current) {
      stopRecording();
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Ошибка распознавания:", JSON.stringify(event));

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    isRecordingRef.current = false;
    isLockedRef.current = false;
    setIsRecording(false);
    setIsLocked(false);
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("Распознавание завершено");

    isRecordingRef.current = false;
    setIsRecording(false);

    if (!isLockedRef.current) {
      setIsLocked(false);
      return;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    restartTimeoutRef.current = setTimeout(() => {
      if (!isLockedRef.current) return;

      try {
        ExpoSpeechRecognitionModule.start({
          lang: "ru-RU",
          interimResults: true,
          continuous: true,
        });

        isRecordingRef.current = true;
        setIsRecording(true);
        console.log("Распознавание перезапущено");
      } catch (error) {
        console.error("Ошибка перезапуска:", error);
      }
    }, 300);
  });

  useEffect(() => {
    if (id === "new") {
      setTitle("");
      setText("");
    } else {
      setTitle(`Заметка #${id}`);
      setText(`Текст заметки номер ${id}`);
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      isLockedRef.current = false;
      isRecordingRef.current = false;

      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (error) {
        console.error("Ошибка очистки:", error);
      }
    };
  }, [id]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        touchStartTime.current = Date.now();

        isLockedRef.current = false;
        setIsLocked(false);
        startRecording();
      },

      onPanResponderMove: (_event, gestureState) => {
        if (gestureState.dy < -60 && !isLockedRef.current) {
          isLockedRef.current = true;
          setIsLocked(true);
          setIsRecording(true);
        }
      },

      onPanResponderRelease: (_event, gestureState) => {
        if (isLockedRef.current || gestureState.dy < -60) {
          isLockedRef.current = true;
          setIsLocked(true);
          return;
        }
        stopRecording();
      },

      onPanResponderTerminate: () => {
        stopRecording();
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
        <Text style={styles.backText}>Назад</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Button title="Сохранить" onPress={handleSave} />
      </View>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Заголовок"
        placeholderTextColor="#777"
      />

      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Текст заметки..."
        placeholderTextColor="#777"
        multiline
        textAlignVertical="top"
      />

      {isLocked ? (
        <TouchableOpacity
          style={[styles.fab, styles.fabLocked]}
          onPress={stopLockedRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>■</Text>
        </TouchableOpacity>
      ) : (
        <View
          {...panResponder.panHandlers}
          style={[styles.fab, isRecording && styles.fabRecording]}
        >
          <Text style={styles.fabIcon}>{isRecording ? "●" : "🎤"}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#BFEBFF",
  },
  backText: {
    color: "#222222",
    fontSize: 16,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    textAlignVertical: "top",
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
  fabRecording: {
    backgroundColor: "#34C759",
  },
  fabLocked: {
    backgroundColor: "#FF3B30",
  },
  fabIcon: {
    fontSize: 28,
    color: "#fff",
  },
});