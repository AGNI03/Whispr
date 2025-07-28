import { useEffect, useState } from "react";
import { Camera, Users } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore.js";

const GroupProfile = () => {
  const { selectedGroup, setSelectedGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [preview, setPreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  // Prefill form when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      setGroupName(selectedGroup.name || "");
      setPreview(selectedGroup.groupPic || "");
    }
  }, [selectedGroup]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }

    if (file.size > 1024 * 1024 * 40) { // 40MB limit
      return toast.error("Image size should be under 40MB");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setGroupPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name is required");
    if (!selectedGroup?._id) return toast.error("No group selected");

    setIsUpdating(true);
    try {
      const res = await axiosInstance.put(
        `/groups/${selectedGroup._id}/update-group`,
        {
          name: groupName,
          groupPic: groupPic || preview || "",
        }
      );

      toast.success("Group updated successfully");
      setSelectedGroup(null); // Clear selected group
      navigate("/");
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to update group";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!selectedGroup) {
    return (
      <div className="h-screen flex items-center justify-center text-zinc-500">
        <p>Select a group to edit</p>
      </div>
    );
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Edit Group</h1>
            <p className="mt-2">Update group name or picture</p>
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
                className="absolute bottom-0 right-0
                  bg-base-content hover:scale-105 
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="groupPic-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUpdating}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to change the group photo
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
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Update Button */}
          <button
            onClick={handleUpdateGroup}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            disabled={isUpdating || !groupName.trim()}
          >
            {isUpdating ? "Updating..." : "Update Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupProfile;
