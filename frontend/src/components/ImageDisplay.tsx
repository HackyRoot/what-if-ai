import { useState } from "react";
import { motion } from "framer-motion";

interface ImageDisplayProps {
  base64Image: string | null;
  isLoading: boolean;
}

export const ImageDisplay = ({ base64Image, isLoading }: ImageDisplayProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] rounded-lg glass-panel flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-500">Generating your imagination...</div>
      </div>
    );
  }

  if (!base64Image) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-lg overflow-hidden glass-panel"
    >
      <img
        src={`data:image/png;base64,${base64Image}`}
        alt="Generated scene"
        className={`w-full h-auto transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />
    </motion.div>
  );
};