export default function OptStatusRadio({ optStatus, setOptStatus }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-gray-700 text-start">Opt Status</label>
      <div className="flex space-x-6">
        {['Opted In', 'Opted Out'].map((status) => (
          <label key={status} className="inline-flex items-center">
            <input
              type="radio"
              name="optStatus"
              value={status}
              checked={optStatus === status}
              onChange={(e) => setOptStatus(e.target.value)}
              className="text-[#0AA89E]"
              style={{ accentColor: "#0AA89E" }}
            />
            <span className="ml-2 text-gray-700">{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
}