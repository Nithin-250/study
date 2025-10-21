import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatternMatchingQuizProps {
  question: string;
  patterns: { id: string; pattern: string; color: string }[];
  targetPattern: string;
  onAnswer: (correct: boolean, selectedPattern: string) => void;
}

export const PatternMatchingQuiz: React.FC<PatternMatchingQuizProps> = ({
  question,
  patterns,
  targetPattern,
  onAnswer
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

  const handlePatternSelect = (patternId: string) => {
    if (submitted) return;
    setSelectedPattern(patternId);
  };

  const handleSubmit = () => {
    if (!selectedPattern) return;
    const correct = selectedPattern === targetPattern;
    setSubmitted(true);
    onAnswer(correct, selectedPattern);
  };

  const getPatternDisplay = (pattern: string, color: string) => {
    // Create visual pattern based on string
    const shapes = pattern.split('').map((char, index) => {
      const shapeTypes = ['⬢', '⬟', '●', '▲', '■', '♦'];
      const shapeIndex = char.charCodeAt(0) % shapeTypes.length;
      return (
        <span 
          key={index} 
          className={`inline-block text-2xl mx-1 transition-transform duration-200`}
          style={{ color }}
        >
          {shapeTypes[shapeIndex]}
        </span>
      );
    });
    return <div className="flex justify-center items-center">{shapes}</div>;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-6 text-center">{question}</div>
        
        {/* Target Pattern */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2 text-center">Target Pattern:</h4>
          {getPatternDisplay(targetPattern, '#1e40af')}
        </div>
        
        {/* Pattern Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {patterns.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05, rotateZ: 2 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredPattern(item.id)}
              onHoverEnd={() => setHoveredPattern(null)}
            >
              <Card
                onClick={() => handlePatternSelect(item.id)}
                className={`cursor-pointer p-4 transition-all duration-300 ${
                  selectedPattern === item.id
                    ? submitted
                      ? item.id === targetPattern
                        ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                        : 'bg-red-50 border-red-300 ring-2 ring-red-200'
                      : 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                    : hoveredPattern === item.id
                      ? 'bg-gray-50 border-gray-300 shadow-lg'
                      : 'hover:bg-gray-50 border-gray-200'
                } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <CardContent className="p-2">
                  {getPatternDisplay(item.pattern, item.color)}
                  {submitted && item.id === targetPattern && (
                    <div className="mt-2 text-center">
                      <CheckCircle size={16} className="text-green-600 mx-auto" />
                    </div>
                  )}
                  {submitted && selectedPattern === item.id && item.id !== targetPattern && (
                    <div className="mt-2 text-center">
                      <XCircle size={16} className="text-red-600 mx-auto" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPattern}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Submit Pattern Match
          </Button>
        )}

        {submitted && (
          <div className="mt-6 text-center">
            {selectedPattern === targetPattern ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center text-green-600"
              >
                <CheckCircle className="mr-2" size={24} />
                <span className="text-lg font-semibold">Perfect Match!</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-600"
              >
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="mr-2" size={24} />
                  <span className="text-lg font-semibold">Pattern doesn't match!</span>
                </div>
                <div className="text-sm">
                  Try to identify the correct pattern sequence next time.
                </div>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MatchingQuizProps {
  question: string;
  pairs: { left: string; right: string }[];
  onAnswer: (correct: boolean, matches: { [key: string]: string }) => void;
}

export const MatchingQuiz: React.FC<MatchingQuizProps> = ({
  question,
  pairs,
  onAnswer
}) => {
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [leftItems] = useState(pairs.map(p => p.left));
  const [rightItems] = useState([...pairs.map(p => p.right)].sort(() => Math.random() - 0.5));
  const [submitted, setSubmitted] = useState(false);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftClick = (item: string) => {
    if (submitted) return;
    setSelectedLeft(selectedLeft === item ? null : item);
  };

  const handleRightClick = (item: string) => {
    if (submitted || !selectedLeft) return;
    
    const newMatches = { ...matches };
    // Remove any existing match for this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === item) {
        delete newMatches[key];
      }
    });
    
    newMatches[selectedLeft] = item;
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    const correct = pairs.every(pair => matches[pair.left] === pair.right);
    setSubmitted(true);
    onAnswer(correct, matches);
  };

  const isMatched = (item: string, side: 'left' | 'right') => {
    if (side === 'left') {
      return matches[item] !== undefined;
    }
    return Object.values(matches).includes(item);
  };

  const getMatchedPartner = (item: string, side: 'left' | 'right') => {
    if (side === 'left') {
      return matches[item];
    }
    return Object.keys(matches).find(key => matches[key] === item);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-6">{question}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-center">Concepts</h4>
            {leftItems.map((item, index) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    selectedLeft === item ? 'ring-2 ring-blue-500 bg-blue-50' :
                    isMatched(item, 'left') ? 'bg-green-50 border-green-300' :
                    'hover:bg-gray-50'
                  }`}
                  onClick={() => handleLeftClick(item)}
                >
                  <CardContent className="p-3 text-center">
                    {item}
                    {isMatched(item, 'left') && (
                      <div className="text-xs text-green-600 mt-1">
                        → {getMatchedPartner(item, 'left')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-center">Descriptions</h4>
            {rightItems.map((item, index) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isMatched(item, 'right') ? 'bg-green-50 border-green-300' :
                    'hover:bg-gray-50'
                  }`}
                  onClick={() => handleRightClick(item)}
                >
                  <CardContent className="p-3 text-center">
                    {item}
                    {isMatched(item, 'right') && (
                      <div className="text-xs text-green-600 mt-1">
                        ← {getMatchedPartner(item, 'right')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={Object.keys(matches).length !== pairs.length}
            className="w-full mt-6"
          >
            Submit Matches
          </Button>
        )}

        {submitted && (
          <div className="mt-6 text-center">
            {pairs.every(pair => matches[pair.left] === pair.right) ? (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="mr-2" size={20} />
                Perfect matches!
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="mr-2" size={20} />
                  Some matches are incorrect
                </div>
                <div className="text-sm">
                  Correct matches: {pairs.map(p => `${p.left} → ${p.right}`).join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DragDropQuizProps {
  question: string;
  items: string[];
  correctOrder: string[];
  dropZones: string[];
  onAnswer: (correct: boolean, userOrder: string[]) => void;
}

export const DragDropQuiz: React.FC<DragDropQuizProps> = ({
  question,
  items,
  correctOrder,
  dropZones,
  onAnswer
}) => {
  const [dragItems, setDragItems] = useState([...items]);
  const [dropZoneItems, setDropZoneItems] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (item: string) => {
    setDraggedItem(item);
  };

  const handleDrop = (zoneIndex: number) => {
    if (!draggedItem) return;

    // Remove item from current position
    const newDragItems = dragItems.filter(item => item !== draggedItem);
    const newDropZoneItems = { ...dropZoneItems };
    
    // Remove item from any existing drop zone
    Object.keys(newDropZoneItems).forEach(key => {
      if (newDropZoneItems[key] === draggedItem) {
        delete newDropZoneItems[key];
      }
    });

    // Add item to new zone if it's not already occupied
    const zoneName = dropZones[zoneIndex];
    if (!newDropZoneItems[zoneName]) {
      newDropZoneItems[zoneName] = draggedItem;
      setDragItems(newDragItems);
      setDropZoneItems(newDropZoneItems);
    }

    setDraggedItem(null);
  };

  const handleRemoveFromZone = (zoneName: string) => {
    const item = dropZoneItems[zoneName];
    if (item && !submitted) {
      const newDropZoneItems = { ...dropZoneItems };
      delete newDropZoneItems[zoneName];
      setDropZoneItems(newDropZoneItems);
      setDragItems([...dragItems, item]);
    }
  };

  const handleSubmit = () => {
    const userOrder = dropZones.map(zone => dropZoneItems[zone] || '').filter(item => item);
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    setSubmitted(true);
    onAnswer(correct, userOrder);
  };

  const shuffleItems = () => {
    if (submitted) return;
    setDragItems([...dragItems].sort(() => Math.random() - 0.5));
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-6">{question}</div>
        
        {/* Available Items */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Available Items</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={shuffleItems}
              disabled={submitted}
            >
              <Shuffle size={16} className="mr-1" />
              Shuffle
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {dragItems.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                draggable={!submitted}
                onDragStart={() => handleDragStart(item)}
                className={`cursor-move ${submitted ? 'cursor-not-allowed' : ''}`}
              >
                <Badge 
                  variant="outline" 
                  className="p-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  {item}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="space-y-3">
          <h4 className="font-medium">Drop in Correct Order</h4>
          {dropZones.map((zone, index) => (
            <div
              key={zone}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`min-h-[60px] border-2 border-dashed rounded-lg p-4 flex items-center justify-between transition-colors ${
                draggedItem ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="font-medium mr-3">{zone}:</span>
                {dropZoneItems[zone] ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    {dropZoneItems[zone]}
                  </Badge>
                ) : (
                  <span className="text-gray-400 italic">Drop item here</span>
                )}
              </div>
              {dropZoneItems[zone] && !submitted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromZone(zone)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={Object.keys(dropZoneItems).length !== dropZones.length}
            className="w-full mt-6"
          >
            Submit Order
          </Button>
        )}

        {submitted && (
          <div className="mt-6 text-center">
            {JSON.stringify(dropZones.map(zone => dropZoneItems[zone] || '').filter(item => item)) === JSON.stringify(correctOrder) ? (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="mr-2" size={20} />
                Perfect sequence!
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="mr-2" size={20} />
                  Incorrect order
                </div>
                <div className="text-sm">
                  Correct order: {correctOrder.join(' → ')}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TimelineQuizProps {
  question: string;
  events: { event: string; year: string; order: number }[];
  onAnswer: (correct: boolean, userOrder: number[]) => void;
}

export const TimelineQuiz: React.FC<TimelineQuizProps> = ({
  question,
  events,
  onAnswer
}) => {
  const [shuffledEvents, setShuffledEvents] = useState([...events]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setShuffledEvents([...events].sort(() => Math.random() - 0.5));
  }, [events]);

  const handleEventClick = (eventIndex: number) => {
    if (submitted) return;
    
    const eventOrder = shuffledEvents[eventIndex].order;
    if (userOrder.includes(eventOrder)) {
      // Remove from order
      setUserOrder(userOrder.filter(order => order !== eventOrder));
    } else {
      // Add to order
      setUserOrder([...userOrder, eventOrder].sort((a, b) => a - b));
    }
  };

  const handleSubmit = () => {
    const correctOrder = events.map(e => e.order).sort((a, b) => a - b);
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    setSubmitted(true);
    onAnswer(correct, userOrder);
  };

  const getOrderPosition = (eventOrder: number) => {
    return userOrder.indexOf(eventOrder) + 1;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-6">{question}</div>
        
        <div className="space-y-3">
          {shuffledEvents.map((event, index) => (
            <motion.div
              key={`${event.event}-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => handleEventClick(index)}
                className={`cursor-pointer transition-all ${
                  userOrder.includes(event.order) 
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                    : 'hover:bg-gray-50'
                } ${submitted ? 'cursor-not-allowed' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{event.event}</div>
                      <div className="text-sm text-gray-600">{event.year}</div>
                    </div>
                    {userOrder.includes(event.order) && (
                      <div className="flex items-center">
                        <Badge className="bg-blue-100 text-blue-800">
                          #{getOrderPosition(event.order)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={userOrder.length !== events.length}
            className="w-full mt-6"
          >
            Submit Timeline Order
          </Button>
        )}

        {submitted && (
          <div className="mt-6 text-center">
            {JSON.stringify(userOrder) === JSON.stringify(events.map(e => e.order).sort((a, b) => a - b)) ? (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="mr-2" size={20} />
                Perfect timeline!
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="mr-2" size={20} />
                  Incorrect timeline
                </div>
                <div className="text-sm">
                  Correct order: {events.sort((a, b) => a.order - b.order).map(e => e.event).join(' → ')}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface WordAssociationQuizProps {
  question: string;
  words: string[];
  correctWords: string[];
  onAnswer: (correct: boolean, selectedWords: string[]) => void;
}

export const WordAssociationQuiz: React.FC<WordAssociationQuizProps> = ({
  question,
  words,
  correctWords,
  onAnswer
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleWordClick = (word: string) => {
    if (submitted) return;
    
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = () => {
    const correct = correctWords.every(word => selectedWords.includes(word)) &&
                   selectedWords.every(word => correctWords.includes(word)) &&
                   correctWords.length === selectedWords.length;
    setSubmitted(true);
    onAnswer(correct, selectedWords);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-6">{question}</div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {words.map((word, index) => (
            <motion.div
              key={`${word}-${index}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                onClick={() => handleWordClick(word)}
                className={`cursor-pointer text-center transition-all ${
                  selectedWords.includes(word)
                    ? submitted
                      ? correctWords.includes(word)
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-blue-50 border-blue-300 text-blue-800'
                    : submitted && correctWords.includes(word)
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'hover:bg-gray-50'
                } ${submitted ? 'cursor-not-allowed' : ''}`}
              >
                <CardContent className="p-3">
                  <div className="font-medium">{word}</div>
                  {submitted && (
                    <div className="mt-1">
                      {selectedWords.includes(word) && correctWords.includes(word) && (
                        <CheckCircle size={16} className="text-green-600 mx-auto" />
                      )}
                      {selectedWords.includes(word) && !correctWords.includes(word) && (
                        <XCircle size={16} className="text-red-600 mx-auto" />
                      )}
                      {!selectedWords.includes(word) && correctWords.includes(word) && (
                        <div className="text-xs text-green-600">Missed!</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedWords.length === 0}
            className="w-full"
          >
            Submit Selection ({selectedWords.length} words selected)
          </Button>
        )}

        {submitted && (
          <div className="mt-6 text-center">
            {correctWords.every(word => selectedWords.includes(word)) &&
             selectedWords.every(word => correctWords.includes(word)) &&
             correctWords.length === selectedWords.length ? (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="mr-2" size={20} />
                Perfect selection!
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="mr-2" size={20} />
                  Some words are incorrect
                </div>
                <div className="text-sm">
                  Correct words: {correctWords.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
