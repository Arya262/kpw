import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import { getMessageLimit } from "../utils/messageLimits";

const GroupSelectionStep = ({
  formData,
  setFormData,
  customerLists,
  validationErrors,
  isSubmitting,
  loading,
  customerSearchTerm,
  setCustomerSearchTerm,
  showList,
  setShowList,
  warningMessage,
  setWarningMessage,
  user,
  wabaInfo,
}) => {
  const selectedCount = formData.group_id?.length || 0;
  const [selectedGroupId, setSelectedGroupId] = useState(
    formData.group_id?.[0] || null
  );

  // Filter customer lists by search term
  const filteredCustomerLists = customerLists.filter((c) =>
    c.group_name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const messageLimit = getMessageLimit(wabaInfo);
  const totalContacts = selectedGroupId
    ? customerLists?.find((g) => g.group_id === selectedGroupId)
        ?.total_contacts || 0
    : 0;

  const handleGroupChange = (customer) => {
    if (selectedGroupId === customer.group_id) {
      setSelectedGroupId(null);
      setFormData((prev) => ({ ...prev, group_id: [] }));
    } else {
      if (customer.total_contacts > messageLimit) {
        setWarningMessage(
          `Selecting "${
            customer.group_name
          }" exceeds the ${messageLimit.toLocaleString()} contact limit.`
        );
        setTimeout(() => setWarningMessage(""), 3000);
        return;
      }
      setSelectedGroupId(customer.group_id);
      setFormData((prev) => ({ ...prev, group_id: [customer.group_id] }));
      setWarningMessage("");
    }
    setShowList(false);
  };

  return (
    <Box
      display="flex"
      gap={6}
      p={1}
      flexDirection={{ xs: "column", md: "row" }}
    >
      {/* Left Circle / Tier */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          minWidth: 250,
          textAlign: "center",
          mb: { xs: 2, md: 0 },
        }}
      >
        <Box
          position="relative"
          width={120}
          height={120}
          borderRadius="50%"
          border="8px solid #E5E7EB"
          display="flex"
          alignItems="center"
          justifyContent="center"
          margin="0 auto"
          mb={5}
          sx={{
            "&::before": {
              content: '""',
              position: "absolute",
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              padding: "8px",
              background: `conic-gradient(
                #10B981 0% ${Math.min(
                  (totalContacts / messageLimit) * 100,
                  100
                )}%,
                transparent ${Math.min(
                  (totalContacts / messageLimit) * 100,
                  100
                )}% 100%
              )`,
              borderRadius: "50%",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            zIndex={1}
            bgcolor="white"
            width="100%"
            height="100%"
            borderRadius="50%"
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color={totalContacts > messageLimit ? "error.main" : "#10B981"}
            >
              {totalContacts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {messageLimit.toLocaleString()} contacts
            </Typography>
          </Box>
        </Box>
        <Typography mt={2} variant="body2" color="textSecondary">
          {wabaInfo?.messagingLimit
            ? `TIER ${wabaInfo.messagingLimit}`
            : "TIER 2"}
        </Typography>
        <Typography variant="body2" mt={1} color="text.secondary">
          You can send up to {messageLimit.toLocaleString()} unique contacts in
          24 hrs
        </Typography>
      </Box>

      {/* Right List */}
      <Box flex={1} display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Select List
        </Typography>

        {warningMessage && (
          <Typography color="error" variant="body2">
            {warningMessage}
          </Typography>
        )}

        {!showList ? (
          <Box
            onClick={() => setShowList((prev) => !prev)}
            sx={{
              border: "1px solid #E5E7EB",
              backgroundColor: "#FAFAFA",
              borderRadius: "8px",
              padding: "12px 16px",
              minHeight: "56px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              "&:hover": { borderColor: "#CBD5E1" },
            }}
          >
            <Typography
              color={selectedCount > 0 ? "text.primary" : "text.secondary"}
            >
              {selectedCount > 0
                ? `${selectedCount} list${
                    selectedCount > 1 ? "s" : ""
                  } with ${totalContacts} customers selected`
                : `Select list (max ${messageLimit.toLocaleString()} contacts)`}
            </Typography>
            <ArrowDropDownIcon />
          </Box>
        ) : (
          <>
            <TextField
              placeholder="Search contact lists"
              variant="outlined"
              size="small"
              fullWidth
              value={customerSearchTerm}
              onChange={(e) => {
                setCustomerSearchTerm(e.target.value);
              }}
              sx={{
                "& label.Mui-focused": {
                  color: "#0AA89E",
                },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#0AA89E",
                  },
                },
                "& .MuiInputBase-input": {
                  caretColor: "#0AA89E",
                },
              }}
            />
            <Box
              border="1px solid #E5E7EB"
              borderRadius="8px"
              overflow="auto"
              maxHeight="200px"
              p={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent={
                filteredCustomerLists.length === 0 ? "center" : "flex-start"
              }
              sx={{ scrollbarWidth: "none" }}
            >
              {filteredCustomerLists.length === 0 ? (
                <Box textAlign="center" color="text.secondary">
                  <FolderOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                  <Typography>No results</Typography>
                </Box>
              ) : (
                filteredCustomerLists.map((customer) => (
                  <Box
                    key={customer.group_id}
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    py={1}
                    borderBottom="1px solid #F3F4F6"
                    width="100%"
                    onClick={() => handleGroupChange(customer)}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedGroupId === customer.group_id}
                          onChange={() => {}}
                          disabled={isSubmitting || loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight="medium">
                            {`${customer.group_name} (${customer.total_contacts} contacts)`}
                          </Typography>
                          {customer.initial_contacts && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Initial contacts: {customer.initial_contacts}
                              {customer.unsubscribed_contacts
                                ? ` | Unsubscribed contacts: ${customer.unsubscribed_contacts}`
                                : ""}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </Box>
                ))
              )}
            </Box>
          </>
        )}

        {validationErrors.group_id && (
          <Typography color="error" variant="body2" mt={1}>
            {validationErrors.group_id}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default GroupSelectionStep;
