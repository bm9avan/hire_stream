"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QuestionSection from "./comp/QuestionsSection";
import RecordAnswerSection from "./comp/RecordAnswerSection";

const StartInterview = ({ params, initialInterviewData }) => {
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState(
    JSON.parse(initialInterviewData.jsonMockResp)
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 my-10">
        {/* Question Section */}
        <QuestionSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />

        {/* Video/Audio Recording */}
        <RecordAnswerSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={initialInterviewData}
        />
      </div>

      <div className="flex gap-3 my-5 md:my-0 md:justify-end md:gap-6">
        {activeQuestionIndex > 0 && (
          <Button
            variant="outline"
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            Previous Question
          </Button>
        )}

        {activeQuestionIndex !== mockInterviewQuestion.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next Question
          </Button>
        )}

        {activeQuestionIndex === mockInterviewQuestion.length - 1 && (
          <Link
            to={`/dashboard/interview/${initialInterviewData.mockId}/feedback`}
          >
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
