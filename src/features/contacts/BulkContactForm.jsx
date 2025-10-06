import React, { useState, useEffect } from "react";
import { CloudUpload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Papa from "papaparse";

// Define all possible fields
const ALL_FIELDS = ["First Name", "Last Name", "Full Name", "Mobile"];

// Helper function to detect if a header matches name variations
const isNameHeader = (header) => {
  if (!header) return false;
  const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameVariations = ['name', 'fullname', 'contactname', 'contact_name', 'firstname', 'lastname'];
  return nameVariations.some(variation => lowerHeader.includes(variation));
};

// Helper function to detect if headers contain first/last name variations
const hasSeparateNameFields = (headers) => {
  if (!headers || !headers.length) return false;
  const lowerHeaders = headers.map(h => h ? h.toLowerCase().replace(/[^a-z0-9]/g, '') : '');
  const hasFirst = lowerHeaders.some(h => ['first', 'fname', 'firstname'].some(v => h.includes(v)));
  const hasLast = lowerHeaders.some(h => ['last', 'lname', 'lastname', 'surname'].some(v => h.includes(v)));
  return hasFirst && hasLast;
};

const REQUIRED_FIELDS = [
  { name: "Mobile", description: "Mobile number" },
  { 
    name: "Name", 
    description: "Name (either 'First Name' + 'Last Name' or 'Full Name')",
    validate: (mapping) => mapping["First Name"] || mapping["Full Name"]
  }
];

export default function BulkContactForm({
  setFile,
  file,
  fieldMapping,
  setFieldMapping,
  onDataExtracted,
}) {
  const [countryCode, setCountryCode] = useState({ dialCode: "91", countryCode: "in" });
  const { user } = useAuth();
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldsToShow, setFieldsToShow] = useState(ALL_FIELDS);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setCsvHeaders([]);
      setFieldMapping({});
    }
  }, [file, setFieldMapping]);

  // Process and validate contact data
  const prepareContactsData = (csvData, mapping, currentCountry) => {
    return csvData
      .map((row, index) => {
        const getMappedValue = (fieldName) => {
          const header = mapping[fieldName];
          if (!header) return "";
          return row[header] || "";
        };

        const firstName = (getMappedValue("First Name") || "").toString().trim();
        const lastName = (getMappedValue("Last Name") || "").toString().trim();
        const fullName = mapping["Full Name"] ? (getMappedValue("Full Name") || "").toString().trim() : "";
        
        let processedFirstName = firstName;
        let processedLastName = lastName;
        
        if (fullName && (!firstName && !lastName)) {
          processedFirstName = fullName;
          processedLastName = "";
        } else if (fullName && (!firstName || !lastName)) {
          if (!processedFirstName) processedFirstName = fullName;
          if (!processedLastName) processedLastName = "";
        }

        let mobile = (getMappedValue("Mobile") || "").toString().trim();
        mobile = mobile.replace(/[^0-9]/g, ""); // Remove non-digits
        if (mobile.startsWith(currentCountry.dialCode)) {
          mobile = mobile.substring(currentCountry.dialCode.length);
        } else if (mobile.startsWith("0")) {
          mobile = mobile.substring(1);
        }

        const hasName = processedFirstName;
        const hasValidMobile = mobile.length >= 8;

        if (!hasName || !hasValidMobile) {
          console.warn(`Skipping row ${index + 2}: ${!hasName ? "Missing name" : ""} ${!hasValidMobile ? `Invalid mobile: ${mobile}` : ""}`);
          return null;
        }

        let fullNameForBackend = '';
        if (fullName) {
          fullNameForBackend = fullName;
        } else if (processedFirstName && processedLastName) {
          fullNameForBackend = `${processedFirstName} ${processedLastName}`.trim();
        } else {
          fullNameForBackend = processedFirstName || '';
        }

        const contactData = {
          fullName: fullNameForBackend,
          mobile,
          country_code: `+${currentCountry.dialCode}`,
          _row: index + 2,
          _hasErrors: !hasName || !hasValidMobile,
          _errors: [
            !hasName ? 'Name is required (either First Name or Full Name)' : null,
            !hasValidMobile ? 'Valid mobile number is required' : null
          ].filter(Boolean)
        };

        console.log('Contact data:', contactData);
        return contactData;
      })
      .filter(contact => contact && !contact._hasErrors);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }
    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta, errors }) => {
        if (errors.length > 0) {
          console.error("CSV parsing errors:", errors);
          alert("Error parsing CSV file. Please check the format.");
          return;
        }

        const headers = meta.fields.filter((header) => header.trim());
        if (headers.length === 0) {
          alert("No headers found in CSV.");
          return;
        }

        console.log("CSV headers:", headers);
        setCsvHeaders(headers);

        // Determine fields to show
        const hasFullName = headers.some(header => ['name', 'fullname'].some(v => header.toLowerCase().replace(/[^a-z0-9]/g, '') === v));
        const hasSeparateNames = hasSeparateNameFields(headers);
        let fields = [...ALL_FIELDS];
        if (hasFullName && !hasSeparateNames) {
          fields = fields.filter(field => field !== 'First Name' && field !== 'Last Name');
        } else if (hasSeparateNames) {
          fields = fields.filter(field => field !== 'Full Name');
        }
        setFieldsToShow(fields);

        // Auto-map fields
        const fieldNameVariations = {
          "First Name": ["firstname", "first name", "fname", "first"],
          "Last Name": ["lastname", "last name", "lname", "last", "surname"],
          "Full Name": ["name", "fullname", "full name", "contact name", "contact_name", "full_name"],
          Mobile: ["mobile", "phone", "phonenumber", "phone number", "contact", "contact number", "number"],
        };

        const defaultMapping = {};
        fields.forEach((field) => {
          const variations = [field.toLowerCase(), ...(fieldNameVariations[field] || [])];
          const match = headers.find((header) => {
            const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
            return variations.some(
              (variation) =>
                lowerHeader === variation.replace(/ /g, "") ||
                lowerHeader.includes(variation.replace(/ /g, ""))
            );
          });
          if (match) defaultMapping[field] = match;
        });

        console.log("Default mapping:", defaultMapping);
        setFieldMapping(defaultMapping);

        // Validate required fields
        const missingRequiredFields = REQUIRED_FIELDS.filter(field => {
          if (field.validate) return !field.validate(defaultMapping);
          return !defaultMapping[field.name];
        });

        if (missingRequiredFields.length > 0) {
          alert(`Missing required fields: ${missingRequiredFields.map(f => f.description).join(', ')}`);
          setCsvHeaders([]);
          setFieldMapping({});
          return;
        }

        console.log('Parsed CSV data:', data);
        const contacts = prepareContactsData(data, defaultMapping, countryCode);
        console.log('Extracted contacts:', contacts);
        if (onDataExtracted) {
          onDataExtracted(contacts);
        }
      },
      error: (error) => {
        console.error("File reading error:", error);
        alert("Failed to read CSV file.");
      }
    });
  };

  const handleMappingChange = (expectedField, selectedColumn) => {
    const newMapping = { ...fieldMapping, [expectedField]: selectedColumn };
    console.log("New mapping:", newMapping);
    setFieldMapping(newMapping);

    if (file && Object.keys(newMapping).length === fieldsToShow.length) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => {
          const contacts = prepareContactsData(data, newMapping, countryCode);
          console.log('Extracted contacts:', contacts);
          if (onDataExtracted) {
            onDataExtracted(contacts);
          }
        }
      });
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      ["FullName", "Mobile"],
      ["John Doe", "9876543210"],
      ["Jane Smith", "9876543211"],
      ["Bob Johnson", "9876543212"],
    ];
    const csvContent = Papa.unparse(sampleData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "BulkContactSample.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Sample File Download */}
      <div className="text-right mb-4">
        <button
          onClick={handleDownloadSample}
          className="text-[#0AA89E] text-sm hover:underline flex items-center gap-1 ml-auto"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Sample CSV
        </button>
      </div>

      {/* File Upload */}
      <div
        className={`mb-6 border-2 rounded-md p-4 sm:p-6 text-center transition-all duration-200 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300"
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
            handleFileChange({ target: { files: [droppedFile] } });
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
            Drag & drop a CSV file here, or <span className="underline">browse</span>
          </p>
          <p className="text-xs mt-1">Max 50MB and 200K contacts allowed.</p>
        </label>

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

      {/* Country Code Selector */}
      {csvHeaders.length > 0 && (
        <div className="mt-6 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2 text-start">
              Select Default Country
            </label>
            <PhoneInput
              country={countryCode.countryCode}
              onlyCountries={["in", "us", "gb", "ca", "au", "nz", "ae", "sa", "sg", "my"]}
              countryCodeEditable={false}
              value={`+${countryCode.dialCode}`}
              onChange={(value, country) => {
                const newCode = {
                  dialCode: country.dialCode,
                  countryCode: country.countryCode,
                };
                setCountryCode(newCode);
                if (file && Object.keys(fieldMapping).length === fieldsToShow.length) {
                  Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: ({ data }) => {
                      const contacts = prepareContactsData(data, fieldMapping, newCode);
                      console.log('Extracted contacts after country change:', contacts);
                      if (onDataExtracted) onDataExtracted(contacts);
                    }
                  });
                }
              }}
              inputStyle={{
                width: "100%",
                height: "38px",
                fontSize: "0.875rem",
                borderRadius: "0.375rem",
                border: "1px solid #D1D5DB",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
                paddingLeft: "52px",
              }}
              inputProps={{ readOnly: true }}
            />
            <p className="text-xs text-gray-500 mt-1 text-start">
              This country code will be applied to all imported numbers.
            </p>
          </div>
        </div>
      )}

      {/* Mapping Section */}
      {csvHeaders.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Map to Contact Fields
          </h3>
          <div className="space-y-6">
            {fieldsToShow.map((field) => (
              <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                </div>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}