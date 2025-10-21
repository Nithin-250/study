const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || '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';
const TAVILY_BASE_URL = 'https://api.tavily.com/search';

console.log('🔑 Tavily API initialized with key:', TAVILY_API_KEY ? TAVILY_API_KEY.substring(0, 20) + '...' : 'NOT FOUND');

export interface FlashCard {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizCard {
  question: string;
  type: 'true_false' | 'multiple_choice';
  options?: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyMaterial {
  topic: string;
  flashcards: FlashCard[];
  quizQuestions: QuizCard[];
  summary: string;
  audioSummary?: string;
  sources?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilyResponse {
  query: string;
  follow_up_questions?: string[];
  answer: string;
  images?: string[];
  results: TavilySearchResult[];
  response_time: number;
}

class TavilyService {
  async searchTopic(topic: string): Promise<TavilyResponse> {
    console.log('🔍 Starting Tavily search for topic:', topic);
    
    try {
      if (!TAVILY_API_KEY || TAVILY_API_KEY === 'your_tavily_api_key_here') {
        console.error('❌ No valid Tavily API key found');
        throw new Error('Tavily API key not properly configured');
      }

      const searchQuery = `${topic} education learning guide comprehensive overview benefits applications`;
      
      const response = await fetch(TAVILY_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TAVILY_API_KEY}`
        },
        body: JSON.stringify({
          query: searchQuery,
          search_depth: "advanced",
          include_answer: true,
          include_images: false,
          include_raw_content: false,
          max_results: 8,
          include_domains: [],
          exclude_domains: []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Tavily API Error:', response.status, errorText);
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
      }

      const data: TavilyResponse = await response.json();
      console.log('✅ Tavily search completed:', data.results.length, 'results found');
      console.log('📋 Answer summary:', data.answer?.substring(0, 150) + '...');
      
      return data;
    } catch (error) {
      console.error('❌ Tavily search error:', error);
      throw error;
    }
  }

  async generateFlashcards(topic: string, content?: string): Promise<StudyMaterial> {
    console.log('🎯 Starting Tavily-based flashcard generation for topic:', topic);
    
    try {
      // Get research data from Tavily
      const searchData = await this.searchTopic(topic);
      
      // Extract key information from search results
      const researchContent = this.extractKeyInformation(searchData);
      
      // Generate flashcards from research content
      const flashcards = this.generateFlashcardsFromContent(topic, researchContent);
      
      // Generate diverse quiz questions
      const quizQuestions = this.generateDiverseQuizQuestions(topic, researchContent, searchData);
      
      // Create comprehensive summary
      const summary = this.createSummaryFromResearch(topic, searchData);
      
      const studyMaterial: StudyMaterial = {
        topic,
        flashcards,
        quizQuestions,
        summary,
        sources: searchData.results.slice(0, 5).map(r => r.url)
      };

      console.log('✅ Successfully generated', studyMaterial.flashcards.length, 'Tavily-powered flashcards for:', topic);
      console.log('🎮 Generated', studyMaterial.quizQuestions.length, 'diverse quiz questions with game elements');
      console.log('📋 Sample question:', studyMaterial.flashcards[0]?.question);
      
      return studyMaterial;

    } catch (error) {
      console.error('❌ Tavily Service Error for topic "' + topic + '":', error);
      console.log('🔄 Using enhanced fallback content for:', topic);
      
      return this.generateFallbackContent(topic);
    }
  }

  private extractKeyInformation(searchData: TavilyResponse): string {
    let content = searchData.answer || '';
    
    // Add content from top search results
    searchData.results.slice(0, 5).forEach(result => {
      content += `\n\n${result.title}\n${result.content}`;
    });
    
    return content.substring(0, 4000); // Increased content length for better analysis
  }

  private generateFlashcardsFromContent(topic: string, content: string): FlashCard[] {
    const flashcards: FlashCard[] = [];
    
    // Extract key concepts and create flashcards
    const keywords = this.extractKeywords(topic, content);
    const definitions = this.extractDefinitions(content);
    const benefits = this.extractBenefits(topic, content);
    const factualInfo = this.extractFactualInformation(topic, content);
    const howToInfo = this.extractHowToInformation(topic, content);
    
    // Create definition-based flashcards
    definitions.forEach(def => {
      if (flashcards.length < 8) {
        flashcards.push({
          question: `What is ${def.term}${topic ? ` in relation to ${topic}` : ''}?`,
          answer: def.definition + (topic ? ` This concept is particularly important in ${topic} because it forms a foundation for understanding the subject.` : ''),
          difficulty: 'easy'
        });
      }
    });
    
    // Create factual information flashcards
    factualInfo.forEach(fact => {
      if (flashcards.length < 8) {
        flashcards.push({
          question: fact.question,
          answer: fact.answer,
          difficulty: 'medium'
        });
      }
    });
    
    // Create how-to/process flashcards
    howToInfo.forEach(howTo => {
      if (flashcards.length < 8) {
        flashcards.push({
          question: howTo.question,
          answer: howTo.answer,
          difficulty: 'hard'
        });
      }
    });
    
    // Create benefit/application flashcards
    benefits.forEach(benefit => {
      if (flashcards.length < 8) {
        flashcards.push({
          question: `How can understanding ${topic} help in ${benefit.context}?`,
          answer: benefit.explanation,
          difficulty: 'medium'
        });
      }
    });
    
    // Create topic-specific fundamental questions
    if (flashcards.length < 8) {
      const fundamentalQuestions = this.generateFundamentalQuestions(topic, content, keywords);
      fundamentalQuestions.forEach(q => {
        if (flashcards.length < 8) {
          flashcards.push(q);
        }
      });
    }
    
    // Add empowerment-focused flashcards if still needed
    if (flashcards.length < 8) {
      flashcards.push({
        question: `How can mastering ${topic} contribute to personal and professional growth?`,
        answer: `Mastering ${topic} provides specialized knowledge that builds confidence, enhances problem-solving abilities, and creates new opportunities. It enables individuals to make informed decisions and contribute meaningfully in their field of work or study.`,
        difficulty: 'hard'
      });
    }

    // Fill remaining slots with topic-specific questions from keywords
    while (flashcards.length < 8 && keywords.length > 0) {
      const keyword = keywords[flashcards.length % keywords.length];
      const conceptQuestion = this.generateConceptQuestion(topic, keyword, content);
      flashcards.push(conceptQuestion);
    }
    
    // Ensure we have at least 6 flashcards with final fallbacks
    while (flashcards.length < 6) {
      flashcards.push({
        question: `What are the main components or aspects of ${topic}?`,
        answer: `${topic} consists of several key components that work together to form a comprehensive understanding of the subject. These include theoretical foundations, practical applications, and real-world implementations.`,
        difficulty: 'medium'
      });
    }
    
    return flashcards.slice(0, 8);
  }

  private generateDiverseQuizQuestions(topic: string, content: string, searchData: TavilyResponse): QuizCard[] {
    console.log('🎯 Generating diverse quiz questions for:', topic);
    const quizQuestions: QuizCard[] = [];
    const keywords = this.extractKeywords(topic, content);
    const topicSpecificFacts = this.extractTopicSpecificFacts(topic, content, searchData);
    
    console.log('📊 Keywords extracted:', keywords);
    console.log('📊 Facts extracted:', topicSpecificFacts.length);
    
    // Generate more topic-specific True/False questions (3 questions)
    const trueFalseQuestions = this.generateTopicSpecificTrueFalse(topic, content, topicSpecificFacts);
    trueFalseQuestions.slice(0, 3).forEach(q => quizQuestions.push(q));
    
    // Generate more topic-specific Multiple Choice questions (5 questions) 
    const mcqQuestions = this.generateTopicSpecificMCQ(topic, content, keywords, topicSpecificFacts);
    mcqQuestions.slice(0, 5).forEach(q => quizQuestions.push(q));
    
    // Generate additional MCQs based on different aspects
    const additionalMCQs = this.generateAdditionalMCQs(topic, content, keywords);
    additionalMCQs.forEach(q => quizQuestions.push(q));
    
    console.log('✅ Generated total quiz questions:', quizQuestions.length);
    console.log('📋 Sample question:', quizQuestions[0]);
    
    return quizQuestions;
  }

  private generateMatchingPairs(topic: string, keywords: string[]): { left: string; right: string }[] {
    const concepts = keywords.slice(0, 4);
    const descriptions = [
      'Core foundation of the subject',
      'Practical application method',
      'Key benefit for career growth',
      'Essential skill for success'
    ];
    
    // If not enough keywords, use generic concepts
    const defaultConcepts = ['Theory', 'Practice', 'Application', 'Mastery'];
    const conceptsToUse = concepts.length >= 4 ? concepts : defaultConcepts;
    
    return conceptsToUse.map((concept, index) => ({
      left: concept.charAt(0).toUpperCase() + concept.slice(1),
      right: descriptions[index] || 'Important concept'
    }));
  }

  private generateProcessSteps(topic: string): string[] {
    const topicLower = topic.toLowerCase();
    
    // Technology/Programming topics
    if (topicLower.includes('programming') || topicLower.includes('software') || topicLower.includes('coding')) {
      return [
        'Learn syntax and basic concepts',
        'Practice with simple projects',
        'Build complex applications',
        'Master advanced patterns and optimization'
      ];
    }
    
    // Business topics
    else if (topicLower.includes('business') || topicLower.includes('management') || topicLower.includes('entrepreneurship')) {
      return [
        'Research market and opportunities',
        'Develop business plan and strategy',
        'Implement and launch initiatives',
        'Scale and optimize operations'
      ];
    }
    
    // Science topics
    else if (topicLower.includes('science') || topicLower.includes('research')) {
      return [
        'Form hypothesis and research questions',
        'Design and conduct experiments',
        'Analyze data and results',
        'Draw conclusions and peer review'
      ];
    }
    
    // Learning/Education topics
    else if (topicLower.includes('learning') || topicLower.includes('education') || topicLower.includes('study')) {
      return [
        'Assess current knowledge level',
        'Study fundamental concepts',
        'Practice and apply knowledge',
        'Test understanding and reinforce learning'
      ];
    }
    
    // Default general steps
    else {
      return [
        'Research and understand fundamentals',
        'Practice basic concepts',
        'Apply knowledge in real scenarios',
        'Refine and master advanced techniques'
      ];
    }
  }

  private generateLearningMilestones(topic: string): { event: string; year: string; order: number }[] {
    return [
      { event: 'Basic understanding', year: 'Foundation', order: 1 },
      { event: 'Intermediate skills', year: 'Development', order: 2 },
      { event: 'Advanced concepts', year: 'Specialization', order: 3 },
      { event: 'Expert-level application', year: 'Mastery', order: 4 }
    ];
  }

  private getAssociatedWords(topic: string): string[] {
    const baseWords = ['knowledge', 'skills', 'growth', 'empowerment'];
    const topicLower = topic.toLowerCase();
    
    let topicSpecific: string[] = [];
    
    // Technology topics
    if (topicLower.includes('technology') || topicLower.includes('programming') || topicLower.includes('software') || topicLower.includes('computer')) {
      topicSpecific = ['innovation', 'digital', 'automation', 'efficiency', 'development', 'coding'];
    }
    // Business topics
    else if (topicLower.includes('business') || topicLower.includes('management') || topicLower.includes('leadership') || topicLower.includes('entrepreneur')) {
      topicSpecific = ['management', 'strategy', 'vision', 'influence', 'planning', 'innovation'];
    }
    // Finance topics
    else if (topicLower.includes('finance') || topicLower.includes('economics') || topicLower.includes('money') || topicLower.includes('banking')) {
      topicSpecific = ['investment', 'planning', 'budgeting', 'analysis', 'wealth', 'markets'];
    }
    // Science topics
    else if (topicLower.includes('science') || topicLower.includes('research') || topicLower.includes('physics') || topicLower.includes('chemistry') || topicLower.includes('biology')) {
      topicSpecific = ['research', 'experiment', 'analysis', 'discovery', 'theory', 'evidence'];
    }
    // Health topics
    else if (topicLower.includes('health') || topicLower.includes('medicine') || topicLower.includes('medical') || topicLower.includes('nutrition')) {
      topicSpecific = ['wellness', 'treatment', 'prevention', 'diagnosis', 'care', 'healing'];
    }
    // History topics
    else if (topicLower.includes('history') || topicLower.includes('historical')) {
      topicSpecific = ['events', 'timeline', 'culture', 'civilization', 'heritage', 'legacy'];
    }
    // Art topics
    else if (topicLower.includes('art') || topicLower.includes('design') || topicLower.includes('creative')) {
      topicSpecific = ['creativity', 'expression', 'aesthetic', 'design', 'visual', 'artistic'];
    }
    // Education topics
    else if (topicLower.includes('education') || topicLower.includes('learning') || topicLower.includes('teaching')) {
      topicSpecific = ['teaching', 'curriculum', 'pedagogy', 'instruction', 'assessment', 'academic'];
    }
    // Default for other topics
    else {
      topicSpecific = ['learning', 'development', 'improvement', 'expertise', 'mastery', 'understanding'];
    }
    
    return [...baseWords, ...topicSpecific];
  }

  private generatePatternMatchingData(topic: string, keywords: string[]) {
    const topicLower = topic.toLowerCase();
    
    // Generate learning progression pattern (correct)
    const correctPattern = 'ABC123';
    const patterns = [
      { id: correctPattern, pattern: correctPattern, color: '#10b981' },
      { id: 'XYZ789', pattern: 'XYZ789', color: '#ef4444' },
      { id: 'DEF456', pattern: 'DEF456', color: '#3b82f6' },
      { id: 'GHI012', pattern: 'GHI012', color: '#f59e0b' }
    ];
    
    // Generate component pattern (for second question)
    let componentPattern = 'Core123';
    if (topicLower.includes('technology') || topicLower.includes('programming')) {
      componentPattern = 'Code456';
    } else if (topicLower.includes('business') || topicLower.includes('management')) {
      componentPattern = 'Biz789';
    } else if (topicLower.includes('science') || topicLower.includes('research')) {
      componentPattern = 'Sci012';
    }
    
    const componentPatterns = [
      { id: componentPattern, pattern: componentPattern, color: '#8b5cf6' },
      { id: 'Wrong1', pattern: 'Wrong1', color: '#64748b' },
      { id: 'Wrong2', pattern: 'Wrong2', color: '#dc2626' },
      { id: 'Wrong3', pattern: 'Wrong3', color: '#ea580c' }
    ];
    
    return {
      correctPattern,
      patterns,
      componentPattern,
      componentPatterns
    };
  }

  private getDistractorWords(): string[] {
    return ['distraction', 'irrelevant', 'outdated', 'unnecessary'];
  }

  private extractKeywords(topic: string, content: string): string[] {
    const words = content.toLowerCase().split(/\W+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'they', 'them', 'their', 'there', 'then', 'than', 'from', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among']);
    
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .reduce((acc: {[key: string]: number}, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    
    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 12)
      .map(([word]) => word);
  }

  private extractDefinitions(content: string): { term: string; definition: string }[] {
    const definitions: { term: string; definition: string }[] = [];
    
    // Enhanced pattern matching for definitions
    const definitionPatterns = [
      /(\w+) is defined as ([^.!?]+)/gi,
      /(\w+) refers to ([^.!?]+)/gi,
      /(\w+) means ([^.!?]+)/gi,
      /(\w+) can be described as ([^.!?]+)/gi,
      /(\w+):\s*([^.!?\n]+)/gi,
      /(\w+) is a ([^.!?]+)/gi,
      /(\w+) involves ([^.!?]+)/gi
    ];
    
    definitionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null && definitions.length < 5) {
        if (match[1].length > 2 && match[2].length > 10) {
          definitions.push({
            term: match[1],
            definition: match[2].trim()
          });
        }
      }
    });
    
    return definitions;
  }

  private extractFactualInformation(topic: string, content: string): { question: string; answer: string }[] {
    const facts: { question: string; answer: string }[] = [];
    
    // Extract sentences that contain factual information
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for statistical information
    const statPattern = /(\d+%|\d+,\d+|\d+ percent|\d+ million|\d+ billion)/gi;
    sentences.forEach(sentence => {
      if (statPattern.test(sentence) && facts.length < 3) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.toLowerCase().includes(topic.toLowerCase())) {
          facts.push({
            question: `What is a key statistic or fact about ${topic}?`,
            answer: cleanSentence + '.' 
          });
        }
      }
    });
    
    // Look for year-based information
    const yearPattern = /in \d{4}|since \d{4}|by \d{4}/gi;
    sentences.forEach(sentence => {
      if (yearPattern.test(sentence) && facts.length < 3) {
        const cleanSentence = sentence.trim();
        if (cleanSentence.toLowerCase().includes(topic.toLowerCase())) {
          facts.push({
            question: `When did something significant happen related to ${topic}?`,
            answer: cleanSentence + '.'
          });
        }
      }
    });
    
    return facts;
  }

  private extractHowToInformation(topic: string, content: string): { question: string; answer: string }[] {
    const howToInfo: { question: string; answer: string }[] = [];
    
    // Look for process-oriented content
    const processPatterns = [
      /how to ([^.!?]+)/gi,
      /steps to ([^.!?]+)/gi,
      /process of ([^.!?]+)/gi,
      /method for ([^.!?]+)/gi,
      /approach to ([^.!?]+)/gi
    ];
    
    processPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null && howToInfo.length < 2) {
        if (match[1].length > 5) {
          howToInfo.push({
            question: `How do you ${match[1]} in ${topic}?`,
            answer: `In ${topic}, ${match[1]} involves systematic approach and understanding of key principles. This process requires careful planning and implementation of best practices.`
          });
        }
      }
    });
    
    return howToInfo;
  }

  private generateFundamentalQuestions(topic: string, content: string, keywords: string[]): FlashCard[] {
    const questions: FlashCard[] = [];
    
    // Generate questions based on the topic type
    const topicLower = topic.toLowerCase();
    
    // Science/Technology topics
    if (topicLower.includes('science') || topicLower.includes('technology') || topicLower.includes('physics') || topicLower.includes('chemistry') || topicLower.includes('biology')) {
      questions.push({
        question: `What are the fundamental principles of ${topic}?`,
        answer: `The fundamental principles of ${topic} include scientific methodology, evidence-based reasoning, and systematic observation. These principles form the foundation for understanding and applying knowledge in this field.`,
        difficulty: 'medium'
      });
    }
    
    // Business/Economics topics
    else if (topicLower.includes('business') || topicLower.includes('economics') || topicLower.includes('finance') || topicLower.includes('management')) {
      questions.push({
        question: `What are the key economic or business principles in ${topic}?`,
        answer: `${topic} involves understanding market dynamics, resource allocation, and strategic decision-making. Key principles include efficiency, profitability, and sustainable growth.`,
        difficulty: 'medium'
      });
    }
    
    // History topics
    else if (topicLower.includes('history') || topicLower.includes('historical')) {
      questions.push({
        question: `What are the most significant events or periods in ${topic}?`,
        answer: `${topic} encompasses important events and periods that shaped our understanding of the past. These historical developments provide context for current situations and future planning.`,
        difficulty: 'medium'
      });
    }
    
    // Arts/Literature topics
    else if (topicLower.includes('art') || topicLower.includes('literature') || topicLower.includes('music') || topicLower.includes('culture')) {
      questions.push({
        question: `What are the main styles or movements in ${topic}?`,
        answer: `${topic} includes various styles and movements that reflect different periods, cultures, and artistic expressions. Understanding these variations helps appreciate the richness and diversity of the field.`,
        difficulty: 'medium'
      });
    }
    
    // General/Other topics
    else {
      questions.push({
        question: `What makes ${topic} important to understand?`,
        answer: `${topic} is important because it provides knowledge and insights that can be applied in various contexts. Understanding ${topic} helps develop critical thinking skills and informed decision-making capabilities.`,
        difficulty: 'medium'
      });
    }
    
    return questions;
  }

  private generateConceptQuestion(topic: string, keyword: string, content: string): FlashCard {
    // Try to find context for the keyword in the content
    const sentences = content.split(/[.!?]+/);
    let contextSentence = '';
    
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        contextSentence = sentence.trim();
        break;
      }
    }
    
    if (contextSentence) {
      return {
        question: `How does ${keyword} relate to ${topic}?`,
        answer: contextSentence + '. This concept plays a crucial role in understanding the broader aspects of ' + topic + '.',
        difficulty: 'medium'
      };
    } else {
      return {
        question: `What role does ${keyword} play in ${topic}?`,
        answer: `${keyword} is an important component of ${topic} that contributes to the overall understanding and practical application of the subject matter.`,
        difficulty: 'medium'
      };
    }
  }

  private extractTopicSpecificFacts(topic: string, content: string, searchData: TavilyResponse): string[] {
    const facts: string[] = [];
    
    // Extract facts from search answer
    if (searchData.answer) {
      const sentences = searchData.answer.split(/[.!?]+/).filter(s => s.trim().length > 15);
      sentences.forEach(sentence => {
        const cleanSentence = sentence.trim();
        if (cleanSentence.toLowerCase().includes(topic.toLowerCase()) && facts.length < 10) {
          facts.push(cleanSentence);
        }
      });
    }
    
    // Extract facts from top search results
    searchData.results.slice(0, 3).forEach(result => {
      const sentences = result.content.split(/[.!?]+/).filter(s => s.trim().length > 15);
      sentences.forEach(sentence => {
        const cleanSentence = sentence.trim();
        if (cleanSentence.toLowerCase().includes(topic.toLowerCase()) && facts.length < 10) {
          facts.push(cleanSentence);
        }
      });
    });
    
    return facts;
  }

  private generateTopicSpecificTrueFalse(topic: string, content: string, facts: string[]): QuizCard[] {
    const questions: QuizCard[] = [];
    
    // Use actual facts from the content to create true/false questions
    if (facts.length > 0) {
      // Create a true statement from actual facts
      const trueFact = facts[0];
      questions.push({
        question: trueFact + '.',
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. This is accurate information about ${topic} based on reliable sources.`,
        difficulty: 'medium'
      });
      
      // Create a modified false statement
      if (facts.length > 1) {
        let falseFact = facts[1];
        // Simple way to make it false - add "not" or change key words
        if (falseFact.includes('is important') || falseFact.includes('can help') || falseFact.includes('provides')) {
          falseFact = falseFact.replace('is important', 'is not important')
                              .replace('can help', 'cannot help')
                              .replace('provides', 'does not provide');
        } else {
          falseFact = falseFact + ' This statement is intentionally incorrect';
        }
        
        questions.push({
          question: falseFact + '.',
          type: 'true_false', 
          options: ['False', 'True'],
          correctAnswer: 0,
          explanation: `False. This statement is not accurate based on current understanding of ${topic}.`,
          difficulty: 'medium'
        });
      }
      
      // Add a third true/false question about applications
      questions.push({
        question: `${topic} can be applied in real-world scenarios to solve practical problems.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. ${topic} has practical applications that can be used to address real-world challenges and problems.`,
        difficulty: 'easy'
      });
    } else {
      // Fallback questions if no specific facts are found
      questions.push({
        question: `${topic} is considered important for personal and professional development.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. ${topic} provides valuable knowledge and skills that contribute to personal and professional growth.`,
        difficulty: 'easy'
      });
      
      questions.push({
        question: `Understanding ${topic} requires no prior knowledge or preparation.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 0,
        explanation: `False. Like most subjects, ${topic} benefits from foundational knowledge and proper preparation for effective learning.`,
        difficulty: 'medium'
      });
      
      questions.push({
        question: `${topic} knowledge can be beneficial for career advancement.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. Knowledge in ${topic} often provides valuable skills and expertise that can enhance career prospects.`,
        difficulty: 'easy'
      });
    }
    
    return questions;
  }

  private generateTopicSpecificMCQ(topic: string, content: string, keywords: string[], facts: string[]): QuizCard[] {
    const questions: QuizCard[] = [];
    const topicLower = topic.toLowerCase();
    
    // Generate multiple questions for different aspects
    
    // Question 1: Key characteristics
    if (topicLower.includes('science') || topicLower.includes('technology') || topicLower.includes('programming') || topicLower.includes('software')) {
      questions.push({
        question: `What is a key characteristic of ${topic}?`,
        type: 'multiple_choice',
        options: [
          'It requires no technical knowledge',
          'It involves systematic methodology and evidence-based approaches',
          'It is purely theoretical with no practical applications',
          'It cannot be learned through study'
        ],
        correctAnswer: 1,
        explanation: `${topic} involves systematic methodology and evidence-based approaches, making it both practical and learnable.`,
        difficulty: 'medium'
      });
    } else if (topicLower.includes('business') || topicLower.includes('finance') || topicLower.includes('economics') || topicLower.includes('marketing')) {
      questions.push({
        question: `What is most important when studying ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Memorizing formulas only',
          'Understanding market dynamics and strategic thinking',
          'Avoiding practical applications',
          'Focusing solely on historical data'
        ],
        correctAnswer: 1,
        explanation: `Understanding market dynamics and strategic thinking is crucial for ${topic} as it involves real-world decision-making.`,
        difficulty: 'medium'
      });
    } else if (topicLower.includes('health') || topicLower.includes('medicine') || topicLower.includes('medical') || topicLower.includes('nutrition')) {
      questions.push({
        question: `What approach is most effective for understanding ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Relying solely on personal opinions',
          'Evidence-based research and professional guidance',
          'Following trends without verification',
          'Avoiding scientific studies'
        ],
        correctAnswer: 1,
        explanation: `Evidence-based research and professional guidance are essential for understanding ${topic} accurately and safely.`,
        difficulty: 'hard'
      });
    } else {
      questions.push({
        question: `What is the primary benefit of learning ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Entertainment value only',
          'Knowledge and skill development for personal growth',
          'No significant benefits',
          'Only academic recognition'
        ],
        correctAnswer: 1,
        explanation: `Learning ${topic} provides knowledge and skill development that contributes to personal growth and practical understanding.`,
        difficulty: 'medium'
      });
    }
    
    // Question 2: Application-focused
    questions.push({
      question: `How can knowledge of ${topic} be applied in real-world scenarios?`,
      type: 'multiple_choice',
      options: [
        'Only in academic settings',
        'In professional environments and problem-solving situations',
        'It has no real-world applications',
        'Only for personal interest'
      ],
      correctAnswer: 1,
      explanation: `Knowledge of ${topic} can be applied in professional environments and various problem-solving situations, making it practically valuable.`,
      difficulty: 'medium'
    });
    
    // Question 3: Learning approach
    questions.push({
      question: `What is the best approach to master ${topic}?`,
      type: 'multiple_choice',
      options: [
        'Theoretical study only',
        'Combining theory with hands-on practice and application',
        'Memorizing definitions without understanding',
        'Avoiding challenging concepts'
      ],
      correctAnswer: 1,
      explanation: `Mastering ${topic} requires combining theoretical study with hands-on practice and practical application for comprehensive understanding.`,
      difficulty: 'medium'
    });
    
    // Question 4: Career benefits
    questions.push({
      question: `How does expertise in ${topic} benefit career development?`,
      type: 'multiple_choice',
      options: [
        'It has no career benefits',
        'Provides specialized skills, credibility, and advancement opportunities',
        'Only useful for job interviews',
        'Creates limitations in career choices'
      ],
      correctAnswer: 1,
      explanation: `Expertise in ${topic} provides specialized skills, builds professional credibility, and creates advancement opportunities across various career paths.`,
      difficulty: 'easy'
    });
    
    // Question 5: Keyword-based question
    if (keywords.length > 0) {
      const mainKeyword = keywords[0];
      questions.push({
        question: `What role does ${mainKeyword} play in ${topic}?`,
        type: 'multiple_choice',
        options: [
          'It is completely irrelevant',
          `It is a core concept that enhances understanding of ${topic}`,
          'It only creates confusion',
          'It is outdated and unnecessary'
        ],
        correctAnswer: 1,
        explanation: `${mainKeyword} is a core concept that significantly enhances understanding of ${topic} by providing essential knowledge and context.`,
        difficulty: 'hard'
      });
    } else {
      // Fallback 5th question
      questions.push({
        question: `What makes someone proficient in ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Basic memorization of facts',
          'Deep understanding, practical application, and continuous learning',
          'Reading about it occasionally',
          'Having theoretical knowledge only'
        ],
        correctAnswer: 1,
        explanation: `Proficiency in ${topic} comes from deep understanding, practical application of concepts, and commitment to continuous learning and improvement.`,
        difficulty: 'hard'
      });
    }
    
    return questions;
  }

  private generateAdditionalMCQs(topic: string, content: string, keywords: string[]): QuizCard[] {
    const questions: QuizCard[] = [];
    const topicLower = topic.toLowerCase();
    
    // Question about prerequisites/foundations
    questions.push({
      question: `What foundational knowledge is helpful before studying ${topic}?`,
      type: 'multiple_choice',
      options: [
        'No preparation is needed',
        'Basic understanding of related concepts and willingness to learn',
        'Advanced degree required',
        'Only natural talent matters'
      ],
      correctAnswer: 1,
      explanation: `Studying ${topic} benefits from basic understanding of related concepts and a willingness to learn, though advanced degrees are not always required.`,
      difficulty: 'easy'
    });
    
    // Question about common misconceptions
    questions.push({
      question: `What is a common misconception about ${topic}?`,
      type: 'multiple_choice',
      options: [
        'It is easy to master quickly',
        'It requires dedication, practice, and continuous learning to master',
        'Only certain people can understand it',
        'It has no practical value'
      ],
      correctAnswer: 0,
      explanation: `A common misconception is that ${topic} can be mastered quickly. In reality, it requires dedication, practice, and continuous learning to truly master.`,
      difficulty: 'medium'
    });
    
    // Question about modern relevance
    questions.push({
      question: `Why is ${topic} relevant in today's world?`,
      type: 'multiple_choice',
      options: [
        'It is outdated and no longer useful',
        'It provides essential skills and knowledge for modern challenges',
        'Only relevant in academic institutions',
        'Has limited applications'
      ],
      correctAnswer: 1,
      explanation: `${topic} remains highly relevant as it provides essential skills and knowledge needed to address modern challenges and opportunities.`,
      difficulty: 'medium'
    });
    
    return questions;
  }

  private extractBenefits(topic: string, content: string): { context: string; explanation: string }[] {
    return [
      {
        context: 'professional development',
        explanation: `${topic} enhances professional capabilities, opens new career opportunities, and builds valuable expertise.`
      },
      {
        context: 'personal empowerment',
        explanation: `Understanding ${topic} builds confidence, enables informed decision-making, and creates opportunities for growth.`
      },
      {
        context: 'leadership roles',
        explanation: `${topic} knowledge provides the foundation for effective leadership, strategic thinking, and team management.`
      },
      {
        context: 'financial independence',
        explanation: `Mastery of ${topic} can lead to better job opportunities, higher compensation, and entrepreneurial ventures.`
      }
    ];
  }

  private createSummaryFromResearch(topic: string, searchData: TavilyResponse): string {
    let summary = searchData.answer || '';
    
    if (!summary || summary.length < 100) {
      summary = `${topic} is a valuable and important subject that provides essential knowledge and skills for professional development and personal empowerment. `;
      
      // Add insights from search results
      if (searchData.results.length > 0) {
        const topResult = searchData.results[0];
        const contentSnippet = topResult.content.substring(0, 250).trim();
        if (contentSnippet) {
          summary += `Research shows that ${contentSnippet}... `;
        }
      }
      
      summary += `Mastering ${topic} enables individuals to break through traditional barriers, achieve greater independence, and create positive impact in their communities. This knowledge serves as a foundation for leadership, innovation, and sustainable growth in both personal and professional contexts. The skills and insights gained from ${topic} are particularly valuable for women and underrepresented communities seeking to advance their careers and create meaningful change.`;
    } else {
      // Enhance the existing summary with empowerment context
      summary += ` Understanding ${topic} is particularly powerful for building confidence, breaking barriers, and creating opportunities for professional and personal growth.`;
    }
    
    return summary;
  }

  async generateAudioSummary(text: string, language: string = 'en'): Promise<string> {
    try {
      console.log(`🔊 Preparing audio summary in language: ${language}`);
      
      const enhancedText = this.enhanceTextForSpeech(text, language);
      
      console.log('✅ Audio summary text prepared successfully');
      return enhancedText;
    } catch (error) {
      console.error('❌ Audio generation error:', error);
      return text;
    }
  }
  
  private enhanceTextForSpeech(text: string, language: string): string {
    let enhanced = text;
    
    // Add pauses for better comprehension
    enhanced = enhanced.replace(/\. /g, '. ... ');
    enhanced = enhanced.replace(/: /g, ': ... ');
    enhanced = enhanced.replace(/; /g, '; ... ');
    enhanced = enhanced.replace(/\? /g, '? ... ');
    enhanced = enhanced.replace(/! /g, '! ... ');
    
    // Language-specific enhancements
    if (language === 'hi-IN') {
      enhanced = `महत्वपूर्ण जानकारी: ... ${enhanced}`;
    } else if (language === 'ta-IN') {
      enhanced = `முக்கியமான தகவல்: ... ${enhanced}`;
    } else if (language === 'es-ES') {
      enhanced = `Información importante: ... ${enhanced}`;
    } else {
      enhanced = `Important learning summary: ... ${enhanced}`;
    }
    
    return enhanced;
  }
  
  getAvailableLanguages(): { code: string; name: string; }[] {
    if (!('speechSynthesis' in window)) {
      return [{ code: 'en-US', name: 'English (US)' }];
    }
    
    const voices = speechSynthesis.getVoices();
    const languages = [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'hi-IN', name: 'Hindi' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Mandarin)' },
      { code: 'ar-SA', name: 'Arabic' },
      { code: 'ta-IN', name: 'Tamil' },
      { code: 'te-IN', name: 'Telugu' },
      { code: 'mr-IN', name: 'Marathi' },
      { code: 'bn-IN', name: 'Bengali' }
    ];
    
    return languages.filter(lang => 
      voices.some(voice => voice.lang.startsWith(lang.code.split('-')[0]))
    );
  }

  private generateFallbackContent(topic: string): StudyMaterial {
    const fallbackFlashcards: FlashCard[] = [
      {
        question: `How can mastering ${topic} empower women in leadership roles?`,
        answer: `Mastering ${topic} gives women the confidence, knowledge, and expertise needed to excel in leadership positions. It provides the foundation for making informed decisions, commanding respect, and inspiring others to achieve their potential.`,
        difficulty: 'medium'
      },
      {
        question: `What opportunities does understanding ${topic} create for underprivileged communities?`,
        answer: `Understanding ${topic} opens doors to better employment, economic independence, and the ability to uplift entire communities through knowledge sharing and mentorship. It creates pathways for sustainable development and progress.`,
        difficulty: 'hard'
      },
      {
        question: `Why is ${topic} particularly important for women's financial independence?`,
        answer: `${topic} provides the knowledge and skills necessary for women to make informed financial decisions, start businesses, negotiate better salaries, and achieve economic freedom without depending on others.`,
        difficulty: 'medium'
      },
      {
        question: `How can ${topic} help break traditional barriers faced by women?`,
        answer: `By mastering ${topic}, women gain the expertise and confidence to challenge stereotypes, enter male-dominated fields, and prove their capabilities through knowledge and competence.`,
        difficulty: 'hard'
      },
      {
        question: `What are the key fundamentals of ${topic} that every empowered woman should know?`,
        answer: `The fundamentals include understanding core principles, practical applications, real-world implementation strategies, and how to use this knowledge to create positive change in both personal and professional environments.`,
        difficulty: 'easy'
      },
      {
        question: `How does ${topic} contribute to building self-confidence and self-reliance?`,
        answer: `Learning ${topic} builds confidence by providing concrete skills and knowledge that women can rely on to solve problems, make decisions, and take control of their destinies. Knowledge truly is power.`,
        difficulty: 'medium'
      }
    ];

    const fallbackQuizQuestions: QuizCard[] = [
      {
        question: `${topic} is an important subject for professional development.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. ${topic} provides valuable knowledge and skills essential for career advancement and professional growth.`,
        difficulty: 'easy'
      },
      {
        question: `What is the primary benefit of learning ${topic}?`,
        type: 'multiple_choice',
        options: ['Entertainment value', 'Professional growth and empowerment', 'No significant benefit', 'Only academic interest'],
        correctAnswer: 1,
        explanation: `Learning ${topic} primarily benefits professional growth and empowerment, providing practical skills and knowledge for success.`,
        difficulty: 'medium'
      },
      {
        question: `Understanding ${topic} requires no prior knowledge or preparation.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 0,
        explanation: `False. Like most subjects, ${topic} benefits from foundational knowledge and proper preparation for effective learning.`,
        difficulty: 'medium'
      },
      {
        question: `How can expertise in ${topic} benefit career development?`,
        type: 'multiple_choice',
        options: [
          'It has no career benefits',
          'Provides specialized skills and advancement opportunities',
          'Only useful for job interviews',
          'Creates limitations in career choices'
        ],
        correctAnswer: 1,
        explanation: `Expertise in ${topic} provides specialized skills and creates advancement opportunities across various career paths.`,
        difficulty: 'hard'
      },
      {
        question: `${topic} knowledge can be beneficial for career advancement.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. Knowledge in ${topic} often provides valuable skills and expertise that can enhance career prospects.`,
        difficulty: 'easy'
      },
      {
        question: `What makes someone proficient in ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Basic memorization of facts',
          'Deep understanding and practical application',
          'Reading about it occasionally',
          'Having theoretical knowledge only'
        ],
        correctAnswer: 1,
        explanation: `Proficiency in ${topic} comes from deep understanding and practical application of concepts.`,
        difficulty: 'hard'
      },
      {
        question: `${topic} can be applied in real-world scenarios to solve practical problems.`,
        type: 'true_false',
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. ${topic} has practical applications that can be used to address real-world challenges and problems.`,
        difficulty: 'easy'
      },
      {
        question: `Why is ${topic} relevant in today's world?`,
        type: 'multiple_choice',
        options: [
          'It is outdated and no longer useful',
          'Provides essential skills for modern challenges',
          'Only relevant in academic institutions',
          'Has limited applications'
        ],
        correctAnswer: 1,
        explanation: `${topic} remains highly relevant as it provides essential skills and knowledge needed to address modern challenges.`,
        difficulty: 'medium'
      }
    ];

    console.log('🔄 Using fallback content for:', topic);
    console.log('🔄 Fallback quiz questions:', fallbackQuizQuestions.length);
    console.log('🔄 Sample fallback question:', fallbackQuizQuestions[0]);
    
    return {
      topic,
      flashcards: fallbackFlashcards,
      quizQuestions: fallbackQuizQuestions,
      summary: `${topic} is a powerful tool for empowerment that equips women and underprivileged communities with essential skills and knowledge. Understanding ${topic} creates opportunities for leadership, financial independence, and breaking traditional barriers. It builds confidence, enables informed decision-making, and provides the foundation for creating positive change in both personal and professional spheres. The knowledge gained from ${topic} serves as a catalyst for individual growth and community empowerment.`,
      sources: []
    };
  }

  getOfflineAptitudeQuestions(): QuizQuestion[] {
    return [
      {
        question: "What percentage of women hold leadership positions in Fortune 500 companies as of 2024?",
        options: ["15%", "25%", "35%", "45%"],
        correctAnswer: 2,
        explanation: "Women hold approximately 35% of leadership positions in Fortune 500 companies, showing progress but indicating room for growth."
      },
      {
        question: "Which skill is most crucial for women entering male-dominated fields?",
        options: ["Technical expertise", "Confidence and communication", "Networking", "All of the above"],
        correctAnswer: 3,
        explanation: "Success in male-dominated fields requires a combination of technical expertise, confidence, communication skills, and strong networking abilities."
      },
      {
        question: "What is the primary benefit of financial literacy for women?",
        options: ["Better shopping decisions", "Independence and empowerment", "Higher salary negotiations", "Investment knowledge"],
        correctAnswer: 1,
        explanation: "Financial literacy provides women with independence and empowerment, enabling them to make informed decisions about their financial future."
      },
      {
        question: "Which approach is most effective for breaking the glass ceiling?",
        options: ["Working harder than everyone", "Building strategic networks and skills", "Avoiding challenges", "Waiting for opportunities"],
        correctAnswer: 1,
        explanation: "Building strategic networks and developing relevant skills is the most effective approach to breaking through career barriers."
      },
      {
        question: "What is the most important factor in achieving work-life balance?",
        options: ["Perfect time management", "Setting boundaries and priorities", "Working from home", "Having fewer responsibilities"],
        correctAnswer: 1,
        explanation: "Setting clear boundaries and priorities is essential for maintaining healthy work-life balance and preventing burnout."
      }
    ];
  }
}

export const tavilyService = new TavilyService();
export default tavilyService;
