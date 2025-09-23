import React from "react";

const InformationCards = ({ formData }) => {
  console.log('InformationCards formData:', formData);
  return (
  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
      {/* Template Messaging Tier */}
      <div>
        <p className="text-sm font-medium text-gray-500">Template Messaging Tier</p>
        <p className="text-base font-semibold text-gray-900">
          Tier 0 <span className="text-gray-500 text-sm">(250/24 Hours)</span>
        </p>
      </div>

      {/* Remaining Quota */}
      <div>
        <p className="text-sm font-medium text-gray-500">Remaining Quota</p>
        <p className="text-base font-semibold text-gray-900">250</p>
      </div>

      {/* Selected Audience */}
      <div>
        <p className="text-sm font-medium text-gray-500">Selected Audience</p>
        <p className="text-base font-semibold text-gray-900">
          {formData.directContacts
            ? formData.directContacts.length.toLocaleString()
            : formData.group_id?.length > 0
            ? formData.group_id.reduce((sum, groupId) => {
                const group = formData.customerLists?.find(g => g.group_id === groupId);
                return sum + (group?.total_contacts || 0);
              }, 0).toLocaleString()
            : "0"}
        </p>
      </div>
      
      {/* Final Audience */}
      <div>
        <p className="text-sm font-medium text-gray-500">Final Audience</p>
        <p className="text-base font-semibold text-gray-900">
          {formData.directContacts
            ? formData.directContacts.length.toLocaleString()
            : formData.group_id?.length > 0
            ? formData.group_id.reduce((sum, groupId) => {
                const group = formData.customerLists?.find(g => g.group_id === groupId);
                return sum + (group?.total_contacts || 0);
              }, 0).toLocaleString()
            : "0"}
        </p>
      </div>
    </div>
  </div>
  );
}

export default InformationCards;