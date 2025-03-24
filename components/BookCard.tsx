import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Book } from "@/types/book";

type BookCardProps = {
  book: Book;
};

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter();

  return (
    <Pressable
      className="bg-white rounded-lg shadow-md overflow-hidden w-[160px] m-2"
      onPress={() => router.push(`/book/${book.id}`)}
    >
      <Image
        source={
          book.coverUrl ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80"
        }
        className="w-full h-[200px]"
        contentFit="cover"
      />
      <View className="p-3">
        <Text className="font-bold text-sm" numberOfLines={2}>
          {book.title}
        </Text>
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {book.author}
        </Text>
        <View className="flex-row items-center mt-2">
          <View className="bg-blue-100 rounded-full h-2 flex-1 overflow-hidden">
            <View
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${book.progress || 0}%` }}
            />
          </View>
          <Text className="text-xs text-gray-500 ml-2">
            {book.progress || 0}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
