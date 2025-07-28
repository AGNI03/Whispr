import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, User } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    getGroups,
    users,
    groups,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    isUsersLoading,
    isGroupsLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await getUsers();
      await getGroups();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="select-none h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        {/* Online Filter */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* Users */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              if (selectedUser?._id !== user._id) {
                setSelectedUser(user);
              }
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
              ) : (
                <User className="size-11 text-gray-400 rounded-full object-cover border-2 border-base-content" />
              )}
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}

        {/* Group List */}
        <div className="border-t border-base-300 mt-4 pt-4 px-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-5" />
            <span className="font-medium hidden lg:block">Groups</span>
          </div>

          {isGroupsLoading ? (
            <div className="text-sm text-zinc-400">Loading groups...</div>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <button
                key={group._id}
                onClick={() => {
                  if (selectedGroup?._id !== group._id) {
                    setSelectedGroup(group);
                  }
                }}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${
                    selectedGroup?._id === group._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  {group.groupPic ? (
                    <img
                      src={group.groupPic}
                      alt={group.name}
                      className="size-12 object-cover rounded-full"
                    />
                  ) : (
                    <Users className="size-12 text-gray-400 object-cover rounded-full border-2 border-base-content" />
                  )}
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{group.name}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-zinc-400">No groups</div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
