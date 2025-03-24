import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send, Key } from "lucide-react-native";
import * as mockData from "@/utils/mockData";
import { CourseModule } from "@/types/book";
import { initGroqClient, generateAIResponse } from "@/utils/groqApi";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function AskScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId?: string }>();
  const router = useRouter();
  const [module, setModule] = useState<CourseModule | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (moduleId) {
      const moduleData = mockData.getModule(moduleId);
      if (moduleData) {
        setModule(moduleData);

        // Add initial welcome message
        setMessages([
          {
            id: "welcome",
            text: `I\'m your AI learning assistant for "${moduleData.title}". Ask me any questions about this module, and I\'ll help explain the concepts in a way that\'s easy to understand.`,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      // Generic welcome message if no module is specified
      setMessages([
        {
          id: "welcome",
          text: "I'm your AI learning assistant. Ask me any questions about your books or learning materials, and I'll help explain the concepts in a way that's easy to understand.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [moduleId]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API key");
      return;
    }

    try {
      // Initialize the Groq client with the API key
      initGroqClient(apiKey);
      setIsApiKeySet(true);
      setShowApiKeyModal(false);
      Alert.alert("Success", "API key has been set successfully");
    } catch (error) {
      console.error("Error setting API key:", error);
      Alert.alert("Error", "Failed to set API key. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (!isApiKeySet) {
      setShowApiKeyModal(true);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const currentInputText = inputText.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Generate response using Groq API
      const moduleContext = module
        ? `Module Title: ${module.title}\nModule Content: ${module.content}`
        : undefined;
      const responseText = await generateAIResponse(
        currentInputText,
        moduleContext,
      );

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, there was an error processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Scroll to the bottom after adding new messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="bg-white p-4 flex-row items-center border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold flex-1" numberOfLines={1}>
          {module ? `Ask about: ${module.title}` : "Ask AI Assistant"}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 max-w-[85%] rounded-lg p-3 ${message.isUser ? "bg-blue-500 self-end" : "bg-gray-100 self-start"}`}
          >
            <Text className={message.isUser ? "text-white" : "text-gray-800"}>
              {message.text}
            </Text>
            <Text
              className={`text-xs mt-1 ${message.isUser ? "text-blue-200" : "text-gray-500"}`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View className="self-start bg-gray-100 rounded-lg p-3 mb-4">
            <Text className="text-gray-500">AI is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View className="p-4 border-t border-gray-200 flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
          placeholder="Ask a question..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <Pressable
          className={`rounded-full p-2 ${inputText.trim() ? "bg-blue-500" : "bg-gray-300"}`}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Send size={20} color="#fff" />
        </Pressable>
        {!isApiKeySet && (
          <Pressable
            className="ml-2 rounded-full p-2 bg-gray-200"
            onPress={() => setShowApiKeyModal(true)}
          >
            <Key size={20} color="#555" />
          </Pressable>
        )}
      </View>

      {/* API Key Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showApiKeyModal}
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-[90%] max-w-md">
            <Text className="text-xl font-bold mb-4">Enter Groq API Key</Text>
            <Text className="mb-4 text-gray-600">
              Please enter your Groq API key to enable AI responses. You can get
              an API key from the Groq website.
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full"
              placeholder="sk-..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              autoCapitalize="none"
            />
            <View className="flex-row justify-end">
              <Pressable
                className="px-4 py-2 mr-2"
                onPress={() => setShowApiKeyModal(false)}
              >
                <Text className="text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={handleSaveApiKey}
              >
                <Text className="text-white font-medium">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
