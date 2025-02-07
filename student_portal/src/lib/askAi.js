import { chatSession } from "@/GeminiAIModal";

export function getDate(sqlDate) {
  return new Date(new Date(sqlDate).getTime() + 5.5 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

export async function askAi(info, aiQuestion, companyName) {
  console.log(info);
  const result = await chatSession.sendMessage(
    `Im Students named ${info.name} from branch ${info.branch.name} in ${info.college.name}, I have question ${aiQuestion} with recpective to the company ${companyName} as company is visting our campus, please give me answer in markdown format in very short and crisp way.`
  );
  console.log(result);
  const response = result.response;
  console.log(response.text());
  return response.text();
}
