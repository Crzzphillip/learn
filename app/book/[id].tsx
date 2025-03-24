import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ArrowLeft, BookOpen, Brain, CheckCircle } from "lucide-react-native";
import * as mockData from "@/utils/mockData";
import { Book, CourseModule } from "@/types/book";
import { generateCourseFromChunks } from "@/utils/courseGenerator";
import { chunkPDFContent } from "@/utils/pdfUtils";
import { initGroqClient } from "@/utils/groqApi";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Initialize Groq client - in a real app, you would get this from environment variables
  useEffect(() => {
    try {
      // This is a placeholder - in a real app, you would use an actual API key
      // For demo purposes, we'll use a mock implementation in the generateAIResponse function
      initGroqClient("demo-api-key");
    } catch (error) {
      console.error("Failed to initialize Groq client:", error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      const bookData = mockData.getBook(id);
      if (bookData) {
        setBook(bookData);
        setModules(mockData.getModulesByBook(id));
      }
    }
  }, [id]);

  const handleGenerateCourse = async () => {
    if (!book) return;

    setIsGeneratingCourse(true);
    setGenerationProgress(0);
    setGenerationError(null);

    try {
      // In a real app, we would read the PDF file and extract text
      // For demo purposes, we'll use mock text
      const mockPdfText = `This is a sample text from the book "${book.title}" by ${book.author}. 
      It contains information about various topics and concepts that would be found in a real book. 
      The AI will analyze this content and create educational modules and quizzes based on it. 
      In a real implementation, this would be the actual text extracted from the PDF file that was uploaded.
      This is just a placeholder to demonstrate the functionality of the course generation feature.
      The AI would process the text in chunks to maintain context between sections and create a coherent learning experience.
      Each chunk would be processed to extract key concepts, explanations, and generate quiz questions to test understanding.`;

      // Create chunks from the PDF text
      const chunks = chunkPDFContent(mockPdfText, 500); // Smaller chunks for demo
      setGenerationProgress(20);

      // Generate course content and quizzes from chunks
      const { modules: generatedModules, quizzes } =
        await generateCourseFromChunks(
          book.id,
          chunks,
          book.title,
          book.author || "Unknown Author",
        );
      setGenerationProgress(80);

      // Update book to mark course as generated
      const updatedBook = { ...book, courseGenerated: true };
      mockData.addBook(updatedBook);
      setBook(updatedBook);

      // Add generated modules and quizzes to mock data
      mockData.addMultipleModules(generatedModules);
      mockData.addMultipleQuizzes(quizzes);
      setModules(generatedModules);

      setGenerationProgress(100);
      setIsGeneratingCourse(false);
    } catch (error) {
      console.error("Error generating course:", error);
      setGenerationError("Failed to generate course. Please try again.");
      setIsGeneratingCourse(false);

      // Fallback to mock modules if generation fails
      if (modules.length === 0) {
        const newModules = [
          {
            id: `m-${Date.now()}-1`,
            bookId: book.id,
            title: "Chapter 1: Introduction",
            content:
              "This is the introduction to the book. The AI has analyzed the content and extracted key concepts to help you understand the material better.",
            order: 1,
            completed: false,
          },
          {
            id: `m-${Date.now()}-2`,
            bookId: book.id,
            title: "Chapter 2: Core Concepts",
            content:
              "This chapter covers the core concepts of the book. The AI has identified the most important ideas and presented them in a structured format for easier learning.",
            order: 2,
            completed: false,
          },
          {
            id: `m-${Date.now()}-3`,
            bookId: book.id,
            title: "Chapter 3: Advanced Topics",
            content:
              "This chapter delves into more advanced topics from the book. The AI has broken down complex ideas into more digestible sections with examples.",
            order: 3,
            completed: false,
          },
        ];

        newModules.forEach((module) => mockData.addModule(module));
        setModules(newModules);

        // Update book to mark course as generated despite error
        const updatedBook = { ...book, courseGenerated: true };
        mockData.addBook(updatedBook);
        setBook(updatedBook);
      }
    }
  };

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="relative">
        <Image
          source={
            book.coverUrl ||
            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"
          }
          className="w-full h-[250px]"
          contentFit="cover"
        />
        <View className="absolute top-12 left-4">
          <Pressable
            className="bg-white/80 rounded-full p-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </Pressable>
        </View>
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <Text className="text-white text-2xl font-bold">{book.title}</Text>
          <Text className="text-white/80 text-sm">{book.author}</Text>
        </View>
      </View>

      <View className="p-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <BookOpen size={20} color="#3b82f6" />
            <Text className="ml-2 text-gray-600">PDF Book</Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-gray-600 mr-2">
              {book.progress || 0}% Complete
            </Text>
            <View className="bg-gray-200 rounded-full h-2 w-[100px] overflow-hidden">
              <View
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${book.progress || 0}%` }}
              />
            </View>
          </View>
        </View>

        {!book.courseGenerated ? (
          <View className="bg-blue-50 p-6 rounded-lg mb-6">
            <View className="flex-row items-center mb-3">
              <Brain size={24} color="#3b82f6" />
              <Text className="ml-2 text-lg font-bold">Generate AI Course</Text>
            </View>
            <Text className="text-gray-600 mb-4">
              Let AI analyze this book and create an interactive course with
              quizzes to help you learn more effectively.
            </Text>
            {generationError && (
              <Text className="text-red-500 mb-3">{generationError}</Text>
            )}
            <Pressable
              className={`bg-blue-500 py-3 rounded-lg items-center ${isGeneratingCourse ? "opacity-70" : ""}`}
              onPress={handleGenerateCourse}
              disabled={isGeneratingCourse}
            >
              {isGeneratingCourse ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold ml-2">
                    Generating Course... {generationProgress}%
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold">Generate Course</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <>
            <Text className="text-xl font-bold mb-4">Course Modules</Text>
            {modules.map((module, index) => (
              <Pressable
                key={module.id}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex-row items-center"
                onPress={() => router.push(`/module/${module.id}`)}
              >
                <View className="bg-blue-100 rounded-full h-8 w-8 items-center justify-center mr-3">
                  <Text className="text-blue-500 font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold">{module.title}</Text>
                  <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {module.content.substring(0, 60)}...
                  </Text>
                </View>
                {module.completed && <CheckCircle size={20} color="#10b981" />}
              </Pressable>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
