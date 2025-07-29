import { useEffect, useState } from "react";
import { Camera, Users, User } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore";

const GroupProfile = () => {
  const { selectedGroup, setSelectedGroup, users } = useChatStore();
  const { authUser } = useAuthStore();
  const [groupName, setGroupName] = useState("");
  const [groupPic, setGroupPic] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [notGroupMembers, setNotGroupMembers] = useState([]);
  const [preview, setPreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedGroup) {
      setGroupName(selectedGroup.name || "");
      setPreview(selectedGroup.groupPic || "");

      const memberIdStrings = selectedGroup.membersId.map((id) =>
        id.toString()
      );

      let members = users.filter((user) =>
        memberIdStrings.includes(user._id.toString())
      );

      // Ensure authUser is included
      const alreadyIncluded = members.find(
        (user) => user._id.toString() === authUser._id.toString()
      );
      if (!alreadyIncluded) {
        members.push(authUser);
      }

      const notMembers = users.filter(
        (user) =>
          !memberIdStrings.includes(user._id.toString()) &&
          user._id.toString() !== authUser._id.toString()
      );

      setGroupMembers(members);
      setNotGroupMembers(notMembers);
    }
  }, [selectedGroup, users, authUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select a valid image file");
    }

    if (file.size > 1024 * 1024 * 40) {
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
      const originalMemberIds = selectedGroup.membersId.map((id) =>
        id.toString()
      );
      const updatedMemberIds = groupMembers.map((user) =>
        user._id.toString()
      );

      const membersToAdd = updatedMemberIds.filter(
        (id) => !originalMemberIds.includes(id)
      );
      const membersToRemove = originalMemberIds.filter(
        (id) => !updatedMemberIds.includes(id)
      );

      await axiosInstance.put(`/groups/${selectedGroup._id}/update-group`, {
        name: groupName,
        groupPic: groupPic || preview || "",
        membersToAdd,
        membersToRemove,
      });

      toast.success("Group updated successfully");
      setSelectedGroup(null);
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
    <div className="h-full pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Edit Group</h1>
            <p className="mt-2">Update group name, picture, or members</p>
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
                className="absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer hover:scale-105 transition"
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

            {/* Group Members */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Group Members
              </div>
              <p className="text-xs text-zinc-400">
                {groupMembers.length} members
              </p>

              {/* Dropdown Add */}
              <div className="dropdown dropdown-right dropdown-center">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn rounded-full btn-sm"
                >
                  + Add members
                </div>
                <div
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm overflow-y-auto max-h-64"
                >
                  {notGroupMembers.map((user) => (
                    <div
                      key={user._id}
                      className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors"
                      onClick={() => {
                        setGroupMembers((prev) => [...prev, user]);
                        setNotGroupMembers((prev) =>
                          prev.filter((u) => u._id !== user._id)
                        );
                      }}
                    >
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.fullName}
                          className="size-8 object-cover rounded-full"
                        />
                      ) : (
                        <User className="size-8 text-gray-400 rounded-full border-2 border-base-content" />
                      )}
                      <div className="font-medium truncate">
                        {user.fullName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Display */}
              {groupMembers
                .filter((user) => user._id === selectedGroup.adminId)
                .map((user) => (
                  <div
                    key={user._id}
                    className="w-full p-3 flex items-center gap-3 bg-base-100 border border-primary rounded-lg"
                  >
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className="size-8 object-cover rounded-full"
                      />
                    ) : (
                      <User className="size-8 text-gray-400 rounded-full border-2 border-base-content" />
                    )}
                    <div className="font-medium truncate">
                      {user.fullName}
                      <span className="text-xs text-primary ml-2">(Admin)</span>
                    </div>
                  </div>
                ))}

              {/* Other Members */}
              {groupMembers
                .filter((user) => user._id !== selectedGroup.adminId)
                .map((user) => (
                  <div
                    key={user._id}
                    className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors"
                    onClick={() => {
                      setGroupMembers((prev) =>
                        prev.filter((member) => member._id !== user._id)
                      );
                      setNotGroupMembers((prev) => [...prev, user]);
                    }}
                  >
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className="size-8 object-cover rounded-full"
                      />
                    ) : (
                      <User className="size-8 text-gray-400 rounded-full border-2 border-base-content" />
                    )}
                    <div className="font-medium truncate">{user.fullName}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Update Button */}
          <button
            onClick={handleUpdateGroup}
            className="w-full py-2.5 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition"
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
