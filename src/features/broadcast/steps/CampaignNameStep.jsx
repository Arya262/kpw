import React from "react";
import {
 Box,
 TextField,
 Typography,
} from "@mui/material";

const CampaignNameStep = ({
 formData,
 handleInputChange,
 validationErrors,
 isSubmitting
}) => (
 <Box display="flex" flexDirection="column" gap={{ xs: 2, sm: 0.5, md: 1 ,lg:1 }} p={{ xs: 1, sm: 0, md: 1 }}>
  <Typography variant="h6" fontWeight="bold" color="text.primary" fontSize={{ xs: "1rem", sm: "1.125rem", md: "1rem" , lg: "1.2rem" }}>
   Campaign Name
  </Typography>
<TextField 
  name="broadcastName" 
  label="Campaign Name" 
  placeholder="Enter Campaign Name" 
  value={formData.broadcastName} 
  onChange={handleInputChange} 
  fullWidth 
  disabled={isSubmitting} 
  inputProps={{ maxLength: 30 }} 
  size="small"
  sx={{
    "& label.Mui-focused": {
      color: "#0AA89E",   // label color when focused
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "#0AA89E", // border color when focused
      },
    },
  }}
/>
  <Box display="flex" justifyContent="flex-end" fontSize={{ xs: "10px", sm: "11px", md: "12px" }} color="text.secondary" mt={{xs:"-1" ,sm:"-1",md:"-2" , lg:"-2" }}>
   {formData.broadcastName.length}/30
  </Box>
  <Box 
   border="1px dashed #D97706" 
   bgcolor="#FFF7ED" 
   p={{ xs: 1, sm: 1.5, md: 1 ,lg:2 }} 
   borderRadius="8px" 
   display="flex" 
   flexDirection="column" 
   gap={0.5} 
   color="#92400E" 
   fontSize={{ xs: "12px", sm: "13px", md: "14px" }} 
   width="100%"
   sx={{ wordBreak: "break-word" }}
  >
   <Box fontWeight="bold" display="flex" alignItems="center" gap={0.5}>
    <span style={{ color: "#B45309" }}>⚠️</span> IMPORTANT:
   </Box>
   <Box>
    WhatsApp messages can only be sent to customers who have allowed
    (given consent) to your business to receive messages.
   </Box>
   <Box>Messages can be informational ℹ️ or semi-promotional ℹ️</Box>
  </Box>
 </Box>
);

export default CampaignNameStep;