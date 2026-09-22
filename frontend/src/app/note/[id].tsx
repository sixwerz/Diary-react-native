import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditNoteScreen() {
  const router = useRouter();

  // 1. Получаем параметр id из URL
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  // 2. Загружаем данные заметки при монтировании экрана
  useEffect(() => {
    if (id === "new") {
      // Если передали id = "new", значит создаем новую заметку
      setTitle("");
      setText("");
    } else {
      // Здесь должна быть логика получения заметки из БД / AsyncStorage / State по id
      // Пример загрузки данных:
      console.log("Загружаем заметку с ID:", id);

      // Имитация загрузки:
      setTitle(`Заметка #${id}`);
      setText(`Текст заметки номер ${id}`);
    }
  }, [id]);

  const handleSave = () => {
    // Логика сохранения/обновления заметки в БД по id
    console.log(`Сохраняем заметку ${id}:`, { title, text });

    // Возвращаемся назад на главный экран
    router.back();
  };

  const handlePress = () => {
    console.log("Нажата кнопка голосового ввода");
  };

  const handleBack = () => {
    router.back();
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

      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>O</Text>
      </TouchableOpacity>
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
