import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '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';

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

console.log('🔑 OpenAI API initialized with key:', API_KEY ? API_KEY.substring(0, 20) + '...' : 'NOT FOUND');

export interface FlashCard {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizCard {
  question: string;
  type: 'true_false' | 'multiple_choice';
  options?: string[];
  correctAnswer: number; // Index of correct answer (0 for False, 1 for True in true/false)
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyMaterial {
  topic: string;
  flashcards: FlashCard[];
  quizQuestions: QuizCard[];
  summary: string;
  audioSummary?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

class AIService {
  async generateFlashcards(topic: string, content?: string): Promise<StudyMaterial> {
    console.log('🎯 Starting AI flashcard generation for topic:', topic);
    
    try {
      // First check if API key is available
      if (!API_KEY || API_KEY.length < 10) {
        console.error('❌ No valid OpenAI API key found');
        throw new Error('OpenAI API key not properly configured');
      }
      
      console.log('🔑 API Key configured:', `${API_KEY.substring(0, 15)}...${API_KEY.substring(-15)}`);
      
      const specificPrompt = content 
        ? `Based on this content about "${topic}": ${content.substring(0, 2000)}\n\nCreate educational flashcards that help understand this specific content.`
        : `Create comprehensive educational flashcards specifically about "${topic}". Make sure each question is directly related to ${topic} and tests specific knowledge about this subject.`;

      const systemPrompt = `You are an expert educational AI that creates high-quality flashcards. You specialize in women's empowerment and creating content that builds confidence and knowledge.

IMPORTANT RULES:
1. Make ALL questions specifically about the topic "${topic}"
2. Each question must test specific knowledge about ${topic}
3. Answers should be detailed and educational
4. Use empowering language that builds confidence
5. Create exactly 6 flashcards
6. Respond with ONLY valid JSON, no other text

JSON Format:
{
  "flashcards": [
    {
      "question": "Specific question about ${topic}",
      "answer": "Detailed answer with examples",
      "difficulty": "easy|medium|hard"
    }
  ],
  "summary": "Educational summary about ${topic} and its importance for professional growth"
}`;

      const userPrompt = `${specificPrompt}\n\nTopic: ${topic}\n\nCreate 6 flashcards that specifically test knowledge about "${topic}". Each question must be unique and directly related to this topic.`;

      console.log('🚀 Making OpenAI API request...');
      console.log('📋 Topic focus:', topic);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user", 
              content: userPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
          presence_penalty: 0.2,
          frequency_penalty: 0.3
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
      
      const completion = await response.json();
      console.log('✅ OpenAI API response received');
      console.log('📊 Response stats:', {
        choices: completion.choices?.length || 0,
        usage: completion.usage,
        model: completion.model
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        console.error('❌ No response content from OpenAI');
        throw new Error('No response content from OpenAI');
      }

      console.log('✅ Raw AI response received:', aiResponse.length, 'characters');
      console.log('🔍 Response preview:', aiResponse.substring(0, 300));
      
      // Clean and parse JSON response
      let cleanResponse = aiResponse.replace(/```json\s*|\s*```/g, '').trim();
      
      // Handle potential formatting issues
      if (!cleanResponse.startsWith('{')) {
        const jsonStart = cleanResponse.indexOf('{');
        if (jsonStart !== -1) {
          cleanResponse = cleanResponse.substring(jsonStart);
        }
      }
      
      // Find the end of JSON if there's extra content
      const lastBrace = cleanResponse.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < cleanResponse.length - 1) {
        cleanResponse = cleanResponse.substring(0, lastBrace + 1);
      }
      
      console.log('🧙 Cleaned response length:', cleanResponse.length);
      
      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
        console.log('✅ Successfully parsed JSON response');
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Failed to parse response:', cleanResponse);
        throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
      }
      
      // Validate response structure
      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        console.error('❌ Invalid response format - missing flashcards array');
        console.error('❌ Parsed object:', parsed);
        throw new Error('Invalid response format: missing flashcards array');
      }
      
      if (parsed.flashcards.length === 0) {
        console.error('❌ No flashcards generated');
        throw new Error('No flashcards were generated');
      }
      
      // Validate each flashcard
      parsed.flashcards.forEach((card: any, index: number) => {
        if (!card.question || !card.answer || !card.difficulty) {
          console.error(`❌ Invalid flashcard ${index}:`, card);
          throw new Error(`Flashcard ${index} missing required fields`);
        }
      });
      
      // Generate quiz questions as well
      const quizQuestions = await this.generateQuizQuestions(topic, parsed.summary);
      
      const studyMaterial: StudyMaterial = {
        topic,
        flashcards: parsed.flashcards.slice(0, 8),
        quizQuestions: quizQuestions,
        summary: parsed.summary || `Master ${topic} to unlock new opportunities for professional growth and empowerment.`
      };

      console.log('✅ Successfully generated', studyMaterial.flashcards.length, 'AI-powered flashcards for:', topic);
      console.log('📋 Sample question:', studyMaterial.flashcards[0]?.question);
      
      return studyMaterial;

    } catch (error) {
      console.error('❌ AI Service Error for topic "' + topic + '":', error);
      console.log('🔄 Using enhanced fallback content for:', topic);
      
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      
      // Use fallback content
      return this.generateFallbackContent(topic);
    }
  }

  async generateQuizQuestions(topic: string, summary: string): Promise<QuizCard[]> {
    try {
      console.log('🎯 Generating quiz questions for topic:', topic);
      
      if (!API_KEY || API_KEY.length < 10) {
        throw new Error('OpenAI API key not configured');
      }
      
      const quizPrompt = `Create quiz questions about "${topic}" based on this summary: ${summary}

Create exactly 6 quiz questions with a mix of:
- True/False questions (3 questions)
- Multiple choice questions (3 questions)

Focus on testing understanding of key concepts about ${topic}.

Respond with ONLY valid JSON in this format:
{
  "questions": [
    {
      "question": "Statement about ${topic} to evaluate as true or false",
      "type": "true_false",
      "correctAnswer": 1,
      "explanation": "Why this statement is true/false",
      "difficulty": "easy"
    },
    {
      "question": "What is the main benefit of ${topic}?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "Explanation of why option C is correct",
      "difficulty": "medium"
    }
  ]
}

Ensure all questions are specifically about ${topic}.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a quiz generator specialized in creating engaging True/False and Multiple Choice questions. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: quizPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });
      
      if (!response.ok) {
        throw new Error(`Quiz API error: ${response.status}`);
      }
      
      const completion = await response.json();
      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No quiz response from AI');
      }
      
      console.log('✅ Quiz response received:', aiResponse.length, 'characters');
      
      // Clean and parse JSON
      let cleanResponse = aiResponse.replace(/```json\s*|\s*```/g, '').trim();
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid quiz response format');
      }
      
      const quizQuestions: QuizCard[] = parsed.questions.map((q: any) => ({
        question: q.question,
        type: q.type,
        options: q.options || ['False', 'True'], // Default for true/false
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium'
      }));
      
      console.log('✅ Generated', quizQuestions.length, 'quiz questions successfully!');
      return quizQuestions;
      
    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      return this.generateFallbackQuizQuestions(topic);
    }
  }
  
  private generateFallbackQuizQuestions(topic: string): QuizCard[] {
    return [
      {
        question: `${topic} is an important subject for professional development.`,
        type: 'true_false' as const,
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `Yes, ${topic} provides valuable knowledge and skills for career advancement.`,
        difficulty: 'easy' as const
      },
      {
        question: `What is the primary benefit of learning ${topic}?`,
        type: 'multiple_choice' as const,
        options: ['Entertainment value', 'Professional growth and empowerment', 'No significant benefit', 'Only academic interest'],
        correctAnswer: 1,
        explanation: `Learning ${topic} primarily benefits professional growth and empowerment, providing practical skills and knowledge.`,
        difficulty: 'medium' as const
      },
      {
        question: `${topic} knowledge can help break traditional barriers in career advancement.`,
        type: 'true_false' as const,
        options: ['False', 'True'],
        correctAnswer: 1,
        explanation: `True. Knowledge in ${topic} empowers individuals to overcome obstacles and advance in their careers.`,
        difficulty: 'medium' as const
      },
      {
        question: `Which skill is most developed through studying ${topic}?`,
        type: 'multiple_choice' as const,
        options: ['Critical thinking', 'Physical strength', 'Artistic ability', 'Musical talent'],
        correctAnswer: 0,
        explanation: `Studying ${topic} primarily develops critical thinking and analytical skills.`,
        difficulty: 'hard' as const
      }
    ];
  }

  async generateAudioSummary(text: string, language: string = 'en'): Promise<string> {
    try {
      console.log(`🔊 Preparing audio summary in language: ${language}`);
      
      // Enhance text for better speech synthesis
      const enhancedText = this.enhanceTextForSpeech(text, language);
      
      console.log('✅ Audio summary text prepared successfully');
      return enhancedText; // Return enhanced text for speech synthesis in component
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
    
    // Language-specific enhancements
    if (language === 'hi-IN') {
      enhanced = `महत्वपूर्ण जानकारी: ${enhanced}`;
    } else if (language === 'ta-IN') {
      enhanced = `முக்கியமான தகவல்: ${enhanced}`;
    } else if (language === 'es-ES') {
      enhanced = `Información importante: ${enhanced}`;
    }
    
    return enhanced;
  }
  
  // Get available speech synthesis voices for different languages
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
    
    // Filter languages that have available voices
    return languages.filter(lang => 
      voices.some(voice => voice.lang.startsWith(lang.code.split('-')[0]))
    );
  }

  private generateFallbackContent(topic: string): StudyMaterial {
    const fallbackFlashcards: FlashCard[] = [
      {
        question: `How can mastering ${topic} empower women in leadership roles?`,
        answer: `Mastering ${topic} gives women the confidence and expertise needed to break through glass ceilings, lead with authority, and inspire other women to pursue leadership positions. It provides the knowledge foundation necessary to make informed decisions and command respect in professional settings.`,
        difficulty: 'medium'
      },
      {
        question: `What opportunities does understanding ${topic} create for underprivileged communities?`,
        answer: `Understanding ${topic} opens doors to better employment, economic independence, and the ability to uplift entire communities through knowledge sharing and mentorship. It creates pathways out of poverty and builds sustainable community development.`,
        difficulty: 'hard'
      },
      {
        question: `Why is ${topic} particularly important for women's financial independence?`,
        answer: `${topic} provides the knowledge and skills necessary for women to make informed financial decisions, start businesses, and achieve economic freedom without depending on others. It's a key component of breaking the cycle of financial dependence.`,
        difficulty: 'medium'
      },
      {
        question: `How can ${topic} help break traditional barriers faced by women?`,
        answer: `By mastering ${topic}, women gain the expertise and confidence to challenge stereotypes, enter male-dominated fields, and prove their capabilities through knowledge and competence rather than just determination.`,
        difficulty: 'hard'
      },
      {
        question: `What are the key fundamentals of ${topic} that every empowered woman should know?`,
        answer: `The fundamentals include understanding core principles, practical applications, real-world implementation strategies, and how to use this knowledge to create positive change in both personal and professional environments.`,
        difficulty: 'easy'
      },
      {
        question: `How does ${topic} contribute to building self-confidence and self-reliance?`,
        answer: `Learning ${topic} builds confidence by providing concrete skills and knowledge that women can rely on to solve problems, make decisions, and take control of their destinies. Knowledge is power, and power builds confidence.`,
        difficulty: 'medium'
      },
      {
        question: `What real-world applications of ${topic} can directly benefit women's career advancement?`,
        answer: `${topic} can be applied in networking, project management, decision-making, leadership situations, and strategic planning - all crucial for career progression and professional recognition.`,
        difficulty: 'hard'
      },
      {
        question: `How can knowledge of ${topic} be used to mentor and empower other women?`,
        answer: `By sharing expertise in ${topic}, women can create support networks, mentor younger professionals, and build communities that lift each other up toward success. Teaching others reinforces your own knowledge while creating positive impact.`,
        difficulty: 'medium'
      }
    ];

    return {
      topic,
      flashcards: fallbackFlashcards,
      quizQuestions: this.generateFallbackQuizQuestions(topic),
      summary: `${topic} is a powerful tool for empowerment that equips women and underprivileged communities with essential skills and knowledge. Understanding ${topic} creates opportunities for leadership, financial independence, and breaking traditional barriers. It builds confidence, enables informed decision-making, and provides the foundation for creating positive change in both personal and professional spheres. This knowledge becomes a catalyst for individual growth and community empowerment, helping create sustainable paths to success and independence.`
    };
  }

  // Offline aptitude questions
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
        question: "Which entrepreneurship strategy is most effective for women starting businesses?",
        options: ["Solo ventures", "Collaborative partnerships", "Family businesses", "Corporate spin-offs"],
        correctAnswer: 1,
        explanation: "Collaborative partnerships often provide women entrepreneurs with shared resources, complementary skills, and expanded networks."
      },
      {
        question: "What is the glass ceiling effect?",
        options: ["Physical barriers in buildings", "Invisible barriers preventing advancement", "Salary limitations", "Educational restrictions"],
        correctAnswer: 1,
        explanation: "The glass ceiling refers to invisible barriers that prevent women and minorities from advancing to higher positions in organizations."
      },
      {
        question: "Which communication style is most effective in professional settings?",
        options: ["Aggressive", "Passive", "Assertive", "Diplomatic"],
        correctAnswer: 2,
        explanation: "Assertive communication is most effective as it allows clear, confident expression while respecting others' perspectives."
      },
      {
        question: "What percentage of global entrepreneurs are women?",
        options: ["25%", "35%", "40%", "50%"],
        correctAnswer: 2,
        explanation: "Approximately 40% of global entrepreneurs are women, though this varies significantly by region and industry."
      },
      {
        question: "Which factor most contributes to the gender pay gap?",
        options: ["Education differences", "Experience levels", "Systemic bias and discrimination", "Industry choice"],
        correctAnswer: 2,
        explanation: "While multiple factors contribute, systemic bias and discrimination remain the primary drivers of the gender pay gap."
      },
      {
        question: "What is the most effective way to build professional networks?",
        options: ["Social media only", "Industry events and mentorship", "Cold calling", "Online courses"],
        correctAnswer: 1,
        explanation: "Industry events and mentorship provide authentic relationship-building opportunities and valuable guidance."
      },
      {
        question: "Which leadership style is often most effective for women leaders?",
        options: ["Authoritarian", "Transformational", "Laissez-faire", "Transactional"],
        correctAnswer: 1,
        explanation: "Transformational leadership, which focuses on inspiring and developing others, often aligns well with collaborative leadership strengths."
      }
    ];
  }
}

export const aiService = new AIService();
export default aiService;
