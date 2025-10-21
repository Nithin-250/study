import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, UserCircle, Crown, Baby, Sparkles } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  generation: number; // 0 = main person, 1 = parents/children, 2 = grandparents/grandchildren, etc.
  position: { x: number; y: number };
  relationToMain: string;
  description?: string;
  isMainPerson?: boolean;
}

interface FamilyConnection {
  from: string;
  to: string;
  type: 'parent' | 'spouse' | 'child' | 'sibling';
  label?: string;
}

interface BloodRelationsProps {
  familyData: {
    members: FamilyMember[];
    connections: FamilyConnection[];
  };
  question: string;
  correctAnswerId?: string;
  onMemberClick?: (member: FamilyMember, isCorrect: boolean) => void;
}

export const BloodRelationsAnimation: React.FC<BloodRelationsProps> = ({
  familyData,
  question,
  correctAnswerId,
  onMemberClick
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [highlightedConnections, setHighlightedConnections] = useState<string[]>([]);
  const [showConnections, setShowConnections] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMember(member);
    
    // Find all connections involving this member
    const memberConnections = familyData.connections
      .filter(conn => conn.from === member.id || conn.to === member.id)
      .map(conn => `${conn.from}-${conn.to}`);
    
    setHighlightedConnections(memberConnections);
    
    // Check if this is the correct answer
    const isCorrect = correctAnswerId ? member.id === correctAnswerId : false;
    onMemberClick?.(member, isCorrect);
  };

  const getGenderIcon = (gender: 'male' | 'female') => {
    return gender === 'male' ? '👨' : '👩';
  };

  const getGenderColor = (gender: 'male' | 'female') => {
    return gender === 'male' 
      ? 'from-blue-400 to-blue-600' 
      : 'from-pink-400 to-pink-600';
  };

  const getGenerationLabel = (generation: number) => {
    switch (generation) {
      case -2: return 'Great Grandparents';
      case -1: return 'Grandparents';
      case 0: return 'Main Generation';
      case 1: return 'Children';
      case 2: return 'Grandchildren';
      default: return 'Family Member';
    }
  };

  const resetSelection = () => {
    setSelectedMember(null);
    setHighlightedConnections([]);
    setAnimationKey(prev => prev + 1);
  };

  // Draw connections between family members
  const renderConnections = () => {
    return familyData.connections.map((connection, index) => {
      const fromMember = familyData.members.find(m => m.id === connection.from);
      const toMember = familyData.members.find(m => m.id === connection.to);
      
      if (!fromMember || !toMember) return null;

      const connectionId = `${connection.from}-${connection.to}`;
      const isHighlighted = highlightedConnections.includes(connectionId);
      
      const strokeColor = connection.type === 'spouse' ? '#ef4444' : 
                         connection.type === 'parent' ? '#8b5cf6' :
                         connection.type === 'child' ? '#10b981' : '#6b7280';

      return (
        <motion.line
          key={`${connection.from}-${connection.to}-${animationKey}`}
          x1={fromMember.position.x}
          y1={fromMember.position.y}
          x2={toMember.position.x}
          y2={toMember.position.y}
          stroke={strokeColor}
          strokeWidth={isHighlighted ? 4 : 2}
          strokeDasharray={connection.type === 'spouse' ? '5,5' : 'none'}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: showConnections ? 0.7 : 0.3 }}
          transition={{ duration: 1, delay: index * 0.1 }}
          className={`transition-all duration-300 ${isHighlighted ? 'drop-shadow-lg' : ''}`}
        />
      );
    });
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Blood Relations Problem
        </CardTitle>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <p className="text-lg font-medium text-gray-800">{question}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Control Panel */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Button
                onClick={() => setShowConnections(!showConnections)}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100"
              >
                {showConnections ? 'Hide' : 'Show'} Connections
              </Button>
              <Button
                onClick={resetSelection}
                variant="outline"
              >
                Reset Selection
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span>Parent-Child</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded border-dashed border-2" />
                <span>Spouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Family Link</span>
              </div>
            </div>
          </div>

          {/* Family Tree Visualization */}
          <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-8 overflow-auto">
            <svg
              width="800"
              height="600"
              className="w-full"
              viewBox="0 0 800 600"
            >
              {/* Render connections */}
              {renderConnections()}
              
              {/* Render family members */}
              {familyData.members.map((member, index) => (
                <g key={member.id}>
                  <motion.circle
                    cx={member.position.x}
                    cy={member.position.y}
                    r={member.isMainPerson ? 35 : 30}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedMember?.id === member.id
                        ? 'fill-yellow-400 stroke-yellow-600 drop-shadow-xl'
                        : member.isMainPerson
                        ? 'fill-gradient-to-r from-purple-400 to-purple-600 stroke-purple-800'
                        : member.gender === 'male'
                        ? 'fill-blue-400 stroke-blue-600'
                        : 'fill-pink-400 stroke-pink-600'
                    }`}
                    strokeWidth={member.isMainPerson ? 4 : 3}
                    onClick={() => handleMemberClick(member)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100 
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                  
                  {/* Member icon */}
                  <motion.text
                    x={member.position.x}
                    y={member.position.y + 5}
                    textAnchor="middle"
                    fontSize="20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {getGenderIcon(member.gender)}
                  </motion.text>
                  
                  {/* Main person crown */}
                  {member.isMainPerson && (
                    <motion.text
                      x={member.position.x}
                      y={member.position.y - 45}
                      textAnchor="middle"
                      fontSize="24"
                      initial={{ opacity: 0, y: member.position.y - 30 }}
                      animate={{ opacity: 1, y: member.position.y - 45 }}
                      transition={{ delay: 1, type: "spring" }}
                    >
                      👑
                    </motion.text>
                  )}
                  
                  {/* Member name */}
                  <motion.text
                    x={member.position.x}
                    y={member.position.y + 50}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    className="fill-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    {member.name}
                  </motion.text>
                  
                  {/* Selection indicator */}
                  {selectedMember?.id === member.id && (
                    <motion.circle
                      cx={member.position.x}
                      cy={member.position.y}
                      r={45}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeDasharray="10,5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Selected Member Info */}
          <AnimatePresence>
            {selectedMember && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getGenderColor(selectedMember.gender)} flex items-center justify-center text-3xl`}>
                    {getGenderIcon(selectedMember.gender)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {selectedMember.name}
                      {selectedMember.isMainPerson && <Crown className="w-6 h-6 text-yellow-600" />}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="bg-purple-100">
                        {selectedMember.relationToMain}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100">
                        {getGenerationLabel(selectedMember.generation)}
                      </Badge>
                      <Badge variant="outline" className={selectedMember.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}>
                        {selectedMember.gender}
                      </Badge>
                    </div>
                    {selectedMember.description && (
                      <p className="mt-3 text-gray-700 italic">{selectedMember.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Show related family members */}
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Connected to:</h4>
                  <div className="flex flex-wrap gap-2">
                    {familyData.connections
                      .filter(conn => conn.from === selectedMember.id || conn.to === selectedMember.id)
                      .map((conn, index) => {
                        const relatedMemberId = conn.from === selectedMember.id ? conn.to : conn.from;
                        const relatedMember = familyData.members.find(m => m.id === relatedMemberId);
                        if (!relatedMember) return null;
                        
                        return (
                          <Badge 
                            key={index}
                            className="bg-white border-2 border-purple-200 text-gray-700 cursor-pointer hover:bg-purple-100"
                            onClick={() => handleMemberClick(relatedMember)}
                          >
                            <span className="mr-1">{getGenderIcon(relatedMember.gender)}</span>
                            {relatedMember.name} ({conn.type})
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generation Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[-1, 0, 1].map(gen => {
              const membersInGeneration = familyData.members.filter(m => m.generation === gen);
              if (membersInGeneration.length === 0) return null;
              
              return (
                <div key={gen} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {getGenerationLabel(gen)}
                  </div>
                  <div className="flex justify-center gap-1">
                    {membersInGeneration.map(member => (
                      <span key={member.id} className="text-lg">
                        {getGenderIcon(member.gender)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Example usage with preset family scenarios
export const BloodRelationsExample: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenarios = [
    {
      id: 1,
      title: "Basic Family Relationship",
      question: "Who is Sarah's grandmother?",
      correctAnswer: "mary",
      familyData: {
        members: [
          { id: "john", name: "John", gender: "male" as const, generation: -1, position: { x: 200, y: 100 }, relationToMain: "Grandfather" },
          { id: "mary", name: "Mary", gender: "female" as const, generation: -1, position: { x: 350, y: 100 }, relationToMain: "Grandmother" },
          { id: "david", name: "David", gender: "male" as const, generation: 0, position: { x: 150, y: 250 }, relationToMain: "Father" },
          { id: "lisa", name: "Lisa", gender: "female" as const, generation: 0, position: { x: 300, y: 250 }, relationToMain: "Mother" },
          { id: "sarah", name: "Sarah", gender: "female" as const, generation: 1, position: { x: 225, y: 400 }, relationToMain: "Self", isMainPerson: true },
          { id: "tom", name: "Tom", gender: "male" as const, generation: 1, position: { x: 375, y: 400 }, relationToMain: "Brother" }
        ],
        connections: [
          { from: "john", to: "mary", type: "spouse" as const },
          { from: "john", to: "david", type: "parent" as const },
          { from: "mary", to: "david", type: "parent" as const },
          { from: "david", to: "lisa", type: "spouse" as const },
          { from: "david", to: "sarah", type: "parent" as const },
          { from: "david", to: "tom", type: "parent" as const },
          { from: "lisa", to: "sarah", type: "parent" as const },
          { from: "lisa", to: "tom", type: "parent" as const },
          { from: "sarah", to: "tom", type: "sibling" as const }
        ]
      }
    },
    {
      id: 2,
      title: "Extended Family Relations",
      question: "What is Mike's relationship to Emma?",
      correctAnswer: "mike",
      familyData: {
        members: [
          { id: "emma", name: "Emma", gender: "female" as const, generation: 0, position: { x: 300, y: 300 }, relationToMain: "Self", isMainPerson: true },
          { id: "robert", name: "Robert", gender: "male" as const, generation: 0, position: { x: 450, y: 300 }, relationToMain: "Spouse" },
          { id: "anna", name: "Anna", gender: "female" as const, generation: -1, position: { x: 200, y: 150 }, relationToMain: "Mother" },
          { id: "peter", name: "Peter", gender: "male" as const, generation: -1, position: { x: 350, y: 150 }, relationToMain: "Father" },
          { id: "mike", name: "Mike", gender: "male" as const, generation: 0, position: { x: 500, y: 150 }, relationToMain: "Brother-in-law" },
          { id: "jenny", name: "Jenny", gender: "female" as const, generation: 0, position: { x: 650, y: 300 }, relationToMain: "Sister-in-law" },
          { id: "lucy", name: "Lucy", gender: "female" as const, generation: 1, position: { x: 375, y: 450 }, relationToMain: "Daughter" }
        ],
        connections: [
          { from: "anna", to: "peter", type: "spouse" as const },
          { from: "anna", to: "emma", type: "parent" as const },
          { from: "peter", to: "emma", type: "parent" as const },
          { from: "emma", to: "robert", type: "spouse" as const },
          { from: "robert", to: "mike", type: "sibling" as const },
          { from: "robert", to: "jenny", type: "sibling" as const },
          { from: "emma", to: "lucy", type: "parent" as const },
          { from: "robert", to: "lucy", type: "parent" as const }
        ]
      }
    }
  ];

  const currentScenarioData = scenarios[currentScenario];

  const handleMemberClick = (member: FamilyMember, isCorrect: boolean) => {
    setSelectedAnswer(member.id);
    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
    }, 3000);
  };

  const nextScenario = () => {
    setCurrentScenario((prev) => (prev + 1) % scenarios.length);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {currentScenarioData.title}
        </h2>
        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentScenario((prev) => Math.max(0, prev - 1))}
            disabled={currentScenario === 0}
            variant="outline"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            Scenario {currentScenario + 1} of {scenarios.length}
          </span>
          <Button
            onClick={nextScenario}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>

      <BloodRelationsAnimation
        key={currentScenario}
        familyData={currentScenarioData.familyData}
        question={currentScenarioData.question}
        correctAnswerId={currentScenarioData.correctAnswer}
        onMemberClick={handleMemberClick}
      />

      {/* Result Display */}
      <AnimatePresence>
        {showResult && selectedAnswer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50`}
          >
            <div className={`p-8 rounded-xl ${
              selectedAnswer === currentScenarioData.correctAnswer
                ? 'bg-green-100 border-4 border-green-500'
                : 'bg-red-100 border-4 border-red-500'
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {selectedAnswer === currentScenarioData.correctAnswer ? '🎉' : '❌'}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  selectedAnswer === currentScenarioData.correctAnswer
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {selectedAnswer === currentScenarioData.correctAnswer ? 'Correct!' : 'Try Again!'}
                </h3>
                <p className="text-gray-700">
                  {selectedAnswer === currentScenarioData.correctAnswer
                    ? 'Great job identifying the family relationship!'
                    : 'Think about the family connections and try again.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
