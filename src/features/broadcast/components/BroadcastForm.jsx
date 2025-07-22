
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScheduleSelector from './ScheduleSelector';
import MessageTypeSelector from './MessageTypeSelector';

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
  const [errors, setErrors] = useState({});
  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedTemplate) {
      onTemplateSelect(location.state.selectedTemplate);
    }
  }, [location.state, onTemplateSelect]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.broadcastName.trim()) {
      newErrors.broadcastName = 'Broadcast name is required';
    }

    if (!formData.group_id || formData.group_id === "") {
      newErrors.group_id = 'Please select a group';
    }

    if (!formData.selectedTemplate) {
      newErrors.template = 'Please select a template';
    }

    if (formData.schedule === 'Yes' && !selectedDate) {
      newErrors.schedule = 'Please select a date and time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-1/2">
          <input
            type="text"
            name="broadcastName"
            placeholder="BroadcastName"
            value={formData.broadcastName}
            onChange={handleInputChange}
            className={`w-full p-2 border ${errors.broadcastName ? 'border-red-500' : 'border-[#606060]'} rounded text-gray-500 focus:outline-none`}
            required
            disabled={isSubmitting}
          />
          {errors.broadcastName && (
            <p className="text-red-500 text-sm mt-1">{errors.broadcastName}</p>
          )}
        </div>
        <div className="w-full sm:w-1/2">
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleInputChange}
            className={`w-full p-2 border ${errors.group_id ? 'border-red-500' : 'border-[#606060]'} rounded text-gray-500 focus:outline-none`}
            required
            disabled={isSubmitting}
          >
            <option value="">Select Group</option>
            {loading ? (
              <option>Loading...</option>
            ) : error ? (
              <option>{error}</option>
            ) : (
              customerLists.map((customer) => (
                <option key={customer.group_id} value={customer.group_id}>
                  {customer.group_name}
                </option>
              ))
            )}
          </select>
          {errors.group_id && (
            <p className="text-red-500 text-sm mt-1">{errors.group_id}</p>
          )}
        </div>
      </div>

      <MessageTypeSelector 
        formData={formData} 
        handleRadioChange={handleRadioChange}
        disabled={isSubmitting}
      />

      <div>
        <div className="flex items-start gap-4">
          <button
            type="button"
            className={`w-[200px] px-4 py-2 border border-[#0AA89E] text-[#0AA89E] text-[15px] font-medium rounded cursor-pointer ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0AA89E] hover:text-white'
            }`}
            onClick={openTemplate}
            disabled={isSubmitting}
          >
            {formData.selectedTemplate ? 'Change Template' : 'Select Template'}
          </button>

          {formData.selectedTemplate && (
            <div className="w-[460px] max-h-[200px] p-4 border border-gray-200 rounded-md bg-gray-50 overflow-y-auto mx-auto absolute right-2 top-[131px]">
              <div className="space-y-2">
              <p className="text-sm text-gray-600">{formData.selectedTemplate.element_name}</p>

                {formData.selectedTemplate.container_meta?.header && (
                  <p className="text-sm text-gray-600 p-2">
                    {formData.selectedTemplate.container_meta.header}
                  </p>
                )}

                {formData.selectedTemplate.container_meta?.data && (
                  <p className="text-sm text-gray-600 p-2">
                    {formData.selectedTemplate.container_meta.data}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        {errors.template && (
          <p className="text-red-500 text-sm mt-1">{errors.template}</p>
        )}

        {isTemplateOpen && (
          <>
            <div className="fixed inset-0 backdrop-blur-sm z-40" />
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <SendTemplate
                onClose={closeTemplate}
                onSelect={(template) => {
                  onTemplateSelect(template);
                  setErrors(prev => ({ ...prev, template: '' }));
                }}
                returnFullTemplate={true}
              />
            </div>
          </>
        )}
      </div>

      <ScheduleSelector
        formData={formData}
        handleRadioChange={handleRadioChange}
        selectedDate={selectedDate}
        setSelectedDate={(date) => {
          setSelectedDate(date);
          setErrors(prev => ({ ...prev, schedule: '' }));
        }}
        disabled={isSubmitting}
      />
      {errors.schedule && (
        <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>
      )}

      <div className="mt-4 text-left">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-[20%] py-2 rounded transition-all duration-200 flex items-center justify-center cursor-pointer ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#0AA89E] hover:bg-teal-600 text-white'
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