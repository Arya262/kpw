import { useState } from "react";
import { Pencil } from "lucide-react"; // or use any icon library
import { Switch } from "@/components/ui/switch"; // Replace with your Switch component
import { Button } from "@/components/ui/button"; // Replace with your Button component

const Header = () => {
  const [title, setTitle] = useState("Untitled");
  const [isEditing, setIsEditing] = useState(false);
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex justify-between items-center border-b px-6 py-4 bg-white">
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="text-lg font-semibold text-gray-800 border-b border-gray-300 outline-none"
          />
        ) : (
          <h2
            className="text-lg font-semibold text-gray-800 cursor-pointer flex items-center gap-2"
            onClick={() => setIsEditing(true)}
          >
            {title}
            <Pencil size={16} className="text-gray-500" />
          </h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">Save</Button>
      </div>
    </div>
  );
};

export default Header;
