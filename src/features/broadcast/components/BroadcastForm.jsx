import React from 'react';
import MessageTypeSelector from './MessageTypeSelector';
import RegularMessage from './RegularMessage';
import ScheduleSelector from './ScheduleSelector';

const BroadcastForm = ({
  formData,
  handleInputChange,
  handleRadioChange,
  handleMediaChange,
  selectedDate,
  setSelectedDate,
  isTemplateOpen,
  openTemplate,
  closeTemplate,
  SendTemplate,
  loading,
  error,
  customerLists,
  onSubmit,
  isSubmitting,
  onTemplateSelect
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          name="broadcastName"
          placeholder="BroadcastName"
          value={formData.broadcastName}
          onChange={handleInputChange}
          className="w-full sm:w-1/2 p-2 border border-[#606060] rounded text-gray-500 focus:outline-none"
          required
          disabled={isSubmitting}
        />
        <select
          name="customerList"
          value={formData.customerList}
          onChange={handleInputChange}
          className="w-full sm:w-1/2 p-2 border border-[#606060] rounded text-gray-500 focus:outline-none"
          required
          disabled={isSubmitting}
        >
          <option value="Select Customer List">Select Customer List</option>
          {loading ? (
            <option>Loading...</option>
          ) : error ? (
            <option>{error}</option>
          ) : (
            customerLists.map((customer, group_id) => (
              <option key={group_id} value={customer.group_name}>
                {customer.group_name}
              </option>
            ))
          )}
        </select>
      </div>

      <MessageTypeSelector 
        formData={formData} 
        handleRadioChange={handleRadioChange}
        disabled={isSubmitting}
      />

      {formData.messageType === "Pre-approved template message" && (
        <div>
          <button
            type="button"
            className={`w-full sm:w-auto px-4 py-2 border border-[#0AA89E] text-[#0AA89E] text-[15px] font-medium rounded ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0AA89E] hover:text-white'
            }`}
            onClick={openTemplate}
            disabled={isSubmitting}
          >
            {formData.selectedTemplate ? 'Change Template' : 'Select Template'}
          </button>

          {formData.selectedTemplate && (
            <div className="mt-2 p-3 border border-gray-200 rounded-md">
              <h4 className="font-medium text-gray-700">Selected Template:</h4>
              <p className="text-sm text-gray-600">{formData.selectedTemplate.element_name}</p>
              {formData.selectedTemplate.container_meta?.header && (
                <p className="text-sm text-gray-600 mt-1">Header: {formData.selectedTemplate.container_meta.header}</p>
              )}
              {formData.selectedTemplate.container_meta?.data && (
                <p className="text-sm text-gray-600 mt-1">Content: {formData.selectedTemplate.container_meta.data}</p>
              )}
            </div>
          )}

          {isTemplateOpen && (
            <>
              <div className="fixed inset-0 backdrop-blur-sm z-40" />
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <SendTemplate
                  onClose={closeTemplate}
                  onSelect={(template) => {
                    onTemplateSelect(template);
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {formData.messageType === "Regular Message" && (
        <RegularMessage
          formData={formData}
          handleInputChange={handleInputChange}
          handleMediaChange={handleMediaChange}
          disabled={isSubmitting}
        />
      )}

      <ScheduleSelector
        formData={formData}
        handleRadioChange={handleRadioChange}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        disabled={isSubmitting}
      />

      <div className="mt-4 text-left">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-[20%] py-2 rounded transition-all duration-200 flex items-center justify-center ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-500 hover:bg-teal-600 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            'Add Broadcast'
          )}
        </button>
      </div>
    </form>
  );
};

export default BroadcastForm; 