import { Book, CourseModule, Quiz, QuizQuestion } from "@/types/book";

// Mock data storage
let books: Book[] = [
  {
    id: "1",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    coverUrl:
      "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=300&q=80",
    filePath: "/mock/path/psychology-money.pdf",
    uploadDate: new Date("2023-10-15"),
    progress: 35,
    courseGenerated: true,
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80",
    filePath: "/mock/path/atomic-habits.pdf",
    uploadDate: new Date("2023-11-20"),
    progress: 68,
    courseGenerated: true,
  },
];

let modules: CourseModule[] = [
  {
    id: "m1",
    bookId: "1",
    title: "Chapter 1: The Psychology of Money",
    content:
      "Money is not about intelligence, it's about behavior. And behavior is hard to teach, even to really smart people. A genius who loses control of their emotions can be a financial disaster. The opposite is also true. Ordinary folks with no financial education can be wealthy if they have a handful of behavioral skills that have nothing to do with formal measures of intelligence.",
    order: 1,
    completed: true,
  },
  {
    id: "m2",
    bookId: "1",
    title: "Chapter 2: Luck & Risk",
    content:
      'The line between "inspiringly bold" and "foolishly reckless" is thin. When we see someone taking a big risk and succeeding, we tend to focus on the success and overlook the risk. This creates a survivorship bias where we only see the winners, not the losers who took similar risks.',
    order: 2,
    completed: false,
  },
  {
    id: "m3",
    bookId: "2",
    title: "Chapter 1: The Surprising Power of Atomic Habits",
    content:
      "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous.",
    order: 1,
    completed: true,
  },
  {
    id: "m4",
    bookId: "2",
    title: "Chapter 2: How Habits Shape Your Identity",
    content:
      "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become. Your identity emerges out of your habits. Every action is a vote for the type of person you wish to become.",
    order: 2,
    completed: true,
  },
];

let quizzes: Quiz[] = [
  {
    id: "q1",
    moduleId: "m1",
    completed: true,
    score: 80,
    questions: [
      {
        id: "q1-1",
        question: "According to the author, what is money primarily about?",
        options: ["Intelligence", "Education", "Behavior", "Luck"],
        correctAnswer: 2,
        userAnswer: 2,
      },
      {
        id: "q1-2",
        question:
          "What can happen to a genius who loses control of their emotions?",
        options: [
          "They can still be financially successful",
          "They can be a financial disaster",
          "They will learn from their mistakes quickly",
          "Their intelligence will compensate for emotional mistakes",
        ],
        correctAnswer: 1,
        userAnswer: 1,
      },
    ],
  },
  {
    id: "q2",
    moduleId: "m3",
    completed: true,
    score: 100,
    questions: [
      {
        id: "q2-1",
        question: "What does the author compare habits to?",
        options: [
          "Lottery tickets",
          "Compound interest",
          "Insurance policies",
          "Stock investments",
        ],
        correctAnswer: 1,
        userAnswer: 1,
      },
      {
        id: "q2-2",
        question:
          "According to the text, what seems to make little difference on any given day?",
        options: ["Major life decisions", "One-time efforts", "Habits", "Luck"],
        correctAnswer: 2,
        userAnswer: 2,
      },
    ],
  },
];

// Getter functions
export const getBooks = (): Book[] => [...books];

export const getBook = (id: string): Book | undefined => {
  return books.find((book) => book.id === id);
};

export const getModulesByBook = (bookId: string): CourseModule[] => {
  return [...modules]
    .filter((module) => module.bookId === bookId)
    .sort((a, b) => a.order - b.order);
};

export const getModule = (id: string): CourseModule | undefined => {
  return modules.find((module) => module.id === id);
};

export const getQuizByModule = (moduleId: string): Quiz | undefined => {
  return quizzes.find((quiz) => quiz.moduleId === moduleId);
};

// Setter functions
export const addBook = (book: Book): void => {
  books.push(book);
};

export const updateBookProgress = (bookId: string, progress: number): void => {
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.progress = progress;
  }
};

export const addModule = (module: CourseModule): void => {
  modules.push(module);
};

export const markModuleComplete = (moduleId: string): void => {
  const module = modules.find((m) => m.id === moduleId);
  if (module) {
    module.completed = true;
  }
};

export const addQuiz = (quiz: Quiz): void => {
  quizzes.push(quiz);
};

export const updateQuiz = (
  quizId: string,
  updatedQuiz: Partial<Quiz>,
): void => {
  const index = quizzes.findIndex((q) => q.id === quizId);
  if (index !== -1) {
    quizzes[index] = { ...quizzes[index], ...updatedQuiz };
  }
};

export const submitQuizAnswer = (
  quizId: string,
  questionId: string,
  answerIndex: number,
): boolean => {
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) return false;

  const question = quiz.questions.find((q) => q.id === questionId);
  if (!question) return false;

  question.userAnswer = answerIndex;
  return question.correctAnswer === answerIndex;
};

export const calculateQuizScore = (quizId: string): number => {
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) return 0;

  const totalQuestions = quiz.questions.length;
  if (totalQuestions === 0) return 0;

  const correctAnswers = quiz.questions.filter(
    (q) => q.userAnswer !== undefined && q.userAnswer === q.correctAnswer,
  ).length;

  return Math.round((correctAnswers / totalQuestions) * 100);
};

export const addMultipleModules = (newModules: CourseModule[]): void => {
  modules = [...modules, ...newModules];
};

export const addMultipleQuizzes = (newQuizzes: Quiz[]): void => {
  quizzes = [...quizzes, ...newQuizzes];
};
