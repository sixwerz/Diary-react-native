import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import NoteProps from "../../../../types/NoteProps";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [noteId, setNoteId] = useState<number | string>(
    id === "new" ? id : Number(id)
  );

  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteText, setNoteText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isClickBlocked, setIsClickBlocked] = useState<boolean>(false);

  const isLockedRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const touchStartTime = useRef(0);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recordingProgress = useSharedValue(1);
  const colorProgress = useSharedValue(0);

  const animatedStyleRecordingButton = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2],
      ["#D98A3D", "#34C759", "#FF3B30"]
    );

    return {
      transform: [{ scale: recordingProgress.value }],
      backgroundColor: bgColor,
      shadowColor: bgColor,
    };
  });

  useEffect(() => {
    if (isLocked) {
      colorProgress.value = withTiming(2, { duration: 350 });
    } else if (isRecording) {
      colorProgress.value = withTiming(1, { duration: 350 });
    } else {
      colorProgress.value = withTiming(0, { duration: 350 });
    }
  }, [isRecording, isLocked]);

  useEffect(() => {
    if (isRecording) {
      recordingProgress.value = withRepeat(
        withSequence(
          withTiming(0.92, { duration: 500 }),
          withTiming(1.08, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      recordingProgress.value = withSpring(1, { mass: 0.5, stiffness: 150 });
    }
  }, [isRecording]);

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

  const startRecordingFlow = async () => {
    try {
      if (isRecordingRef.current) return;

      const permissions =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permissions.granted) {
        console.log("Нет разрешения на распознавание речи");
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "ru-RU",
        interimResults: true,
        continuous: false,
      });

      isRecordingRef.current = true;
      setIsRecording(true);
      console.log("Распознавание запущено");
    } catch (error) {
      console.error("Ошибка запуска записи:", error);
      isRecordingRef.current = false;
      isLockedRef.current = false;
      setIsRecording(false);
      setIsLocked(false);
    }
  };

  useSpeechRecognitionEvent("result", (event) => {
    try {
      if (!event.isFinal) return;

      const transcript = event.results?.[0]?.transcript?.trim();
      if (!transcript) return;

      console.log("Распознано:", transcript);

      setNoteText((prev) => {
        const previousText = prev.trim();
        if (!previousText) return transcript;
        return `${previousText} ${transcript}.`;
      });

      if (!isLockedRef.current) {
        stopRecording();
      }
    } catch (error) {
      console.error("Ошибка распознавания", error);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Ошибка распознавания:", JSON.stringify(event));

    if (event.error === "no-speech") {
      console.log("Слова не распознаны");
      if (isLockedRef.current) {
        return;
      }
      return;
    }

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

  const saveNote = async () => {
    try {
      const response = await AsyncStorage.getItem("notes");
      const notes: NoteProps[] = response ? JSON.parse(response) : [];

      const finalNotes: NoteProps[] =
        noteId === "new"
          ? [...notes, { 
              noteText, 
              noteTitle, 
              noteId: Date.now(), 
              noteCreatedAt: new Date().toISOString(), 
              status: 'active' 
            }]
          : notes.map(note => note.noteId === noteId ? { ...note, noteText, noteTitle } : note);

      await AsyncStorage.setItem("notes", JSON.stringify(finalNotes));          
      ToastAndroid.show("Сохранено", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleBack = async () => {
  await saveNote();
  stopRecording();
  router.back();
};

  const loadNote = async (id: number) => {
    try {
      const response = await AsyncStorage.getItem("notes");
      if (!response) {
        console.log("Заметки не найдены");
        return;
      }
      const notes: NoteProps[] = JSON.parse(response);
      const foundNote = notes.find((note) => note.noteId === id);

      if (!foundNote) {
        console.log(`Записи с id: ${id} не найдено`);
        return;
      }

      setNoteTitle(foundNote.noteTitle);
      setNoteText(foundNote.noteText);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (noteId === "new") {
      setNoteTitle("");
      setNoteText("");
    } else {
      loadNote(Number(noteId));
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
        if (isClickBlocked) {
          return;
        }

        touchStartTime.current = Date.now();
        isLockedRef.current = false;
        setIsLocked(false);
        startRecordingFlow();
      },

      onPanResponderMove: (_event, gestureState) => {
        if (isClickBlocked) return;
        if (gestureState.dy < -60 && !isLockedRef.current) {
          isLockedRef.current = true;
          setIsLocked(true);
          setIsRecording(true);
        }
      },

      onPanResponderRelease: (_event, gestureState) => {
        if (isClickBlocked) return;

        if (isLockedRef.current || gestureState.dy < -60) {
          isLockedRef.current = true;
          setIsLocked(true);
          return;
        }

        stopRecording();

        setIsClickBlocked(true);
        setTimeout(() => {
          setIsClickBlocked(false);
        }, 1000);
      },

      onPanResponderTerminate: () => {
        stopRecording();
      },
    })
  ).current;

  return (
    <SafeAreaView style={stylesMain.container}>
      <KeyboardAvoidingView
        behavior="height"
        style={stylesMain.keyboardAvoiding}
      >
        <View style={stylesMain.innerContent}>
          <View style={stylesHeader.container}>
            <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Pressable onPress={saveNote}>
              <Ionicons name="save-outline" size={24} color="#222" />
            </Pressable>
          </View>

          <TextInput
            style={stylesTitleInput.container}
            value={noteTitle}
            onChangeText={setNoteTitle}
            placeholder="Заголовок"
            placeholderTextColor={"black"}
          />

          <TextInput
            style={stylesTextInput.container}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Текст заметки..."
            placeholderTextColor={"#6b6178"}
            multiline
            textAlignVertical="top"
          />

          {isLocked ? (
            <View style={stylesFabLayout.wrapper}>
              <AnimatedTouchableOpacity
                style={[stylesFab.container, animatedStyleRecordingButton]}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <Ionicons name="stop" size={30} color="#fff" />
              </AnimatedTouchableOpacity>
              <Text style={stylesFabLayout.tipText}>
                Говорите — текст появится сам
              </Text>
            </View>
          ) : (
            <View style={stylesFabLayout.wrapper}>
              <Animated.View
                style={[
                  stylesFab.container,
                  isClickBlocked && { opacity: 0.5 },
                  animatedStyleRecordingButton,
                ]}
                {...panResponder.panHandlers}
              >
                <Ionicons name="mic" size={28} color="#fff" />
              </Animated.View>

              {isRecording && (
                <Text style={stylesFabLayout.tipText}>
                  Говорите — текст появится сам
                </Text>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stylesMain = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F8F1E4",
    paddingBottom: 15,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    // paddingHorizontal: 20,
    paddingBottom: 15,
  },
});

const stylesHeader = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 10,
  },
});

const stylesTitleInput = StyleSheet.create({
  container: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#2A2333",
    marginBottom: 15,
    paddingVertical: 5,
  },
});

const stylesTextInput = StyleSheet.create({
  container: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#2A2333",
    lineHeight: 24,
  },
});

const stylesFabLayout = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    fontSize: 13,
    color: "#B9AFC7",
    fontFamily: "Inter-Regular",
    position: "absolute",
    top: -25,
    width: 200,
    textAlign: "center",
  },
});

const stylesFab = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D98A3D",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D98A3D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
