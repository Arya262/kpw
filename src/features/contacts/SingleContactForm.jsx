import PhoneInputField from './PhoneInputField';
import OptStatusRadio from './OptStatusRadio';
import NameInput from './NameInput';
import TagSelector from '../tags/components/TagSelector';

export default function SingleContactForm(props) {
  const { name, setName, setPhone, selectedTags = [], setSelectedTags } = props;

 
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
      
      {/* Tag Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Assign tags to organize and categorize this contact.
        </p>
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          placeholder="Select or create tags..."
          allowCreate={true}
        />
      </div>
    </>
  );
}
