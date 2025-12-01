import { useState, useEffect } from "react";
import { Upload, Download, FileText, X, Globe, Tag } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Papa from "papaparse";
import TagSelector from "../tags/components/TagSelector";

const ALL_FIELDS = ["First Name", "Last Name", "Full Name", "Mobile"];

const hasSeparateNameFields = (headers) => {
  if (!headers || !headers.length) return false;
  const lowerHeaders = headers.map((h) => (h ? h.toLowerCase().replace(/[^a-z0-9]/g, "") : ""));
  const hasFirst = lowerHeaders.some((h) => ["first", "fname", "firstname"].some((v) => h.includes(v)));
  const hasLast = lowerHeaders.some((h) => ["last", "lname", "lastname", "surname"].some((v) => h.includes(v)));
  return hasFirst && hasLast;
};

const REQUIRED_FIELDS = [
  { name: "Mobile", description: "Mobile number" },
  { name: "Name", description: "Name", validate: (mapping) => mapping["First Name"] || mapping["Full Name"] },
];

export default function BulkContactForm({
  setFile,
  file,
  fieldMapping,
  setFieldMapping,
  onDataExtracted,
  selectedTags = [],
  setSelectedTags,
  fileError = "",
  contactsError = "",
}) {
  const [countryCode, setCountryCode] = useState({ dialCode: "91", countryCode: "in" });
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldsToShow, setFieldsToShow] = useState(ALL_FIELDS);
  const [isDragging, setIsDragging] = useState(false);
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    if (!file) {
      setCsvHeaders([]);
      setFieldMapping({});
      setContactCount(0);
    }
  }, [file, setFieldMapping]);

  const prepareContactsData = (csvData, mapping, currentCountry) => {
    return csvData
      .map((row, index) => {
        const getMappedValue = (fieldName) => {
          const header = mapping[fieldName];
          return header ? row[header] || "" : "";
        };

        const firstName = (getMappedValue("First Name") || "").toString().trim();
        const lastName = (getMappedValue("Last Name") || "").toString().trim();
        const fullName = mapping["Full Name"] ? (getMappedValue("Full Name") || "").toString().trim() : "";

        let processedFirstName = firstName || fullName;
        let mobile = (getMappedValue("Mobile") || "").toString().trim().replace(/[^0-9]/g, "");
        
        if (mobile.startsWith(currentCountry.dialCode)) {
          mobile = mobile.substring(currentCountry.dialCode.length);
        } else if (mobile.startsWith("0")) {
          mobile = mobile.substring(1);
        }

        if (!processedFirstName || mobile.length < 8) return null;

        const fullNameForBackend = fullName || `${firstName} ${lastName}`.trim() || processedFirstName;

        return {
          fullName: fullNameForBackend,
          mobile,
          country_code: `+${currentCountry.dialCode}`,
          _row: index + 2,
        };
      })
      .filter(Boolean);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }
    setFile(selectedFile);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const headers = meta.fields.filter((h) => h.trim());
        if (!headers.length) {
          alert("No headers found in CSV.");
          return;
        }

        setCsvHeaders(headers);

        const hasFullName = headers.some((h) => ["name", "fullname"].includes(h.toLowerCase().replace(/[^a-z0-9]/g, "")));
        const hasSeparateNames = hasSeparateNameFields(headers);
        let fields = [...ALL_FIELDS];
        if (hasFullName && !hasSeparateNames) {
          fields = fields.filter((f) => f !== "First Name" && f !== "Last Name");
        } else if (hasSeparateNames) {
          fields = fields.filter((f) => f !== "Full Name");
        }
        setFieldsToShow(fields);

        const fieldNameVariations = {
          "First Name": ["firstname", "first name", "fname", "first"],
          "Last Name": ["lastname", "last name", "lname", "last", "surname"],
          "Full Name": ["name", "fullname", "full name", "contact name"],
          Mobile: ["mobile", "phone", "phonenumber", "phone number", "number"],
        };

        const defaultMapping = {};
        fields.forEach((field) => {
          const variations = [field.toLowerCase(), ...(fieldNameVariations[field] || [])];
          const match = headers.find((h) => {
            const lowerH = h.toLowerCase().replace(/[^a-z0-9]/g, "");
            return variations.some((v) => lowerH === v.replace(/ /g, "") || lowerH.includes(v.replace(/ /g, "")));
          });
          if (match) defaultMapping[field] = match;
        });

        setFieldMapping(defaultMapping);

        const contacts = prepareContactsData(data, defaultMapping, countryCode);
        setContactCount(contacts.length);
        onDataExtracted?.(contacts);
      },
    });
  };

  const handleMappingChange = (field, value) => {
    const newMapping = { ...fieldMapping, [field]: value };
    setFieldMapping(newMapping);

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => {
          const contacts = prepareContactsData(data, newMapping, countryCode);
          setContactCount(contacts.length);
          onDataExtracted?.(contacts);
        },
      });
    }
  };

  const handleDownloadSample = () => {
    const csvContent = Papa.unparse([
      ["FullName", "Mobile"],
      ["John Doe", "9876543210"],
      ["Jane Smith", "9876543211"],
    ]);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_contacts.csv";
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Download Sample */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700"
        >
          <Download size={14} />
          Download Sample CSV
        </button>
      </div>

      {/* File Upload Area */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Upload size={16} className="text-gray-400" />
          CSV File <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            fileError 
              ? "border-red-500 bg-red-50" 
              : isDragging 
                ? "border-teal-500 bg-teal-50" 
                : file 
                  ? "border-green-400 bg-green-50" 
                  : "border-gray-200 hover:border-gray-300"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileChange({ target: { files: e.dataTransfer.files } });
          }}
        >
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csvUpload" />
          
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText size={24} className="text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className={`text-sm ${contactsError ? "text-red-600" : "text-green-600"}`}>
                  {contactsError || `${contactCount} valid contacts found`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="ml-4 p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <label htmlFor="csvUpload" className="cursor-pointer">
              <Upload size={32} className={`mx-auto mb-3 ${fileError ? "text-red-400" : "text-gray-400"}`} />
              <p className="text-gray-600 mb-1">
                Drag & drop your CSV file here, or <span className="text-teal-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400">Supports CSV files up to 50MB</p>
            </label>
          )}
        </div>
        {fileError && (
          <p className="mt-1 text-xs text-red-500">{fileError}</p>
        )}
      </div>

      {/* Country Code & Mapping */}
      {csvHeaders.length > 0 && (
        <>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Globe size={16} className="text-gray-400" />
              Default Country Code
            </label>
            <PhoneInput
              country={countryCode.countryCode}
              onlyCountries={["in", "us", "gb", "ca", "au", "ae", "sg"]}
              value={`+${countryCode.dialCode}`}
              onChange={(_, country) => {
                const newCode = { dialCode: country.dialCode, countryCode: country.countryCode };
                setCountryCode(newCode);
                if (file) {
                  Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: ({ data }) => {
                      const contacts = prepareContactsData(data, fieldMapping, newCode);
                      setContactCount(contacts.length);
                      onDataExtracted?.(contacts);
                    },
                  });
                }
              }}
              inputStyle={{
                width: "100%",
                height: "44px",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                paddingLeft: "52px",
              }}
              inputProps={{ readOnly: true }}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Map CSV Columns</h4>
            <div className="space-y-3">
              {fieldsToShow.map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600">{field}</span>
                  <select
                    value={fieldMapping[field] || ""}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select column</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tags */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Tag size={16} className="text-gray-400" />
          Tags
          <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={(tags) => setSelectedTags && setSelectedTags(tags)}
          placeholder="Select or create tags..."
          allowCreate={true}
        />
        <p className="mt-1 text-xs text-gray-400">Tags will be applied to all imported contacts</p>
      </div>
    </div>
  );
}
