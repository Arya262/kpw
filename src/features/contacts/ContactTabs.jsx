import { FiUserPlus, FiUsers } from 'react-icons/fi';

export default function ContactTabs({ tab, setTab }) {
  return (
    <div className="flex space-x-12 border-b mb-4">
      <button
        onClick={() => setTab('single')}
        className={`pb-2 font-medium flex items-center ${tab === 'single' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
      >
        <FiUserPlus className="w-4 h-4 mr-2" />
        Add Single Contact
      </button>
      <button
        onClick={() => setTab('bulk')}
        className={`pb-2 font-medium flex items-center ${tab === 'bulk' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
      >
        <FiUsers className="w-4 h-4 mr-2" />
        Add Bulk Contacts
      </button>
    </div>
  );
}
