import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PromptDisplayProps {
  prompt: string;
  onGenerate: () => void;
  isLoading: boolean;
  onPromptChange?: (newPrompt: string) => void;
}

export const PromptDisplay = ({ prompt, onGenerate, isLoading, onPromptChange }: PromptDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      // className="w-full space-y-full max-w-2xl mx-auto" 
      className="w-full space-y-4"
    >
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Generated Prompt:</p>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange?.(e.target.value)}
          className="w-full min-h-[100px]"
        />
      </div>
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full rainbow-animate text-white transition-colors"
      >
        {isLoading ? "Generating..." : "Generate Image"}
      </Button>
    </motion.div>
  );
};