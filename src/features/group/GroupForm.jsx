import React, { useState } from "react";
import { CloudUpload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Papa from "papaparse";

const GroupForm = ({ group, onSave, onCancel }) => {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [fileRemoved, setFileRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [groupNameError, setGroupNameError] = useState("");
  const [fileError, setFileError] = useState("");
  const { user } = useAuth();

  // Group name validation
  const validateGroupName = () => {
    if (!name.trim()) {
      setGroupNameError("Group name is required.");
      return false;
    }
    if (name.trim().length < 2) {
      setGroupNameError("Group name must be at least 2 characters long.");
      return false;
    }
    if (name.trim().length > 50) {
      setGroupNameError("Group name must be less than 50 characters.");
      return false;
    }
    setGroupNameError("");
    return true;
  };

  // File validation
  const validateFile = () => {
    if (!file && (!group?.file_name || fileRemoved)) {
      setFileError("Please upload a file for new groups.");
      return false;
    }
    if (file && ![".csv", ".docx"].some(ext => file.name.endsWith(ext))) {
      setFileError("Only .csv or .docx files are allowed.");
      return false;
    }
    setFileError("");
    return true;
  };

  // Extract contact data from CSV row
  const extractContactData = (headers, row) => {
    const contact = {};
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase().trim();
      const value = row[header]?.trim() || "";
      if ((lowerHeader.includes("name") || lowerHeader.includes("fullname")) && !contact.name) {
        contact.name = value;
      } else if ((lowerHeader.includes("country") && lowerHeader.includes("code")) || lowerHeader === "countrycode") {
        contact.countryCode = value.replace(/\D/g, "");
      } else if (lowerHeader.includes("mobile") || lowerHeader.includes("phone") || lowerHeader.includes("number")) {
        contact.mobile = value.replace(/\D/g, "");
      }
    });
    return contact;
  };

  // CSV parsing with PapaParse
  const parseCsvFile = (selectedFile) => {
    return new Promise((resolve) => {
      if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
        resolve(true);
        return;
      }

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const data = results.data;
          if (!data || data.length === 0) {
            setFileError("CSV file is empty or has no valid data.");
            resolve(false);
            return;
          }

          const headers = results.meta.fields;
          const hasNameHeader = headers.some(h => h.toLowerCase().includes("name"));
          const hasMobileHeader = headers.some(h =>
            h.toLowerCase().includes("mobile") || h.toLowerCase().includes("phone") || h.toLowerCase().includes("number")
          );
          if (!hasNameHeader || !hasMobileHeader) {
            setFileError("CSV must contain 'Name' and 'Mobile' columns.");
            resolve(false);
            return;
          }

          const contacts = [];
          data.forEach(row => {
            const contact = extractContactData(headers, row);
            if (contact.name && contact.mobile) {
              const cleanMobile = contact.mobile.replace(/\D/g, '');
              if (cleanMobile.length < 7) return;
              contacts.push({
                name: contact.name,
                mobile: contact.countryCode ? `${contact.countryCode}${cleanMobile}` : cleanMobile,
                countryCode: contact.countryCode || "",
                originalMobile: cleanMobile,
                timestamp: new Date().toISOString(),
              });
            }
          });

          if (contacts.length === 0) {
            setFileError("No valid contacts found in the CSV.");
            resolve(false);
            return;
          }

          selectedFile.parsedContacts = contacts;
          resolve(true);
        },
        error: function () {
          setFileError("Error parsing CSV file.");
          resolve(false);
        },
      });
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".docx")) {
      setFileError("Only .csv or .docx files are allowed.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setFileRemoved(false);

    if (selectedFile.name.endsWith(".csv")) {
      await parseCsvFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validName = validateGroupName();
    const validFile = validateFile();
    let validCsv = true;
    if (file && file.name.endsWith(".csv")) {
      validCsv = await parseCsvFile(file);
    }
    if (!validName || !validFile || !validCsv) return;

    setIsSubmitting(true);
    try {
      const customer_id = user?.customer_id;
      if (!customer_id) throw new Error("User authentication error. Please log in again.");

      const groupData = {
        id: group?.id,
        customer_id,
        group_name: name.trim(),
        description: description.trim(),
        contacts: file?.parsedContacts || [],
      };
      await onSave(groupData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Group Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setGroupNameError(""); }}
          placeholder="Enter group name"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${groupNameError ? "border-red-500" : "border-gray-300"}`}
          required
        />
        {groupNameError && <p className="text-red-500 text-sm mt-1">{groupNameError}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter group description"
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File (.csv or .docx)
        </label>
        <div
          className={`mb-2 border-2 rounded-md p-4 text-center transition-all duration-200 ${isDragging ? "border-[#0AA89E] bg-blue-50" : "border-dashed border-gray-300"}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) await handleFileChange({ target: { files: [droppedFile] } });
          }}
        >
          <input type="file" accept=".csv,.docx" onChange={handleFileChange} className="hidden" id="fileUpload" />
          <label htmlFor="fileUpload" className="cursor-pointer text-gray-500 flex flex-col items-center">
            <CloudUpload className="w-12 h-12 mb-2" />
            <p className="text-sm">Drag & drop a CSV or DOCX file here</p>
            <p className="text-xs mt-1">Max 50MB and 200K contacts allowed.</p>
          </label>

          {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}

          {file && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-sm text-green-700">{file.name}</span>
              {file.parsedContacts?.length > 0 && (
                <span className="text-sm text-green-700">Contacts found: {file.parsedContacts.length}</span>
              )}
              <button type="button" onClick={() => { setFile(null); setFileError(""); }} className="text-red-600 text-sm underline hover:text-red-800">Remove</button>
            </div>
          )}

          {!file && group?.file_name && !fileRemoved && (
            <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
              <span>
                Current file: <b>{group.file_name}</b>
                {group.total_contacts !== undefined && <> | Contacts: <b>{group.total_contacts}</b></>}
              </span>
              <button type="button" onClick={() => { setFileRemoved(true); setFileError(""); }} className="text-red-600 underline">Remove</button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            <a href="/sample.csv" download className="text-[#0AA89E] underline">Download sample CSV file</a>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md hover:text-gray-800 cursor-pointer">Cancel</button>
<button
  type="submit"
  disabled={isSubmitting || !name.trim() || !!fileError}
  className="relative px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 cursor-pointer flex items-center justify-center"
>
  {/* Spinner */}
  {isSubmitting && (
    <div className="absolute left-3 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  )}
  {/* Text */}
  {isSubmitting ? "Submitting..." : "Submit"}
</button>
      </div>
    </form>
  );
};

export default GroupForm;
