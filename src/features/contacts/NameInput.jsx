export default function NameInput({ name, setName }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-gray-700 text-start">Name</label>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-md text-gray-700 h-[38px] focus:border-[#05A3A3] focus:outline-none focus:ring-1 focus:ring-[#05A3A3] transition-all duration-150 ease-in-out"
      />
    </div>
  );
}