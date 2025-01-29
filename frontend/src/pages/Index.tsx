import { useState } from "react";
import { motion } from "framer-motion";
import { StoryForm } from "@/components/StoryForm";
import { PromptDisplay } from "@/components/PromptDisplay";
import { ImageDisplay } from "@/components/ImageDisplay";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [contentName, setContentName] = useState<string>("");
  const { toast } = useToast();

  const generatePrompt = async (name: string, description: string) => {
    setIsGeneratingPrompt(true);
    setContentName(name);
    try {
      const response = await fetch("https://what-if-ai.steveparmar6nov2011.workers.dev/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_name: name,
          ending_description: description,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate prompt");
      
      const data = await response.json();
      setPrompt(data.prompt);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch("https://what-if-ai.steveparmar6nov2011.workers.dev/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          content_name: contentName,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to generate image");
      
      const data = await response.json();
      setBase64Image(data.result.image);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-3xl mx-auto mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          WhatIf.ai
        </h1>
        <p className="text-lg text-gray-600">
          Reimagine your favorite stories with AI-powered alternate endings
        </p>
      </motion.div>

      <div className={`container mx-auto px-4 ${isGeneratingImage || base64Image ? 'grid grid-cols-1 lg:grid-cols-2 gap-12' : 'max-w-2xl'}`}>
        <motion.div
          layout
          className="space-y-8"
          transition={{ duration: 0.5 }}
        >
          <StoryForm onSubmit={generatePrompt} isLoading={isGeneratingPrompt} />

          {prompt && (
            <PromptDisplay
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={generateImage}
              isLoading={isGeneratingImage}
            />
          )}
        </motion.div>

        {(isGeneratingImage || base64Image) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start justify-center lg:sticky lg:top-12"
          >
            <ImageDisplay base64Image={base64Image} isLoading={isGeneratingImage} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;