import { chatSession } from "@/GeminiAIModal";

export async function create(slectedJob) {
  const InputPrompt = `
    Job Positions: ${slectedJob.role}, 
    Job Description: ${slectedJob.description}, 
    Years of Experience: ${"0"}. 
    Based on this information, please provide 5 interview questions with answers in JSON format, ensuring "Question" and "Answer" are fields in the JSON.
  `;
  const result = await chatSession.sendMessage(InputPrompt);
  const MockJsonResp = result.response
    .text()
    .replace("```json", "")
    .replace("```", "")
    .trim();

  return JSON.parse(MockJsonResp);
}
