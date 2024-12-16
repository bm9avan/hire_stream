import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

const QuestionSection = ({ mockInterviewQuestion, activeQuestionIndex }) => {
  const textToSpeech = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text to speech.");
    }
  };

  if (!mockInterviewQuestion) return null;
  console.log(mockInterviewQuestion);

  return (
    <div className="flex flex-col justify-between p-5 border rounded-lg my-1 bg-secondary">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {mockInterviewQuestion.map((_, index) => (
          <h2
            key={index}
            className={`p-2 rounded-full text-center text-xs md:text-sm cursor-pointer md:block hidden ${
              activeQuestionIndex === index
                ? "bg-black text-white"
                : "bg-secondary"
            }`}
          >
            Q{index + 1}
          </h2>
        ))}
      </div>

      <h2 className="my-5 text-md md:text-lg">
        {/* {activeQuestionIndex + 1 + ". "} */}
        {mockInterviewQuestion[activeQuestionIndex]?.Question}
      </h2>

      <Volume2
        className="cursor-pointer"
        onClick={() =>
          textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.Question)
        }
      />

      <div className="border rounded-lg p-5 bg-blue-100 mt-18 md:block hidden">
        <h2 className="flex gap-2 items-center text-blue-800">
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className="text-sm text-blue-600 my-2">
          {/* {process.env.NEXT_PUBLIC_QUESTION_NOTE} */}
          Click on record answer when you want to answer the question. At the
          end of interview we will give you the feedback along with correct
          answer for each of question and your answer to compare it.
        </h2>
      </div>
    </div>
  );
};

export default QuestionSection;
