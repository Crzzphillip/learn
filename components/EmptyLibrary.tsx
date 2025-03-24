import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { BookPlus } from "lucide-react-native";

export default function EmptyLibrary() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="bg-blue-50 p-6 rounded-full mb-4">
        <BookPlus size={48} color="#3b82f6" />
      </View>
      <Text className="text-xl font-bold text-center mb-2">
        Your library is empty
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Upload your first book to start learning with AI-generated courses and
        quizzes
      </Text>
      <Pressable
        className="bg-blue-500 py-3 px-6 rounded-lg"
        onPress={() => router.push("/add-book")}
      >
        <Text className="text-white font-bold">Add Your First Book</Text>
      </Pressable>
    </View>
  );
}
