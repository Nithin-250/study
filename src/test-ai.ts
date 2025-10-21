// Test AI Service Integration
import { AIService } from './services/aiService';

const aiService = new AIService();

async function testAIService() {
  console.log('🧪 Testing AI Service Integration...\n');
  
  try {
    console.log('1️⃣ Testing generateFlashcards for "Python Programming"...');
    const pythonMaterials = await aiService.generateFlashcards('Python Programming');
    
    console.log('✅ Python flashcards generated:');
    console.log(`   Topic: ${pythonMaterials.topic}`);
    console.log(`   Flashcards count: ${pythonMaterials.flashcards.length}`);
    console.log(`   Summary: ${pythonMaterials.summary.substring(0, 100)}...`);
    
    console.log('\n📚 Sample flashcard:');
    if (pythonMaterials.flashcards.length > 0) {
      const sample = pythonMaterials.flashcards[0];
      console.log(`   Q: ${sample.question}`);
      console.log(`   A: ${sample.answer.substring(0, 100)}...`);
      console.log(`   Difficulty: ${sample.difficulty}`);
    }
    
    console.log('\n2️⃣ Testing generateFlashcards for "Women in Leadership"...');
    const leadershipMaterials = await aiService.generateFlashcards('Women in Leadership');
    
    console.log('✅ Leadership flashcards generated:');
    console.log(`   Topic: ${leadershipMaterials.topic}`);
    console.log(`   Flashcards count: ${leadershipMaterials.flashcards.length}`);
    console.log(`   Summary: ${leadershipMaterials.summary.substring(0, 100)}...`);
    
    console.log('\n3️⃣ Testing audio summary generation...');
    const audioText = await aiService.generateAudioSummary(pythonMaterials.summary, 'en-US');
    console.log(`✅ Audio text prepared (${audioText.length} chars)`);
    
    console.log('\n4️⃣ Testing multi-language support...');
    const hindiAudio = await aiService.generateAudioSummary(pythonMaterials.summary, 'hi-IN');
    console.log(`✅ Hindi audio text prepared (${hindiAudio.length} chars)`);
    
    console.log('\n5️⃣ Testing available languages...');
    const languages = aiService.getAvailableLanguages();
    console.log(`✅ Available languages: ${languages.length}`);
    languages.slice(0, 5).forEach(lang => {
      console.log(`   - ${lang.name} (${lang.code})`);
    });
    
    console.log('\n🎉 All AI service tests completed successfully!');
    
  } catch (error) {
    console.error('❌ AI Service test failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
  }
}

// Run test if called directly
if (import.meta.url.includes('test-ai')) {
  testAIService();
}

export { testAIService };
