export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  filePath: string;
  uploadDate: Date;
  progress?: number;
  totalPages?: number;
  currentPage?: number;
  courseGenerated?: boolean;
}

export interface CourseModule {
  id: string;
  bookId: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
}

export interface Quiz {
  id: string;
  moduleId: string;
  questions: QuizQuestion[];
  completed: boolean;
  score?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  userAnswer?: number; // Index of user's answer
  explanation?: string;
}
