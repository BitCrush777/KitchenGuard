"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranscriptMessage } from "../../types/inspection";
import { TranscriptMessageItem } from "../inspections/TranscriptMessageItem";

interface AnimatedTranscriptProps {
  messages: TranscriptMessage[];
  className?: string;
}

export function AnimatedTranscript({
  messages,
  className = "",
}: AnimatedTranscriptProps) {
  return (
    <div className={`flex flex-col space-y-3.5 ${className}`}>
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.28,
              delay: index === messages.length - 1 ? 0.05 : 0,
              ease: "easeOut",
            }}
          >
            <TranscriptMessageItem message={msg} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
