import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function PhoneInputField({
  phone,
  setPhone,
  phoneError,
  setPhoneError,
  isTouched,
  setIsTouched,
}) {
  const handleValidation = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      setPhoneError('Please enter a phone number.');
    } else if (!/^\d{10,15}$/.test(cleaned)) {
      setPhoneError('Enter a valid phone number with 10 to 15 digits.');
    } else {
      setPhoneError('');
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-gray-700 text-start">
        Phone Number
      </label>
      <PhoneInput
        country={'in'}
        value={phone}
        onChange={(value, country) => {
          setPhone(value);
          setIsTouched(true);
          handleValidation(value);
        }}
        enableSearch
        inputStyle={{
          width: '100%',
          height: '38px',
          fontSize: '0.875rem',
          borderRadius: '0.375rem',
          border: phoneError ? '1px solid #e53e3e' : '1px solid #D1D5DB',
        }}
        containerStyle={{ width: '100%' }}
        buttonStyle={{
          border: '1px solid #D1D5DB',
          borderRadius: '0.375rem 0 0 0.375rem',
        }}
      />
      {isTouched && phoneError && (
        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
      )}
      <p className="text-xs text-gray-500 mt-1 text-start">
        Provide the contact's mobile number, including the correct country code (e.g., +1, +91).
      </p>
    </div>
  );
}
