import React from "react";
import ScheduleSelector from "../components/ScheduleSelector";
import ClickToUpgrade from "../../../components/ClickToUpgrade";

const ScheduleCampaignStep = ({
  formData,
  handleRadioChange,
  selectedDate,
  setSelectedDate,
  validationErrors,
  setValidationErrors,
  isSubmitting
}) => (
  <ClickToUpgrade permission="canScheduleBroadcast">
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">
      Schedule Campaign
    </h3>
    <ScheduleSelector
      formData={formData}
      handleRadioChange={handleRadioChange}
      selectedDate={selectedDate}
      setSelectedDate={(date) => {
        setSelectedDate(date);
        setValidationErrors((prev) => ({ ...prev, schedule: "" }));
      }}
      disabled={isSubmitting}
    />
    {validationErrors.schedule && (
      <p className="text-red-500 text-sm">{validationErrors.schedule}</p>
    )}
  </div>
  </ClickToUpgrade>
);

export default ScheduleCampaignStep;