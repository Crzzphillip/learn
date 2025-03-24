import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

// Function to pick a PDF file using the document picker
export const pickPDF = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error("Error picking PDF:", error);
    return null;
  }
};

// Function to read and extract text from a PDF file
export const readPDF = async (uri: string) => {
  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // For web platform, we can use pdf.js library
    // For native platforms, we would need a different approach
    // This implementation focuses on web platform

    // Create a temporary blob URL to load the PDF
    const blob = base64ToBlob(base64, "application/pdf");
    const blobUrl = URL.createObjectURL(blob);

    // Load the PDF using pdf.js (dynamically imported)
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

    const loadingTask = pdfjsLib.getDocument(blobUrl);
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    // Clean up
    URL.revokeObjectURL(blobUrl);

    return {
      numpages: numPages,
      text: fullText,
    };
  } catch (error) {
    console.error("Error reading PDF:", error);
    // Fallback to a simpler method if the above fails
    return extractTextFromPDFAlternative(uri);
  }
};

// Fallback method for PDF text extraction
async function extractTextFromPDFAlternative(uri: string) {
  try {
    // Use a PDF extraction API service
    // For demo purposes, we'll simulate with a fetch to a hypothetical API
    const response = await fetch("https://api.example.com/extract-pdf-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pdfUrl: uri }),
    });

    if (!response.ok) {
      throw new Error("PDF extraction API failed");
    }

    const data = await response.json();
    return {
      numpages: data.pageCount || 1,
      text: data.text || "Failed to extract text from PDF",
    };
  } catch (error) {
    console.error("Alternative PDF extraction failed:", error);
    // Last resort fallback
    return {
      numpages: 1,
      text: "Failed to extract text from this PDF. The file may be encrypted, scanned, or in an unsupported format.",
    };
  }
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

// Function to chunk PDF content into manageable pieces
export const chunkPDFContent = (text: string, chunkSize: number = 4000) => {
  if (!text) return [];

  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // Skip empty paragraphs
    if (!paragraph.trim()) continue;

    // If adding this paragraph would exceed chunk size, save current chunk and start a new one
    if (
      currentChunk.length + paragraph.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }

    // Add paragraph to current chunk
    currentChunk += paragraph + "\n\n";

    // If current chunk is already bigger than chunk size, split it further
    while (currentChunk.length > chunkSize) {
      // Find a good breaking point (end of sentence)
      let breakPoint = currentChunk.substring(0, chunkSize).lastIndexOf(".");
      if (breakPoint === -1)
        breakPoint = Math.min(chunkSize, currentChunk.length);
      else breakPoint += 1; // Include the period

      chunks.push(currentChunk.substring(0, breakPoint).trim());
      currentChunk = currentChunk.substring(breakPoint);
    }
  }

  // Add the last chunk if there's anything left
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};
