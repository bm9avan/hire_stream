import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

const UploadData = () => {
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const processExcelData = (data) => {
    let headers = [];
    let startRow = -1;

    // Find the row containing headers (looking for 'usn', 'name', etc.)
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const possibleHeaders = ["usn", "name", "phone", "email", "branch"];
      if (
        possibleHeaders.some((header) => {
          console.log(header, row);
          return row.some((cell) =>
            cell?.toString().toLowerCase().includes(header)
          );
        })
      ) {
        headers = row;
        startRow = i + 1;
        break;
      }
    }
    console.log(startRow);
    if (startRow === -1) return [];

    // Process headers to create clean keys
    const cleanHeaders = headers.map((header) => {
      if (!header) return null;
      return header.toString().toLowerCase().trim();
    });

    // Group company columns
    const companyIndices = cleanHeaders.reduce((acc, header, index) => {
      if (header && header.startsWith("company")) {
        acc.push(index);
      }
      return acc;
    }, []);

    // Process rows into JSON
    const jsonResult = [];
    for (let i = startRow; i < data.length; i++) {
      console.log(data[i], i);
      const row = data[i];
      if (row.every((cell) => !cell)) continue; // Skip empty rows

      const rowObj = {};
      let companies = [];

      cleanHeaders.forEach((header, index) => {
        if (!header) return;

        const value = row[index];
        if (!value) return;

        if (companyIndices.includes(index)) {
          companies.push(value);
        } else {
          rowObj[header] = value;
        }
      });

      if (companies.length > 0) {
        rowObj.companies = companies;
      }

      if (Object.keys(rowObj).length > 1) {
        jsonResult.push(rowObj);
      }
    }

    return jsonResult;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log("object, ", file);
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(excelData);
      const result = processExcelData(excelData);
      setJsonData(result);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Excel to JSON Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excel files only
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
            </div>

            {loading && <div className="text-center">Processing...</div>}

            {jsonData && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Converted JSON:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadData;
