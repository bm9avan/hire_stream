import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

const Company = () => {
  const { companyId } = useParams(); // Get the company ID from URL params
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(
    companyId,
    "company loading",
    isLoading,
    "error:",
    error,
    "com",
    companyData
  );
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch company details");
        }
        const data = await response.json();
        console.log(data);

        setCompanyData(data.data);
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
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
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
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header Section */}
      <div className="flex items-center space-x-6">
        {companyData.logoUrl && (
          <img
            src={companyData.logoUrl}
            alt={`${companyData.name} logo`}
            className="h-24 w-24 object-contain rounded-lg shadow-md p-2"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {companyData.name}
          </h1>
          {companyData.description && (
            <p className="text-muted-foreground max-w-2xl">
              {companyData.description}
            </p>
          )}
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
              <p className="text-muted-foreground">{companyData.name}</p>
              <Badge variant="secondary">Company ID</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {console.log(companyData.questions)}
            {companyData.questions
              ? companyData.questions.map((question) => (
                  <AccordionItem key={question.id} value={question.id}>
                    <AccordionTrigger>{question}</AccordionTrigger>
                    <AccordionContent>{question.fullText}</AccordionContent>
                  </AccordionItem>
                ))
              : "No Data"}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default Company;
