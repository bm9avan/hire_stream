import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, WebcamIcon } from "lucide-react";
import Webcam from "react-webcam";
import { WebCamContext } from "@/App";
import { Link, useParams } from "react-router-dom";
import QuestionSection from "./comp/QuestionsSection";
import RecordAnswerSection from "./comp/RecordAnswerSection";
import Feedback from "./Feedback";

const Interview = () => {
  const { mockId } = useParams();

  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [pageStatus, setPageStatus] = useState("initial");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState([]);
  const [interviewData, setInterviewData] = useState(null);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const response = await fetch(`/api/mockinterview/${mockId}`);
        const data = await response.json();
        setInterviewData(data);
      } catch (error) {
        console.error("Error fetching interview details:", error);
      }
    };

    fetchInterviewDetails();
  }, [mockId]);
  // Parse mock interview questions
  const mockInterviewQuestions = interviewData?.jsonMockResp;
  console.log(mockInterviewQuestions);
  const handleStartInterview = () => {
    setPageStatus("started");
  };

  const handelUserResponce = (userAnswer) => {
    console.log(userAnswer);
    setUserAnswer((prevAnswer) => [...prevAnswer, userAnswer]);
  };

  if (interviewData === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }
  // Render before interview starts
  if (pageStatus === "initial") {
    return (
      <div className="container mx-auto px-4 py-10">
        <h2 className="font-bold text-2xl text-center mb-6">
          Interview Preparation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Job Details Section */}
          <div className="flex flex-col gap-5">
            <div className="p-5 border rounded-lg space-y-4">
              <div>
                <strong className="text-lg">Job Role:</strong>
                <p>{interviewData.job.role}</p>
              </div>

              <div>
                <strong className="text-lg">Job Description:</strong>
                <p>{interviewData.job.description}</p>
              </div>

              <div>
                <strong className="text-lg">Required Skills:</strong>
                <p>{interviewData.job.skills}</p>
              </div>
            </div>

            {/* Information Tip Box */}
            <div className="p-5 border border-yellow-300 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <Lightbulb className="h-5 w-5" />
                <strong>Preparation Tips</strong>
              </div>
              <p className="text-yellow-600">
                Review the job description carefully and prepare concise,
                relevant answers.
              </p>
            </div>
          </div>

          {/* Webcam Section */}
          <div className="space-y-4">
            {webCamEnabled ? (
              <div className="flex justify-center items-center">
                <Webcam
                  audio={false}
                  height={300}
                  width={300}
                  mirrored={true}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center bg-secondary p-10 rounded-lg">
                <WebcamIcon className="h-48 w-48 text-muted-foreground" />
              </div>
            )}

            <Button
              variant={webCamEnabled ? "destructive" : "default"}
              className="w-full"
              onClick={() => setWebCamEnabled(!webCamEnabled)}
            >
              {webCamEnabled ? "Disable WebCam" : "Enable WebCam"}
            </Button>

            <Button className="w-full mt-4" onClick={handleStartInterview}>
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (pageStatus === "started") {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Question Section */}
          <QuestionSection
            mockInterviewQuestion={interviewData.jsonMockResp}
            activeQuestionIndex={activeQuestionIndex}
          />

          {/* Video/Audio Recording */}
          <RecordAnswerSection
            mockInterviewQuestion={interviewData.jsonMockResp}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
            handelUserResponce={handelUserResponce}
          />
        </div>

        <div className="fixed bottom-24 right-32 flex space-x-2">
          {activeQuestionIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            >
              Previous Question
            </Button>
          )}

          {activeQuestionIndex !== interviewData.jsonMockResp.length - 1 && (
            <Button
              onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            >
              Next Question
            </Button>
          )}

          {activeQuestionIndex === interviewData.jsonMockResp.length - 1 && (
            // <Link to={`/dashboard/interview/${interviewData.mockId}/feedback`}>
            <Button onClick={() => setPageStatus("ended")}>
              End Interview
            </Button>
            // </Link>
          )}
        </div>
      </div>
    );
  }

  if (pageStatus === "ended") {
    return (
      <Feedback params={{ interviewId: mockId }} feedbackList={userAnswer} />
    );
  }
};

export default Interview;
