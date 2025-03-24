import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import BookCard from "@/components/BookCard";
import EmptyLibrary from "@/components/EmptyLibrary";
import * as mockData from "@/utils/mockData";

export default function HomeScreen() {
  const router = useRouter();
  const books = mockData.getBooks();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 border-b border-gray-200">
        <Text className="text-2xl font-bold">My Book Library</Text>
        <Text className="text-gray-500">
          Upload books and learn with AI-generated courses
        </Text>
      </View>

      {books.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <ScrollView className="flex-1 p-4">
          <View className="flex-row flex-wrap justify-between">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </View>
        </ScrollView>
      )}

      <View className="absolute bottom-6 right-6">
        <Pressable
          className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/add-book")}
        >
          <Plus size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
