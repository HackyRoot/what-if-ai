import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface StoryFormProps {
  onSubmit: (contentName: string, endingDescription: string) => void;
  isLoading: boolean;
}

export const StoryForm = ({ onSubmit, isLoading }: StoryFormProps) => {
  const [contentName, setContentName] = useState("");
  const [endingDescription, setEndingDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(contentName, endingDescription);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-2xl mx-auto"
    >
      <div className="space-y-2">
        <label htmlFor="contentName" className="text-sm font-medium text-gray-700">
          Content Name
        </label>
        <Input
          id="contentName"
          value={contentName}
          onChange={(e) => setContentName(e.target.value)}
          placeholder="Enter movie or TV show name"
          className="w-full"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="endingDescription" className="text-sm font-medium text-gray-700">
          Your Ending
        </label>
        <Textarea
          id="endingDescription"
          value={endingDescription}
          onChange={(e) => setEndingDescription(e.target.value)}
          placeholder="Describe your imagined ending..."
          className="w-full min-h-[120px]"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black hover:bg-gray-800 text-white transition-colors"
      >
        {isLoading ? "Generating..." : "Generate Prompt"}
      </Button>
    </motion.form>
  );
};