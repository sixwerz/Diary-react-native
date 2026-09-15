import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  const handlePress = () => {
    console.log("Создать новую заметку");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Мои заметки</Text>
        {/* Здесь будет ваш список заметок */}

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9CDFFF",
  },
  scrollContent: {
    padding: 20,
    marginTop: 150,
  },

  noteContainer: {
    backgroundColor: "#BFEBFF",
    padding: 15,
    borderRadius: 10,
    color: "#222222",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
