"use client"
import React from "react";
interface UnderlinedWordProps {
  length: number;
  selectedWord?: string; // Prop for the length of the word
}

const UnderlinedWord: React.FC<UnderlinedWordProps> = ({
  length,
  selectedWord,
}) => {
  const underlines: string[] = Array(length).fill("_");
  let alphabets: any;
  if (selectedWord) {
    alphabets = selectedWord.split('').filter(char => /[a-zA-Z]/.test(char));
  }
  return (
    <div className="flex">
      {underlines.map((_, index) => (
        <div key={index} className="text-center mx-1">
          <div className="font-bold h-6">{alphabets && alphabets[index]}</div>
          <div className="w-5 h-1 bg-black"></div>
        </div>
      ))}
      <div className="font-semibold text-zinc-500 text-xs">{length}</div>
    </div>
  );
};

export default UnderlinedWord;
