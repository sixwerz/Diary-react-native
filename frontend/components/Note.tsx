import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import NoteProps from "../types/NoteProps";

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const Note = ({
  noteId,
  noteCreatedAt,
  noteText,
  noteTitle,
  status,
  handleDeleteNote,
  returnNote
}: NoteProps) => {
  if (!handleDeleteNote && !returnNote) return null;

  const isDeleting = useRef(false);

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

  const animatedNoteTrashBG = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        noteDeleteProgress.value,
        [0, 150],
        [0, 1],
        Extrapolation.CLAMP
      ),
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
            [0.3, 2],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_event, gestureState) => {
        noteDeleteProgress.value = Math.max(0, gestureState.dx);
      },

      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dx >= 300 && status === 'active') {
          if (!handleDeleteNote) return;
          handleDeleteNote(noteId);
          return;
        }
        if (gestureState.dx >= 200 && status === 'deleted') {
          if (!returnNote) return;
          returnNote(noteId);
          return;
        }

        noteDeleteProgress.value = withSpring(0, {
          mass: 0.5,
          stiffness: 150,
        });

        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10 && status === 'active') {
          editNote();
        }
      },
    }),
    [status, noteId, handleDeleteNote, returnNote]
  );

  return (
    <View style={stylesMainContainer.container}>
      {status === 'deleted' ? (
        <Animated.View style={[stylesTrashContainer.container, stylesTrashContainer.deleted, animatedNoteTrashBG]}>
          <MaterialIcons name="restore" size={24} color="#fff" />       
        </Animated.View>
      ) : (
        <Animated.View style={[stylesTrashContainer.container, stylesTrashContainer.active, animatedNoteTrashBG,]}>
          <AnimatedIonicons
            style={animatedTrashDelete}
            name="trash"
            color="#fff"
          />
        </Animated.View>
      )}
    

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
    borderRadius: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 24,
    alignItems: "center",
    flexDirection: "row",
  },
  active: {
    backgroundColor: "#D96A5A",
  },
  deleted: {
    backgroundColor: "#4B9B7A",
  }
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
