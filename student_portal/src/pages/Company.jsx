import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./DetailedComp.css";
import { useSelector } from "react-redux";
import { askAi } from "@/lib/askAi";

function refacterResponce(response) {
  console.log(response);
  let responseArray = response.split("**");
  let newResponse = "";
  for (let i = 0; i < responseArray.length; i++) {
    if (i === 0 || i % 2 !== 1) {
      newResponse += responseArray[i];
    } else {
      newResponse += "</br><b>" + responseArray[i] + "</b>";
    }
  }
  return newResponse.split("*").join("</br>");
}
const Company = () => {
  const { companyId } = useParams(); // Get the company ID from URL params
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState(null);
  const [qload, setQload] = useState(false);
  const [users, setUsers] = useState(null);

  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiButton, setAiButton] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [showAiSection, setShowAiSection] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser);
  const navigate = useNavigate();
  const handleAddQuestion = async () => {
    if (!q || q.trim() === "") {
      return;
    }
    setQload(true);
    try {
      const response = await fetch(`/api/companies/questions/${companyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: q,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add question");
      }
      const data = await response.json();
      console.log(data);

      setCompanyData(data.data.company);
      setUsers(data.data.users);
      setQ(null);
      setQload(false);
    } catch (err) {
      setError(err.message || "An unknown error occurred");
      setQload(false);
    }
  };

  const delayPara = (index, nextWord, length) => {
    setTimeout(function () {
      setAiResponse((prev) => prev + nextWord);
      if (length - 1 === index) setAiButton(null);
    }, 75 * index);
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    console.log("is it coming ai submit");
    setAiError(null);
    generateAnswer();
  };

  const generateAnswer = () => {
    if (!aiQuestion.trim()) return;
    setAiQuestions((p) => [{ question: "", response: "" }, ...p]);
    setAiResponse("loading");
    setAiButton("loading");
    console.log(currentUser);
    askAi(currentUser, aiQuestion, companyData.name)
      // .then((response) => response.json())
      .then((response) => {
        console.log(response);
        let code = response.split("```");
        console.log(code, code[1]);
        let newResponse2 = "";
        let newResponseArray;
        if (code[1]) {
          let res0 = refacterResponce(code[0]);
          let res2 = refacterResponce(code[2]);
          newResponse2 = res0 + code[1] + res2;
          newResponseArray = res0.split(" ");
          newResponseArray.push(code[1]);
          newResponseArray.push(...res2.split(" "));
        } else {
          newResponse2 = refacterResponce(response);
          newResponseArray = newResponse2.split(" ");
        }

        setAiQuestions((p) => [
          { question: aiQuestion, response: newResponse2 },
          ...p.slice(1),
        ]);
        setAiResponse("");
        for (let i = 0; i < newResponseArray.length; i++) {
          const nextWord = newResponseArray[i];
          delayPara(i, nextWord + " ", newResponseArray.length);
        }
        // setAiResponse(data.response);
      })
      .catch((e) => {
        setAiError(e.message);
        setAiButton(null);
        console.log("Error:", e.message);
      });
  };
  function handleUserClick(userId) {
    navigate(`/user/${userId}`);
  }

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch company details");
        }
        const data = await response.json();
        console.log(data);

        setCompanyData(data.data.company);
        // setuser(data.data.palced);
        setUsers(data.data.palced);
        console.log(companyData);

        setIsLoading(false);
      } catch (err) {
        setError(err.message || "An unknown error occurred");
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-[250px] bg-gray-300 rounded"></div>
              <div className="h-4 w-[200px] bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="h-32 w-full bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If no company data, return null
  if (!companyData) return null;

  return (
    <>
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="flex items-center space-x-6">
          {companyData.logoUrl && (
            <img
              src={companyData.logoUrl}
              alt={`${companyData.name} logo`}
              className="h-24 w-24 object-contain rounded-lg shadow-md"
            />
          )}
          <div>
            <Badge variant="secondary">{companyData.companyId}</Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {companyData.name.toUpperCase()}
            </h1>
          </div>
        </div>

        {/* Additional Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {companyData.description && (
                  <p className="text-muted-foreground max-w-2xl">
                    {companyData.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
          {users.map((user) => (
            <Card
              key={user.uid}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleUserClick(user.uid)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600">{user.uid}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Batch: {user.batch}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <img
                      src={user.userProfileImg}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/9512/9512683.png";
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Interview Questions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {console.log(companyData.questions)}
              <div className="flex space-x-2 flex-shrink-0">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter a question asked in interview..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={handleAddQuestion} disabled={qload}>
                  {qload ? "Adding..." : "Add Question"}
                </Button>
              </div>
              {companyData.questions?.length > 0 &&
                companyData.questions?.map((question, i) => (
                  <AccordionItem
                    key={i}
                    value={i}
                    className="flex space-x-2 p-2 flex-shrink-0"
                  >
                    <div className="relative flex-1">{question}</div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowAiSection(true);
                        setAiQuestion(question);
                        // generateAnswer();
                      }}
                    >
                      Ask AI
                    </Button>
                  </AccordionItem>
                ))}
            </Accordion>
          </CardContent>
        </Card>
        <button
          className="toggle-ai-button"
          onClick={() => setShowAiSection(!showAiSection)}
        >
          {showAiSection ? "Hide AI >" : "AI Assistance <"}
        </button>
      </div>
      <div className={`ai-section ${showAiSection ? "visible" : "hidden"}`}>
        <form onSubmit={handleAiSubmit} className="ai-form">
          <textarea
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask AI about this company"
            required
            className="ai-input"
          ></textarea>
          <button
            type="submit"
            disabled={aiButton}
            className="ai-submit-button"
          >
            {aiButton ? "Generating Answer..." : "Ask AI"}
          </button>
        </form>
        {aiError && <div className="error">{aiError}</div>}
        {aiResponse && (
          <div className="ai-response result">
            <div className="result-title">
              <img src={currentUser.profileImageUrl} alt="YOU" />
              {aiResponse === "loading" ? (
                <p>{aiQuestion}</p>
              ) : (
                <p>{aiQuestions[0]?.question}</p>
              )}
            </div>
            <div className="result-data">
              <img src={currentUser.college.logoUrl} alt="BIT" />
              {aiResponse === "loading" ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p dangerouslySetInnerHTML={{ __html: aiResponse }}></p>
              )}
            </div>
          </div>
        )}
        {aiQuestions.length > 1 &&
          aiQuestions.slice(1).map((q) => (
            <div className="ai-response result" key={q.q}>
              <div className="result-title">
                <img src={currentUser.profileImageUrl} alt="YOU" />
                <p>{q.question}</p>
              </div>
              <div className="result-data">
                <img src={currentUser.college.logoUrl} alt="BIT" />
                <p dangerouslySetInnerHTML={{ __html: q.response }}></p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Company;
