import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import { FiSearch } from 'react-icons/fi';

export default function PhoneInput({
  phone, setPhone, selectedCountry, setSelectedCountry,
  countryCodes, phoneError, setPhoneError, isTouched, setIsTouched
}) {
  const [localNumber, setLocalNumber] = useState('');

  useEffect(() => {
    const countryCode = selectedCountry?.value || '';
    const numberPart = phone.replace(`${countryCode} `, '').trim();
    setLocalNumber(numberPart);
  }, [phone, selectedCountry]);

  const customDropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
      <FiSearch className="text-gray-500" />
    </components.DropdownIndicator>
  );

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setPhone(`${selectedOption.value} ${localNumber}`);
  };

  const handleNumberChange = (e) => {
    const newNumber = e.target.value;
    setLocalNumber(newNumber);
    setPhone(`${selectedCountry?.value || ''} ${newNumber}`);
  };

  const validatePhoneNumber = () => {
    const countryCode = selectedCountry?.value || '';
    const numberPart = phone.replace(`${countryCode} `, '').trim();

    if (!/^\d{5,15}$/.test(numberPart)) {
      setPhoneError('Enter a valid phone number with 5 to 15 digits.');
    } else {
      setPhoneError('');
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-gray-700 text-start">
        Phone Number
      </label>
      <div className="flex">
        <Select
          value={selectedCountry}
          onChange={handleCountryChange}
          options={countryCodes}
          placeholder="Search country code"
          className="w-48"
          styles={{
            control: (base, state) => ({
              ...base,
              border: state.isFocused ? `1px solid #05A3A3` : `1px solid #D1D5DB`,
              borderRadius: '0.375rem 0 0 0.375rem',
              backgroundColor: '#f9fafb',
              boxShadow: state.isFocused ? '0 0 0 1px #05A3A3' : 'none',
              minHeight: '38px',
              height: '38px',
              transition: 'all 0.15s ease-in-out'
            }),
            valueContainer: (base) => ({
              ...base,
              height: '38px',
              padding: '0 8px'
            }),
            input: (base) => ({
              ...base,
              margin: '0px',
              padding: '0px'
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? '#05A3A3'
                : state.isFocused
                  ? '#e5e7eb'
                  : 'white',
              color: state.isSelected ? 'white' : '#374151',
            }),
          }}
          components={{ DropdownIndicator: customDropdownIndicator }}
        />
        <input
          type="text"
          placeholder="Enter mobile number"
          value={localNumber}
          onFocus={() => setIsTouched(true)}
          onChange={handleNumberChange}
          onBlur={() => {
            if (isTouched) validatePhoneNumber();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isTouched) validatePhoneNumber();
          }}
          className={`border p-2 flex-1 rounded-r-md text-gray-700 h-[38px] transition-all duration-150 ease-in-out focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] ${
            phoneError ? 'border-[#05A3A3]' : 'border-gray-300'
          }`}
        />
      </div>
      {isTouched && phoneError && (
        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
      )}
      <p className="text-xs text-gray-500 mt-1 text-start">
        Provide the contact's mobile number, making sure to include the correct country code (e.g., +1, +91).
      </p>
    </div>
  );
}
