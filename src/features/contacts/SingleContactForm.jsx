import PhoneInputField from './PhoneInputField';
import OptStatusRadio from './OptStatusRadio';
import NameInput from './NameInput';

export default function SingleContactForm(props) {
  const { name, setName } = props; 

  return (
    <>
      <PhoneInputField {...props} />
      <OptStatusRadio {...props} />
      <NameInput name={name} setName={setName} />
    </>
  );
}