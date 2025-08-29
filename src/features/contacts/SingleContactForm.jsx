import PhoneInputField from './PhoneInputField';
import OptStatusRadio from './OptStatusRadio';
import NameInput from './NameInput';

export default function SingleContactForm(props) {
  const { name, setName, setPhone } = props;

  // ✅ Normalize phone number and maintain "91 7043471546" style
  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, ''); // Remove non-numeric characters
    if (digits.length > 2) {
      setPhone(digits.replace(/^(\d{2})(\d+)/, '$1 $2')); // Insert space after first 2 digits
    } else {
      setPhone(digits);
    }
  };

  return (
    <>
      <PhoneInputField {...props} setPhone={handlePhoneChange} />
      <OptStatusRadio {...props} />
      <NameInput name={name} setName={setName} />
    </>
  );
}
