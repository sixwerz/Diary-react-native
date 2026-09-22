import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const notes = [{ id: "1", title: 'Добро пожаловать в "Diary-react-native"' }];

  const openNote = (id: string) => {
    router.push({
      pathname: "/note/[id]",
      params: { id },
    });
  };

  const handlePress = () => {
    router.push({
      pathname: "/note/[id]",
      params: { id: "new" },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои заметки</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Здесь будет ваш список заметок */}

        {notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            style={styles.noteContainer}
            onPress={() => openNote(note.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.noteTitle}>{note.title}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.noteContainer}>
          <Text>Название</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9CDFFF",
    padding: 20,
  },
  scrollContent: {
    // padding: 20,
  },

  noteContainer: {
    backgroundColor: "#BFEBFF",
    padding: 15,
    borderRadius: 10,
    color: "#222222",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 150,
  },
  noteTitle: {
    fontSize: 16,
    color: "#222222",
  },
  fab: {
    position: "absolute",
    bottom: 30, // Отступ от нижнего края экрана
    alignSelf: "center", // Центрирование элемента по горизонтали в абсолютном позиционировании
    width: 60,
    height: 60,
    borderRadius: 30, // Половина ширины/высоты для идеального круга
    backgroundColor: "#007AFF", // Цвет кнопки
    justifyContent: "center",
    alignItems: "center",
    // Тень для iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    // Тень для Android
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    marginTop: -3, // Легкая корректировка выравнивания плюса по вертикали
  },
});
