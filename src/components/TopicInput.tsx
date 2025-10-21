import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface TopicInputProps {
  onTopicSubmit: (topic: string) => void;
  isLoading?: boolean;
}

export const TopicInput = ({ onTopicSubmit, isLoading = false }: TopicInputProps) => {
  const [topic, setTopic] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "file">("text");

  const handleSubmit = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic to study!");
      return;
    }
    onTopicSubmit(topic);
    toast.success("Generating your study materials...");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" uploaded! PDF processing coming soon.`);
      // TODO: Implement PDF processing
    }
  };

  return (
    <section id="input-section" className="py-20 bg-gradient-to-br from-muted/30 to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Would You Like to Learn?
            </h2>
            <p className="text-muted-foreground text-lg">
              Enter a topic, paste content, or upload a PDF to get started
            </p>
          </div>

          <Card className="card-3d p-8 bg-card/80 backdrop-blur-sm">
            {/* Input Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={inputMode === "text" ? "hero" : "outline"}
                size="sm"
                onClick={() => setInputMode("text")}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Text Input
              </Button>
              <Button
                variant={inputMode === "file" ? "hero" : "outline"}
                size="sm"
                onClick={() => setInputMode("file")}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </Button>
            </div>

            {inputMode === "text" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Topic or Content
                  </label>
                  <Textarea
                    placeholder="Enter a topic (e.g., 'Photosynthesis') or paste your study content here..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-32 resize-none focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={isLoading || !topic.trim()}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                      </motion.div>
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Study Materials
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload PDF Document
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Drop your PDF here or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Topic Suggestions */}
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Photosynthesis",
                  "World War II",
                  "Python Programming",
                  "Molecular Biology",
                  "European History"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTopic(suggestion)}
                    className="text-xs hover:bg-primary/10"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};