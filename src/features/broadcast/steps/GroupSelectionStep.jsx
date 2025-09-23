import React from "react";
import {
  Box,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FolderOffIcon from "@mui/icons-material/FolderOff";

const GroupSelectionStep = ({
  formData,
  setFormData,
  customerLists,
  validationErrors,
  isSubmitting,
  loading,
  customerSearchTerm,
  setCustomerSearchTerm,
  filteredCustomerLists,
  warningMessage,
  setWarningMessage,
  showList,
  setShowList
}) => {
  const selectedCount = formData.group_id?.length || 0;
  const totalContacts = formData.group_id?.reduce((sum, id) => {
    const group = customerLists?.find(g => g.group_id === id);
    return sum + (group?.total_contacts || 0);
  }, 0) || 0;

  const handleGroupChange = (customer, isChecked) => {
    const selectedGroups = customerLists?.filter((c) =>
      formData.group_id.includes(c.group_id)
    ) || [];
    const totalSelectedContacts = selectedGroups.reduce(
      (sum, group) => sum + (group.total_contacts || 0),
      0
    );
    
    if (isChecked && totalSelectedContacts + customer.total_contacts > 250) {
      setWarningMessage(`Selecting "${customer.group_name}" would exceed the 250 contact limit.`);
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }
    
    setWarningMessage("");
    setFormData((prev) => ({
      ...prev,
      group_id: isChecked
        ? [...prev.group_id, customer.group_id]
        : prev.group_id.filter((id) => id !== customer.group_id),
    }));
    setShowList(false);
  };

  return (
    <Box display="flex" gap={6} p={2} flexDirection={{ xs: "column", sm: "column", md: "row" }}>
      <Box sx={{ 
        display: { xs: "none", sm: "none", md: "block" }, 
        minWidth: { md: "250px" }, 
        textAlign: "center", 
        mb: { xs: 2, sm: 2, md: 0 }, 
      }}>
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
          mb={8}
          sx={{
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              padding: '8px',
              background: `conic-gradient(
                #10B981 0% ${Math.min((totalContacts / 250) * 100, 100)}%,
                transparent ${Math.min((totalContacts / 250) * 100, 100)}% 100%
              )`,
              borderRadius: '50%',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            }
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
              color={totalContacts > 250 ? "error.main" : "#10B981"}
            >
              {totalContacts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of 250
            </Typography>
          </Box>
        </Box>
        <Typography mt={2} variant="body2" color="textSecondary">
          TIER #250
        </Typography>
        <Typography variant="body2" mt={1} color="text.secondary">
          You can only send up to 250 messages in 24 hrs
        </Typography>
      </Box>
      
      <Box flex={1} display="flex" flexDirection="column" gap={2}>
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
            <Typography color={selectedCount > 0 ? "text.primary" : "text.secondary"}>
              {selectedCount > 0
                ? `${selectedCount} list${selectedCount > 1 ? "s" : ""} with ${totalContacts} customers selected`
                : `Select list (max 250 contacts)`}
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
              onChange={(e) => setCustomerSearchTerm(e.target.value)} 
            />
            <Box 
              border="1px solid #E5E7EB" 
              borderRadius="8px" 
              height="300px" 
              overflow="auto" 
              p={2} 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent={filteredCustomerLists.length === 0 ? "center" : "flex-start"}
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
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.group_id.includes(customer.group_id)}
                          onChange={(e) => handleGroupChange(customer, e.target.checked)}
                          disabled={isSubmitting || loading}
                        />
                      }
                      label={
                        <Box>
                          <Typography fontWeight="medium">
                            {`${customer.group_name} (${customer.total_contacts} contacts)`}
                          </Typography>
                          {customer.initial_contacts && (
                            <Typography variant="caption" color="text.secondary">
                              Initial contacts: {customer.initial_contacts}
                              {customer.unsubscribed_contacts
                                ? ` | Unsubscribed contacts: ${customer.unsubscribed_contacts}`
                                : ""}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box px={1} py={0.5} border="1px dashed #10B981" borderRadius="4px" fontSize="12px" color="#10B981" alignSelf="center">
                      Exported data
                    </Box>
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