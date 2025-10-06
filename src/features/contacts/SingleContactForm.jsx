import PhoneInputField from './PhoneInputField';
import OptStatusRadio from './OptStatusRadio';
import NameInput from './NameInput';

export default function SingleContactForm(props) {
  const { name, setName, setPhone } = props;

 
  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, ''); 
    if (digits.length > 2) {
      setPhone(digits.replace(/^(\d{2})(\d+)/, '$1 $2'));
    } else {
      setPhone(digits);
    }
  };

  return (
    <>
      <PhoneInputField {...props} setPhone={handlePhoneChange} />
      {/* <OptStatusRadio {...props} /> */}
      <NameInput name={name} setName={setName} />
    </>
  );
}
