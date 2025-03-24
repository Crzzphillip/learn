import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Upload, X, FileText } from "lucide-react-native";
import { Image } from "expo-image";
import * as mockData from "@/utils/mockData";
import { pickPDF, readPDF, chunkPDFContent } from "@/utils/pdfUtils";

export default function AddBookScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size?: number;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [isPdfJsLoaded, setPdfJsLoaded] = useState(false);

  // Load PDF.js library for web platform
  useEffect(() => {
    if (Platform.OS === "web") {
      const loadPdfJs = async () => {
        try {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
          script.async = true;
          script.onload = () => setPdfJsLoaded(true);
          document.body.appendChild(script);
        } catch (error) {
          console.error("Failed to load PDF.js:", error);
        }
      };
      loadPdfJs();
    }
  }, []);

  const handleSelectPDF = async () => {
    const result = await pickPDF();
    if (result) {
      setSelectedFile(result);
      // Try to extract title from filename
      if (!title) {
        const filename = result.name;
        const nameWithoutExtension = filename.replace(/\.pdf$/i, "");
        const formattedName = nameWithoutExtension
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setTitle(formattedName);
      }
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a book title");
      return;
    }

    if (!selectedFile) {
      Alert.alert("Error", "Please select a PDF file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setProcessingStatus("Initializing PDF processing...");

    try {
      // Process the PDF file
      setProcessingStatus("Reading PDF content...");
      const pdfData = await readPDF(selectedFile.uri);
      setUploadProgress(40);

      if (!pdfData || !pdfData.text) {
        throw new Error("Failed to extract text from PDF");
      }

      setProcessingStatus("Analyzing content and creating chunks...");
      // Create chunks from the PDF text
      const chunks = chunkPDFContent(pdfData.text);
      setUploadProgress(70);

      if (chunks.length === 0) {
        throw new Error("Failed to create content chunks from PDF");
      }

      setProcessingStatus(
        `Created ${chunks.length} content sections for learning`,
      );

      // Add book to data store
      const bookId = Date.now().toString();
      const newBook = {
        id: bookId,
        title: title.trim(),
        author: author.trim() || "Unknown Author",
        coverUrl:
          coverUrl ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80",
        filePath: selectedFile.uri,
        uploadDate: new Date(),
        progress: 0,
        totalPages: pdfData.numpages || 1,
        currentPage: 0,
        pdfChunks: chunks.length,
      };

      // Store the chunks for later course generation
      // In a real app, you would store these in a database
      localStorage.setItem(`book_${bookId}_chunks`, JSON.stringify(chunks));

      mockData.addBook(newBook);
      setUploadProgress(100);
      setProcessingStatus("Book processed successfully!");
      await delay(500); // Brief delay before navigation

      // Navigate to the book detail page where course generation will happen
      router.push(`/book/${bookId}`);
    } catch (error) {
      console.error("Error uploading book:", error);
      Alert.alert(
        "Error",
        `Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsUploading(false);
      setUploadProgress(0);
      setProcessingStatus("");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Add New Book</Text>
          <Pressable onPress={() => router.back()}>
            <X size={24} color="#000" />
          </Pressable>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold mb-2">Book Cover</Text>
          <View className="items-center justify-center bg-gray-100 rounded-lg h-[200px] overflow-hidden">
            {coverUrl ? (
              <Image
                source={coverUrl}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <View className="items-center">
                <Upload size={32} color="#9ca3af" />
                <Text className="text-gray-400 mt-2">
                  Tap to add cover image URL
                </Text>
              </View>
            )}
          </View>
          <TextInput
            className="mt-2 p-3 border border-gray-200 rounded-lg"
            placeholder="Cover image URL (optional)"
            value={coverUrl}
            onChangeText={setCoverUrl}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-bold mb-2">Book Title</Text>
          <TextInput
            className="p-3 border border-gray-200 rounded-lg"
            placeholder="Enter book title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-bold mb-2">Author</Text>
          <TextInput
            className="p-3 border border-gray-200 rounded-lg"
            placeholder="Enter author name"
            value={author}
            onChangeText={setAuthor}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold mb-2">PDF File</Text>
          <Pressable
            className="p-4 border border-dashed border-gray-300 rounded-lg items-center justify-center"
            onPress={handleSelectPDF}
            disabled={isUploading}
          >
            {selectedFile ? (
              <View className="items-center">
                <FileText size={24} color="#3b82f6" />
                <Text className="text-blue-500 mt-2" numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {selectedFile.size
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : ""}
                </Text>
              </View>
            ) : (
              <>
                <Upload size={24} color="#3b82f6" />
                <Text className="text-blue-500 mt-2">Select PDF File</Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Tap to select a PDF
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {Platform.OS === "web" && !isPdfJsLoaded && (
          <View className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <Text className="text-yellow-700">
              Loading PDF processing library...
            </Text>
          </View>
        )}

        <Pressable
          className={`py-3 px-6 rounded-lg items-center ${isUploading || (Platform.OS === "web" && !isPdfJsLoaded) ? "bg-gray-400" : "bg-blue-500"}`}
          onPress={handleUpload}
          disabled={isUploading || (Platform.OS === "web" && !isPdfJsLoaded)}
        >
          {isUploading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold ml-2">
                {processingStatus || `Uploading... ${uploadProgress}%`}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold">Upload Book</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
