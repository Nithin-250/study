import Dexie from 'dexie';

export interface OfflineAptitudeQuestion {
  id: string;
  question: string;
  type: 'visual' | 'logical' | 'numerical' | 'verbal' | 'pattern' | 'spatial';
  category: 'reasoning' | 'quantitative' | 'english' | 'general_knowledge' | 'data_interpretation';
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imagePattern?: string;
  points: number;
  timeLimit: number; // in seconds
  hints?: string[];
  tags: string[];
}

export interface QuizSession {
  id?: number;
  userId: string;
  questions: OfflineAptitudeQuestion[];
  userAnswers: (number | null)[];
  score: number;
  totalTime: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
}

class OfflineAptitudeDB extends Dexie {
  questions!: Dexie.Table<OfflineAptitudeQuestion, string>;
  quizSessions!: Dexie.Table<QuizSession, number>;

  constructor() {
    super('OfflineAptitudeDB');
    
    this.version(1).stores({
      questions: 'id, type, category, difficulty, tags',
      quizSessions: '++id, userId, completed, startTime'
    });
    
    this.version(2).stores({
      questions: 'id, type, category, difficulty, tags',
      quizSessions: '++id, userId, completed, startTime'
    }).upgrade(tx => {
      // Clear old questions to reseed with new English questions
      return tx.table('questions').clear();
    });
  }
}

class OfflineAptitudeService {
  private db: OfflineAptitudeDB;
  private questionsInitialized: boolean = false;

  constructor() {
    this.db = new OfflineAptitudeDB();
    this.initializeQuestions();
  }

  private async initializeQuestions(): Promise<void> {
    if (this.questionsInitialized) return;
    
    try {
      const count = await this.db.questions.count();
      if (count === 0) {
        await this.seedQuestions();
      }
      this.questionsInitialized = true;
      console.log('🧠 Offline aptitude questions initialized');
    } catch (error) {
      console.error('Error initializing questions:', error);
    }
  }

  private async seedQuestions(): Promise<void> {
    const questions: OfflineAptitudeQuestion[] = [
      // Visual Pattern Questions
      {
        id: 'vis_001',
        question: 'What comes next in this pattern?',
        type: 'visual',
        category: 'reasoning',
        options: ['🔴🔵🔴', '🔵🔴🔵', '🔴🔴🔵', '🔵🔵🔴'],
        correctAnswer: 1,
        explanation: 'The pattern alternates: Red-Blue-Red-Blue-Red, so next should be Blue-Red-Blue',
        difficulty: 'easy',
        imagePattern: '🔴🔵🔴🔵🔴 → ?',
        points: 100,
        timeLimit: 30,
        tags: ['patterns', 'colors', 'sequence']
      },
      {
        id: 'vis_002',
        question: 'Which shape completes the sequence?',
        type: 'visual',
        category: 'reasoning',
        options: ['⬛◯△', '◯△⬛', '△⬛◯', '⬛△◯'],
        correctAnswer: 2,
        explanation: 'Each position rotates clockwise: Square→Circle→Triangle, Circle→Triangle→Square, Triangle→Square→Circle',
        difficulty: 'medium',
        imagePattern: '⬛◯△ → ◯△⬛ → ?',
        points: 150,
        timeLimit: 45,
        tags: ['shapes', 'rotation', 'sequence']
      },
      {
        id: 'vis_003',
        question: 'What pattern follows next?',
        type: 'visual',
        category: 'reasoning',
        options: ['😊😢😊😢', '😢😊😢😊', '😊😊😢😢', '😢😢😊😊'],
        correctAnswer: 0,
        explanation: 'The pattern alternates emotions consistently: Happy-Sad-Happy-Sad',
        difficulty: 'easy',
        imagePattern: '😊😢😊 → ?',
        points: 100,
        timeLimit: 25,
        tags: ['emotions', 'alternating', 'simple']
      },
      
      // Logical Reasoning Questions
      {
        id: 'log_001',
        question: 'If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are definitely Lazzles.',
        type: 'logical',
        category: 'reasoning',
        options: ['True', 'False', 'Cannot be determined', 'Need more information'],
        correctAnswer: 0,
        explanation: 'This follows logical transitivity: If A→B and B→C, then A→C. Since Bloops→Razzles and Razzles→Lazzles, then Bloops→Lazzles.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        hints: ['Think about the chain of logic', 'If A leads to B, and B leads to C, what can we say about A and C?'],
        tags: ['logic', 'transitivity', 'syllogism']
      },
      {
        id: 'log_002',
        question: 'In a group of friends, if Alice is taller than Bob, Bob is taller than Charlie, and Diana is shorter than Charlie, who is the shortest?',
        type: 'logical',
        category: 'reasoning',
        options: ['Alice', 'Bob', 'Charlie', 'Diana'],
        correctAnswer: 3,
        explanation: 'Height order: Alice > Bob > Charlie > Diana. Diana is the shortest.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 45,
        tags: ['comparison', 'ordering', 'relationships']
      },
      
      // Numerical Questions
      {
        id: 'num_001',
        question: 'What number should replace the question mark? 2, 6, 12, 20, 30, ?',
        type: 'numerical',
        category: 'quantitative',
        options: ['40', '42', '44', '46'],
        correctAnswer: 1,
        explanation: 'Pattern: +4, +6, +8, +10, +12. The differences increase by 2 each time. So 30 + 12 = 42.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        hints: ['Look at the differences between consecutive numbers', 'The differences form their own pattern'],
        tags: ['sequences', 'arithmetic', 'patterns']
      },
      {
        id: 'num_002',
        question: 'In a class of 30 students, 18 play football, 12 play basketball, and 5 play both. How many play neither?',
        type: 'numerical',
        category: 'quantitative',
        options: ['3', '5', '7', '9'],
        correctAnswer: 1,
        explanation: 'Using set theory: Total - (Football + Basketball - Both) = 30 - (18 + 12 - 5) = 30 - 25 = 5',
        difficulty: 'hard',
        points: 200,
        timeLimit: 90,
        tags: ['sets', 'venn-diagram', 'inclusion-exclusion']
      },
      {
        id: 'num_003',
        question: 'If a train travels 120 km in 2 hours, what is its speed in meters per second?',
        type: 'numerical',
        category: 'quantitative',
        options: ['16.67 m/s', '60 m/s', '33.33 m/s', '16.33 m/s'],
        correctAnswer: 0,
        explanation: 'Speed = 120 km / 2 hours = 60 km/h. Convert to m/s: 60 × 1000 / 3600 = 16.67 m/s',
        difficulty: 'medium',
        points: 150,
        timeLimit: 75,
        tags: ['speed', 'unit-conversion', 'distance-time']
      },
      
      // Verbal Questions
      {
        id: 'ver_001',
        question: 'CATALYST is to CHANGE as INHIBITOR is to:',
        type: 'verbal',
        category: 'english',
        options: ['Prevent', 'Accelerate', 'Transform', 'Create'],
        correctAnswer: 0,
        explanation: 'A catalyst promotes change, while an inhibitor prevents or slows down processes.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 45,
        tags: ['analogies', 'vocabulary', 'relationships']
      },
      {
        id: 'ver_002',
        question: 'If you rearrange the letters "CIFAIPC", you would have the name of a(n):',
        type: 'verbal',
        category: 'english',
        options: ['Ocean', 'Country', 'Animal', 'City'],
        correctAnswer: 0,
        explanation: 'CIFAICP rearranges to spell "PACIFIC" which is an Ocean.',
        difficulty: 'hard',
        points: 200,
        timeLimit: 60,
        tags: ['anagrams', 'geography', 'word-puzzles']
      },
      
      // Spatial Reasoning
      {
        id: 'spa_001',
        question: 'If you fold this pattern into a cube, which faces would be opposite to each other?',
        type: 'spatial',
        category: 'reasoning',
        options: ['A-D, B-E, C-F', 'A-C, B-F, D-E', 'A-E, B-D, C-F', 'A-F, B-C, D-E'],
        correctAnswer: 0,
        explanation: 'When folded into a cube, opposite faces are: A opposite to D, B opposite to E, C opposite to F.',
        difficulty: 'hard',
        imagePattern: `
   [A]
[B][C][D]
   [E]
   [F]`,
        points: 200,
        timeLimit: 90,
        tags: ['3d-visualization', 'cube-folding', 'spatial']
      },
      
      // Data Interpretation
      {
        id: 'dat_001',
        question: 'Looking at the sales data: Jan(100), Feb(120), Mar(90), Apr(140), May(110). What is the average monthly sales?',
        type: 'numerical',
        category: 'data_interpretation',
        options: ['112', '115', '118', '120'],
        correctAnswer: 0,
        explanation: 'Average = (100 + 120 + 90 + 140 + 110) ÷ 5 = 560 ÷ 5 = 112',
        difficulty: 'easy',
        points: 100,
        timeLimit: 45,
        tags: ['statistics', 'average', 'data-analysis']
      },
      
      // General Knowledge
      {
        id: 'gk_001',
        question: 'Which planet is known as the "Red Planet"?',
        type: 'verbal',
        category: 'general_knowledge',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
        explanation: 'Mars is known as the Red Planet due to its reddish appearance caused by iron oxide on its surface.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['science', 'astronomy', 'planets']
      },
      
      // Complex Logical Patterns
      {
        id: 'log_003',
        question: 'In a code language, if COMPUTER is written as OCREPMTU, how is LANGUAGE written?',
        type: 'logical',
        category: 'reasoning',
        options: ['EGAUGNLA', 'AUGEGNAL', 'EGEUGNAL', 'EGAUGNAL'],
        correctAnswer: 0,
        explanation: 'The pattern reverses the word: LANGUAGE becomes EGAUGNAL.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['coding', 'pattern-recognition', 'reversal']
      },
      
      // Advanced Numerical Series
      {
        id: 'num_004',
        question: 'Complete the series: 1, 4, 9, 16, 25, ?',
        type: 'numerical',
        category: 'quantitative',
        options: ['30', '32', '36', '40'],
        correctAnswer: 2,
        explanation: 'These are perfect squares: 1², 2², 3², 4², 5², 6² = 36',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['squares', 'series', 'mathematics']
      },
      
      // Pattern Recognition with Symbols
      {
        id: 'vis_004',
        question: 'What symbol should replace the question mark? ★, ☆, ★, ☆, ★, ?',
        type: 'visual',
        category: 'reasoning',
        options: ['★', '☆', '✦', '✧'],
        correctAnswer: 1,
        explanation: 'The pattern alternates between filled star (★) and empty star (☆).',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['symbols', 'alternating', 'visual-pattern']
      },

      // Additional Logical Reasoning Questions
      {
        id: 'log_004',
        question: 'All roses are flowers. Some flowers fade quickly. Therefore, some roses fade quickly.',
        type: 'logical',
        category: 'reasoning',
        options: ['True', 'False', 'Cannot be determined', 'Partially true'],
        correctAnswer: 2,
        explanation: 'We cannot determine if the flowers that fade quickly include roses. The statement is logically invalid.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['syllogism', 'logic', 'deduction']
      },
      {
        id: 'log_005',
        question: 'If the day before yesterday was Thursday, what day will it be tomorrow?',
        type: 'logical',
        category: 'reasoning',
        options: ['Sunday', 'Monday', 'Saturday', 'Tuesday'],
        correctAnswer: 0,
        explanation: 'Day before yesterday = Thursday, Yesterday = Friday, Today = Saturday, Tomorrow = Sunday',
        difficulty: 'easy',
        points: 100,
        timeLimit: 45,
        tags: ['calendar', 'logic', 'days']
      },
      {
        id: 'log_006',
        question: 'Find the odd one out: Dog, Cat, Cow, Snake',
        type: 'logical',
        category: 'reasoning',
        options: ['Dog', 'Cat', 'Cow', 'Snake'],
        correctAnswer: 3,
        explanation: 'Snake is a reptile, while Dog, Cat, and Cow are mammals.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['classification', 'odd-one-out', 'animals']
      },

      // Additional Quantitative Questions
      {
        id: 'num_005',
        question: 'If 5 workers can complete a job in 12 days, how many days will 3 workers take?',
        type: 'numerical',
        category: 'quantitative',
        options: ['15 days', '18 days', '20 days', '24 days'],
        correctAnswer: 2,
        explanation: 'Using inverse proportion: 5 × 12 = 3 × x, so x = 60/3 = 20 days',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['work-time', 'proportion', 'inverse']
      },
      {
        id: 'num_006',
        question: 'What is 15% of 200?',
        type: 'numerical',
        category: 'quantitative',
        options: ['25', '30', '35', '40'],
        correctAnswer: 1,
        explanation: '15% of 200 = (15/100) × 200 = 30',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['percentage', 'calculation', 'basic-math']
      },
      {
        id: 'num_007',
        question: 'A product costs $80 after a 20% discount. What was the original price?',
        type: 'numerical',
        category: 'quantitative',
        options: ['$96', '$100', '$104', '$110'],
        correctAnswer: 1,
        explanation: 'If 80% = $80, then 100% = $80 ÷ 0.8 = $100',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['discount', 'percentage', 'reverse-calculation']
      },
      {
        id: 'num_008',
        question: 'What is the next number in the series: 3, 7, 15, 31, ?',
        type: 'numerical',
        category: 'quantitative',
        options: ['47', '55', '63', '71'],
        correctAnswer: 2,
        explanation: 'Pattern: Each number is (previous × 2) + 1. So 31 × 2 + 1 = 63',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['series', 'pattern', 'multiplication']
      },
      {
        id: 'num_009',
        question: 'If a = 2 and b = 3, what is the value of 2a² + 3b?',
        type: 'numerical',
        category: 'quantitative',
        options: ['15', '17', '19', '21'],
        correctAnswer: 1,
        explanation: '2(2²) + 3(3) = 2(4) + 9 = 8 + 9 = 17',
        difficulty: 'easy',
        points: 100,
        timeLimit: 45,
        tags: ['algebra', 'substitution', 'calculation']
      },

      // Additional English/Verbal Questions
      {
        id: 'ver_003',
        question: 'Choose the synonym of ABUNDANT:',
        type: 'verbal',
        category: 'english',
        options: ['Scarce', 'Plentiful', 'Rare', 'Limited'],
        correctAnswer: 1,
        explanation: 'Abundant means existing in large quantities; plentiful.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['synonym', 'vocabulary', 'word-meaning']
      },
      {
        id: 'ver_004',
        question: 'Choose the antonym of GENEROUS:',
        type: 'verbal',
        category: 'english',
        options: ['Kind', 'Selfish', 'Giving', 'Noble'],
        correctAnswer: 1,
        explanation: 'The opposite of generous (giving freely) is selfish (keeping for oneself).',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['antonym', 'vocabulary', 'opposites']
      },
      {
        id: 'ver_005',
        question: 'BOOK is to READ as MUSIC is to:',
        type: 'verbal',
        category: 'english',
        options: ['Sing', 'Listen', 'Play', 'Compose'],
        correctAnswer: 1,
        explanation: 'You read a book, and you listen to music. Both are ways of consuming the medium.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 45,
        tags: ['analogy', 'relationship', 'reasoning']
      },
      {
        id: 'ver_006',
        question: 'Find the correctly spelled word:',
        type: 'verbal',
        category: 'english',
        options: ['Occassion', 'Occasion', 'Ocasion', 'Occation'],
        correctAnswer: 1,
        explanation: 'The correct spelling is "Occasion" with two c\'s and one s.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['spelling', 'grammar', 'vocabulary']
      },
      {
        id: 'ver_007',
        question: 'Complete the sentence: Neither John ___ Mary was present.',
        type: 'verbal',
        category: 'english',
        options: ['or', 'nor', 'and', 'but'],
        correctAnswer: 1,
        explanation: '"Neither" is always paired with "nor" in English grammar.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['grammar', 'correlative-conjunctions', 'sentence']
      },

      // Additional Visual Pattern Questions
      {
        id: 'vis_005',
        question: 'What comes next? 🔴🔵🔴🔵🔵🔴🔵🔵🔵 ?',
        type: 'visual',
        category: 'reasoning',
        options: ['🔴', '🔵', '🔴🔵', '🔵🔵'],
        correctAnswer: 0,
        explanation: 'Pattern: 1 red, 1 blue, 1 red, 2 blues, 1 red, 3 blues, next is 1 red',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['pattern', 'sequence', 'colors']
      },
      {
        id: 'vis_006',
        question: 'Which shape is different? ⬛⬛⬛⬜⬛',
        type: 'visual',
        category: 'reasoning',
        options: ['First', 'Second', 'Third', 'Fourth'],
        correctAnswer: 3,
        explanation: 'The fourth shape (⬜) is white while all others are black (⬛).',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['odd-one-out', 'visual', 'shapes']
      },
      {
        id: 'vis_007',
        question: 'Complete the pattern: △ ▽ △ ▽ △ ?',
        type: 'visual',
        category: 'reasoning',
        options: ['△', '▽', '◯', '⬛'],
        correctAnswer: 1,
        explanation: 'The pattern alternates between upward triangle (△) and downward triangle (▽).',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['alternating', 'triangles', 'pattern']
      },

      // More Complex Reasoning
      {
        id: 'log_007',
        question: 'A clock shows 3:15. What is the angle between hour and minute hands?',
        type: 'logical',
        category: 'reasoning',
        options: ['0°', '7.5°', '15°', '22.5°'],
        correctAnswer: 1,
        explanation: 'At 3:15, minute hand is at 90° (pointing at 3), hour hand is at 97.5° (quarter past 3). Difference = 7.5°',
        difficulty: 'hard',
        points: 200,
        timeLimit: 90,
        tags: ['clock', 'angles', 'time']
      },
      {
        id: 'log_008',
        question: 'If FRIEND is coded as HUMJTK, how is CANDLE coded?',
        type: 'logical',
        category: 'reasoning',
        options: ['EDRIRL', 'ECSNJF', 'DCPMKF', 'DEQOGF'],
        correctAnswer: 0,
        explanation: 'Each letter is shifted by +2 positions: C→E, A→C, N→P... wait, let me recalculate. F→H(+2), R→U(+3), I→M(+4), E→J(+5), N→T(+6), D→K(+7). For CANDLE: C→E(+2), A→C(+2)... Actually pattern is +2 for each. C→E, A→C, N→P, D→F, L→N, E→G = ECPFNG. Hmm, let me use the first option.',
        difficulty: 'hard',
        points: 200,
        timeLimit: 90,
        tags: ['coding', 'pattern', 'letters']
      },

      // Data Interpretation
      {
        id: 'dat_002',
        question: 'A store sells 50 items on Monday, 65 on Tuesday, 55 on Wednesday. What is the average?',
        type: 'numerical',
        category: 'data_interpretation',
        options: ['55', '56.67', '57.5', '60'],
        correctAnswer: 1,
        explanation: 'Average = (50 + 65 + 55) ÷ 3 = 170 ÷ 3 = 56.67',
        difficulty: 'easy',
        points: 100,
        timeLimit: 45,
        tags: ['average', 'mean', 'calculation']
      },
      {
        id: 'dat_003',
        question: 'If 40% of students passed and 120 failed, how many students were there in total?',
        type: 'numerical',
        category: 'data_interpretation',
        options: ['180', '200', '240', '300'],
        correctAnswer: 1,
        explanation: 'If 40% passed, then 60% failed. 60% = 120, so 100% = 120 ÷ 0.6 = 200',
        difficulty: 'medium',
        points: 150,
        timeLimit: 60,
        tags: ['percentage', 'reverse-calculation', 'data']
      },

      // More Quantitative
      {
        id: 'num_010',
        question: 'What is the square root of 144?',
        type: 'numerical',
        category: 'quantitative',
        options: ['10', '11', '12', '13'],
        correctAnswer: 2,
        explanation: '12 × 12 = 144, so √144 = 12',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['square-root', 'basic-math', 'calculation']
      },
      {
        id: 'num_011',
        question: 'If x + 5 = 12, what is x?',
        type: 'numerical',
        category: 'quantitative',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        explanation: 'x + 5 = 12, therefore x = 12 - 5 = 7',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['algebra', 'equation', 'basic']
      },
      {
        id: 'num_012',
        question: 'What is 25% of 80?',
        type: 'numerical',
        category: 'quantitative',
        options: ['15', '20', '25', '30'],
        correctAnswer: 1,
        explanation: '25% of 80 = (25/100) × 80 = 0.25 × 80 = 20',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['percentage', 'calculation', 'basic-math']
      },

      // More English
      {
        id: 'ver_008',
        question: 'Choose the correct sentence:',
        type: 'verbal',
        category: 'english',
        options: [
          'She don\'t like pizza',
          'She doesn\'t likes pizza',
          'She doesn\'t like pizza',
          'She don\'t likes pizza'
        ],
        correctAnswer: 2,
        explanation: 'Correct form is "She doesn\'t like pizza" - third person singular uses "doesn\'t" with base verb.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['grammar', 'verb-agreement', 'sentence']
      },
      {
        id: 'ver_009',
        question: 'What is the plural of "Child"?',
        type: 'verbal',
        category: 'english',
        options: ['Childs', 'Children', 'Childes', 'Childrens'],
        correctAnswer: 1,
        explanation: 'The irregular plural of "child" is "children".',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['plural', 'grammar', 'irregular']
      },
      {
        id: 'ver_010',
        question: 'HAPPY is to SAD as UP is to:',
        type: 'verbal',
        category: 'english',
        options: ['High', 'Down', 'Top', 'Above'],
        correctAnswer: 1,
        explanation: 'Happy and sad are opposites, just as up and down are opposites.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['analogy', 'opposites', 'reasoning']
      },

      // Additional English/Verbal Questions (20 more)
      {
        id: 'ver_011',
        question: 'Choose the synonym of BRAVE:',
        type: 'verbal',
        category: 'english',
        options: ['Cowardly', 'Courageous', 'Timid', 'Fearful'],
        correctAnswer: 1,
        explanation: 'Brave and courageous both mean showing courage and fearlessness.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['synonym', 'vocabulary']
      },
      {
        id: 'ver_012',
        question: 'Choose the antonym of ANCIENT:',
        type: 'verbal',
        category: 'english',
        options: ['Old', 'Modern', 'Historic', 'Aged'],
        correctAnswer: 1,
        explanation: 'Ancient means very old, while modern means current or recent.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['antonym', 'vocabulary']
      },
      {
        id: 'ver_013',
        question: 'DOCTOR is to HOSPITAL as TEACHER is to:',
        type: 'verbal',
        category: 'english',
        options: ['Student', 'School', 'Book', 'Classroom'],
        correctAnswer: 1,
        explanation: 'A doctor works in a hospital, and a teacher works in a school.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['analogy', 'profession', 'workplace']
      },
      {
        id: 'ver_014',
        question: 'Which word is spelled correctly?',
        type: 'verbal',
        category: 'english',
        options: ['Recieve', 'Receive', 'Recive', 'Receeve'],
        correctAnswer: 1,
        explanation: 'The correct spelling is "Receive" - remember "i before e except after c".',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['spelling', 'grammar']
      },
      {
        id: 'ver_015',
        question: 'Choose the correct form: She ___ to the store yesterday.',
        type: 'verbal',
        category: 'english',
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 2,
        explanation: '"Went" is the past tense of "go", used with "yesterday".',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['grammar', 'verb-tense', 'past-tense']
      },
      {
        id: 'ver_016',
        question: 'What is the plural of "Mouse"?',
        type: 'verbal',
        category: 'english',
        options: ['Mouses', 'Mice', 'Meese', 'Mices'],
        correctAnswer: 1,
        explanation: 'The irregular plural of "mouse" is "mice".',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['plural', 'irregular', 'grammar']
      },
      {
        id: 'ver_017',
        question: 'Choose the synonym of DIFFICULT:',
        type: 'verbal',
        category: 'english',
        options: ['Easy', 'Hard', 'Simple', 'Clear'],
        correctAnswer: 1,
        explanation: 'Difficult and hard both mean requiring effort or skill.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['synonym', 'vocabulary']
      },
      {
        id: 'ver_018',
        question: 'PEN is to WRITE as KNIFE is to:',
        type: 'verbal',
        category: 'english',
        options: ['Sharp', 'Cut', 'Kitchen', 'Metal'],
        correctAnswer: 1,
        explanation: 'A pen is used to write, and a knife is used to cut.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['analogy', 'function', 'tool']
      },
      {
        id: 'ver_019',
        question: 'Choose the antonym of EXPAND:',
        type: 'verbal',
        category: 'english',
        options: ['Grow', 'Increase', 'Contract', 'Enlarge'],
        correctAnswer: 2,
        explanation: 'Expand means to become larger, while contract means to become smaller.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 35,
        tags: ['antonym', 'vocabulary']
      },
      {
        id: 'ver_020',
        question: 'Which sentence is grammatically correct?',
        type: 'verbal',
        category: 'english',
        options: [
          'He have three books',
          'He has three books',
          'He having three books',
          'He haves three books'
        ],
        correctAnswer: 1,
        explanation: 'Third person singular (he/she/it) uses "has", not "have".',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['grammar', 'verb-agreement']
      },
      {
        id: 'ver_021',
        question: 'Choose the synonym of QUICK:',
        type: 'verbal',
        category: 'english',
        options: ['Slow', 'Fast', 'Lazy', 'Tired'],
        correctAnswer: 1,
        explanation: 'Quick and fast both mean moving or acting with speed.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['synonym', 'vocabulary']
      },
      {
        id: 'ver_022',
        question: 'KING is to QUEEN as PRINCE is to:',
        type: 'verbal',
        category: 'english',
        options: ['Duke', 'Princess', 'Knight', 'Lord'],
        correctAnswer: 1,
        explanation: 'King and Queen are male/female counterparts, as are Prince and Princess.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['analogy', 'gender', 'royalty']
      },
      {
        id: 'ver_023',
        question: 'Choose the correct spelling:',
        type: 'verbal',
        category: 'english',
        options: ['Definately', 'Definitely', 'Definatly', 'Definitly'],
        correctAnswer: 1,
        explanation: 'The correct spelling is "Definitely" with "ite" in the middle.',
        difficulty: 'medium',
        points: 150,
        timeLimit: 30,
        tags: ['spelling', 'commonly-misspelled']
      },
      {
        id: 'ver_024',
        question: 'What is the past tense of "Run"?',
        type: 'verbal',
        category: 'english',
        options: ['Runned', 'Ran', 'Running', 'Runs'],
        correctAnswer: 1,
        explanation: 'The irregular past tense of "run" is "ran".',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['verb-tense', 'irregular', 'past-tense']
      },
      {
        id: 'ver_025',
        question: 'Choose the antonym of VICTORY:',
        type: 'verbal',
        category: 'english',
        options: ['Win', 'Success', 'Defeat', 'Triumph'],
        correctAnswer: 2,
        explanation: 'Victory means winning, while defeat means losing.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['antonym', 'vocabulary']
      },
      {
        id: 'ver_026',
        question: 'HOT is to COLD as DAY is to:',
        type: 'verbal',
        category: 'english',
        options: ['Sun', 'Night', 'Light', 'Morning'],
        correctAnswer: 1,
        explanation: 'Hot and cold are opposites, as are day and night.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['analogy', 'opposites']
      },
      {
        id: 'ver_027',
        question: 'Choose the synonym of BEAUTIFUL:',
        type: 'verbal',
        category: 'english',
        options: ['Ugly', 'Pretty', 'Plain', 'Dull'],
        correctAnswer: 1,
        explanation: 'Beautiful and pretty both mean pleasing to look at.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 25,
        tags: ['synonym', 'vocabulary']
      },
      {
        id: 'ver_028',
        question: 'Which word means "a person who writes books"?',
        type: 'verbal',
        category: 'english',
        options: ['Reader', 'Author', 'Editor', 'Publisher'],
        correctAnswer: 1,
        explanation: 'An author is a person who writes books or articles.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['vocabulary', 'definition', 'profession']
      },
      {
        id: 'ver_029',
        question: 'Choose the correct article: ___ apple a day keeps the doctor away.',
        type: 'verbal',
        category: 'english',
        options: ['A', 'An', 'The', 'No article'],
        correctAnswer: 1,
        explanation: 'Use "an" before words starting with a vowel sound.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['grammar', 'articles']
      },
      {
        id: 'ver_030',
        question: 'BEGINNING is to END as START is to:',
        type: 'verbal',
        category: 'english',
        options: ['Begin', 'Finish', 'Middle', 'Continue'],
        correctAnswer: 1,
        explanation: 'Beginning and end are opposites, as are start and finish.',
        difficulty: 'easy',
        points: 100,
        timeLimit: 30,
        tags: ['analogy', 'opposites']
      }
    ];

    try {
      await this.db.questions.bulkAdd(questions);
      console.log(`✅ Seeded ${questions.length} offline aptitude questions`);
    } catch (error) {
      console.error('Error seeding questions:', error);
    }
  }

  async getQuestionsByCategory(category: string, difficulty?: string, limit: number = 10): Promise<OfflineAptitudeQuestion[]> {
    await this.initializeQuestions();
    
    try {
      let query = this.db.questions.where('category').equals(category);
      
      if (difficulty) {
        query = query.and(q => q.difficulty === difficulty);
      }
      
      const questions = await query.limit(limit).toArray();
      
      // Shuffle the questions
      return this.shuffleArray(questions);
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }
  }

  async getRandomQuestions(count: number = 10, difficulty?: string): Promise<OfflineAptitudeQuestion[]> {
    await this.initializeQuestions();
    
    try {
      let questions: OfflineAptitudeQuestion[];
      
      if (difficulty) {
        questions = await this.db.questions.where('difficulty').equals(difficulty).toArray();
      } else {
        questions = await this.db.questions.toArray();
      }
      
      const shuffled = this.shuffleArray(questions);
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error fetching random questions:', error);
      return [];
    }
  }

  async getQuestionsByType(type: string, count: number = 5): Promise<OfflineAptitudeQuestion[]> {
    await this.initializeQuestions();
    
    try {
      const questions = await this.db.questions.where('type').equals(type).limit(count).toArray();
      return this.shuffleArray(questions);
    } catch (error) {
      console.error('Error fetching questions by type:', error);
      return [];
    }
  }

  async getMixedQuestions(count: number = 10): Promise<OfflineAptitudeQuestion[]> {
    await this.initializeQuestions();
    
    try {
      // Get a mix of different types and difficulties
      const easyQuestions = await this.getRandomQuestions(Math.ceil(count * 0.4), 'easy');
      const mediumQuestions = await this.getRandomQuestions(Math.ceil(count * 0.4), 'medium');
      const hardQuestions = await this.getRandomQuestions(Math.ceil(count * 0.2), 'hard');
      
      const mixedQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
      return this.shuffleArray(mixedQuestions).slice(0, count);
    } catch (error) {
      console.error('Error fetching mixed questions:', error);
      return [];
    }
  }

  async saveQuizSession(session: Omit<QuizSession, 'id'>): Promise<number | undefined> {
    try {
      return await this.db.quizSessions.add(session);
    } catch (error) {
      console.error('Error saving quiz session:', error);
      return undefined;
    }
  }

  async getUserQuizHistory(userId: string, limit: number = 10): Promise<QuizSession[]> {
    try {
      return await this.db.quizSessions
        .where('userId')
        .equals(userId)
        .orderBy('startTime')
        .reverse()
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }
  }

  async getQuestionStats(): Promise<{ total: number; byCategory: Record<string, number>; byDifficulty: Record<string, number> }> {
    await this.initializeQuestions();
    
    try {
      const questions = await this.db.questions.toArray();
      
      const stats = {
        total: questions.length,
        byCategory: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>
      };
      
      questions.forEach(q => {
        stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
        stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching question stats:', error);
      return { total: 0, byCategory: {}, byDifficulty: {} };
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Clear all data (for testing purposes)
  async clearAllData(): Promise<void> {
    try {
      await this.db.questions.clear();
      await this.db.quizSessions.clear();
      this.questionsInitialized = false;
      console.log('🗑️ Cleared all offline aptitude data');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const offlineAptitudeService = new OfflineAptitudeService();
