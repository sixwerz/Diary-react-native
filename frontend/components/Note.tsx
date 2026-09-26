import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import NoteProps from "../types/NoteProps";

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const Note = ({
  noteId,
  noteCreatedAt,
  noteText,
  noteTitle,
  handleDeleteNote,
}: NoteProps) => {
  if (!handleDeleteNote) return;

  const getRelativeDateString = () => {
    const targetDate = new Date(noteCreatedAt);
    const now = new Date();

    const targetDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    ).getTime();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const oneDay = 24 * 60 * 60 * 1000;
    const diff = today - targetDay;

    if (diff === 0) return "Сегодня";
    if (diff === oneDay) return "Вчера";
    if (diff === oneDay * 2) return "Позавчера";

    return targetDate
      .toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace("г.", "");
  };

  const editNote = () => {
    router.push(`/note/${noteId}`);
  };

  const noteDeleteProgress = useSharedValue(0);

  const animatedNoteDelete = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: noteDeleteProgress.value }],
    };
  });

  const animatedTrashDelete = useAnimatedStyle(() => {
    return {
      opacity: noteDeleteProgress.value,
      transform: [
        {
          scale: interpolate(
            noteDeleteProgress.value,
            [0, 150],
            [0.3, 1.2],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_event, gestureState) => {
        noteDeleteProgress.value = Math.max(0, gestureState.dx);

        if (gestureState.dx >= 300) {
          handleDeleteNote(noteId);
        }
      },

      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dx < 300) {
          noteDeleteProgress.value = withSpring(0, {
            mass: 0.5,
            stiffness: 150,
          });
        }

        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          editNote();
        }
      },
    })
  ).current;

  return (
    <View style={stylesMainContainer.container}>
      <View style={stylesTrashContainer.container}>
        <AnimatedIonicons
          style={animatedTrashDelete}
          name="trash"
          color="#fff"
        />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[stylesNoteContainer.container, animatedNoteDelete]}
      >
        <View style={stylesContainerNoteTitle.container}>
          <Text style={stylesNoteTitle.container}>
            {noteTitle ? noteTitle : "Без заголовка"}
          </Text>
          <Text style={stylesNoteCreatedAt.container}>
            {getRelativeDateString()}
          </Text>
        </View>

        <View style={stylesNoteText.container}>
          <Text
            style={stylesNoteText.text}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {noteText}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default Note;

const stylesMainContainer = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 10,
  },
});

const stylesTrashContainer = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "#D96A5A",
    borderRadius: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 24,
    alignItems: "center",
    flexDirection: "row",
  },
});

const stylesNoteContainer = StyleSheet.create({
  container: {
    backgroundColor: "#F1E7D4",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderRadius: 10,
  },
});

const stylesContainerNoteTitle = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
