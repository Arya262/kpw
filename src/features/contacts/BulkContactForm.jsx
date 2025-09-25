import React, { useState, useEffect } from "react";
import { CloudUpload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_PERMISSIONS } from "../../context/permissions";

const EXPECTED_FIELDS = ["Name", "Mobile", "Country", "Tags"];

export default function BulkContactForm({
  setFile,
  file,
  groupName,
  setGroupName,
  groupNameError,
    fieldMapping,
  setFieldMapping,
}) {
  const { user } = useAuth();

  const [csvHeaders, setCsvHeaders] = useState([]);
  // const [fieldMapping, setFieldMapping] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setCsvHeaders([]);
      setFieldMapping({});
    }
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }

    console.log("📁 Selected file:", selectedFile);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target.result;
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

      console.log("📄 Raw CSV text:", text);

      const lines = text.split(/\r?\n/);
      const headersLine = lines[0];

      if (!headersLine || headersLine.trim() === "") {
        alert("CSV file appears to be empty or malformed.");
        setCsvHeaders([]);
        return;
      }

      const headers = headersLine
        .split(",")
        .map((header) => header.trim())
        .filter((header) => header.length > 0);

      if (headers.length === 0) {
        alert("No headers found in CSV.");
        return;
      }

      console.log("🧠 Parsed headers:", headers);
      setCsvHeaders(headers);

      const dataRows = lines.slice(1).filter((line) => line.trim() !== "");
      const csvData = dataRows.map((line) => {
        const values = line.split(",");
        const rowObj = {};
        headers.forEach((header, i) => {
          rowObj[header] = values[i] || "";
        });
        return rowObj;
      });

      console.log("📊 First 5 rows preview:", csvData.slice(0, 5));

      const defaultMapping = {};
      EXPECTED_FIELDS.forEach((field) => {
        const match = headers.find((h) =>
          h.toLowerCase().includes(field.toLowerCase())
        );
        if (match) defaultMapping[field] = match;
      });

      console.log("🗺️ Auto-mapped fields:", defaultMapping);
      setFieldMapping(defaultMapping);
    };

    reader.readAsText(selectedFile);
  };

  const handleMappingChange = (expectedField, selectedColumn) => {
    console.log(`📝 Field mapping changed: ${expectedField} → ${selectedColumn}`);
    setFieldMapping((prev) => ({
      ...prev,
      [expectedField]: selectedColumn,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Group Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Group Name
        </label>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className={`w-full border p-2 rounded-md text-gray-700 ${
            groupNameError ? "border-red-500" : "border-gray-300"
          }`}
        />
        {groupNameError && (
          <p className="text-red-500 text-sm mt-1">{groupNameError}</p>
        )}
      </div>

      {/* File Upload with drag & drop */}
      <div
        className={`mb-6 border-2 rounded-md p-4 sm:p-6 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-dashed border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) {
            const fakeEvent = { target: { files: [droppedFile] } };
            handleFileChange(fakeEvent);
          }
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="fileUpload"
        />
        <label
          htmlFor="fileUpload"
          className="cursor-pointer text-gray-500 flex flex-col items-center"
        >
          <CloudUpload className="w-6 h-6 mb-2" />
          <p className="text-sm">
            Drag & drop a CSV file here, or{" "}
            <span className="underline">browse</span>
          </p>
          <p className="text-xs mt-1">Max 50MB and 200K contacts allowed.</p>
        </label>

        {/* Uploaded File Preview with Remove Button */}
        {file && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-sm text-green-700">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setCsvHeaders([]);
                setFieldMapping({});
              }}
              className="text-red-600 text-sm underline hover:text-red-800"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Mapping Section */}
      {csvHeaders.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Map to Contact Fields
          </h3>

          <div className="space-y-6">
            {EXPECTED_FIELDS.map((field) => (
              <div
                key={field}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
              >
                {/* Left: Label */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={field}
                    className="bg-gray-100 text-gray-700 border border-gray-300 rounded-md p-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Predefined, read-only field displaying the{" "}
                    {field.toLowerCase()} of header identifiers
                  </p>
                </div>

                {/* Right: CSV Header Mapping */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    CSV Headers
                  </label>
                  <select
                    value={fieldMapping[field] || ""}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm text-gray-700"
                  >
                    <option value="">Select header for {field}</option>
                    {csvHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a CSV header identifier to map to the label.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}