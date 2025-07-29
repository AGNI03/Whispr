import { useState } from "react";
import { Camera, Users } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateGroupPage = () => {
  const [groupName, setGroupName] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [preview, setPreview] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }

    if (file.size > 1024 * 1024 * 2) {
      return toast.error("Image size should be under 2MB");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setGroupPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    setIsCreating(true);

    try {
      const res = await axiosInstance.post("/groups/create-group", {
        name: groupName,
        groupPic: groupPic || "",
      });

      toast.success("Group created successfully");
      setGroupName("");
      setGroupPic(null);
      setPreview("");

      navigate("/");
    } catch (error) {
      console.error("Create group failed:", error);
      toast.error(error?.response?.data?.error || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">New Group</h1>
            <p className="mt-2">Create your own group chat</p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Group preview"
                  className="size-32 rounded-full object-cover border-4 border-base-content"
                />
              ) : (
                <Users className="size-32 text-gray-400 rounded-full border-4 border-base-content" />
              )}

              <label
                htmlFor="groupPic-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-base-content hover:scale-105 
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="groupPic-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isCreating}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to upload a group photo
            </p>
          </div>

          {/* Group Name Input */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Group Name
              </div>
              <input
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Project Team, Study Circle"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreateGroup}
            className="w-full py-2.5 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
