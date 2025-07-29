import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Users, User } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  const isGroupChat = Boolean(selectedGroup);
  const target = isGroupChat ? selectedGroup : selectedUser;

  if (!target) return null; // Failsafe

  const name = target.fullName || target.name;
  const isOnline = onlineUsers.includes(target._id);

  return (
    <div className="select-none p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Avatar and name */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            
              <div className=" size-10 rounded-full relative hover:scale-105 transition-transform cursor-pointer">
                {
                  isGroupChat 
                  ? <Link to="/group"> {target.groupPic 
                    ? <img src={target.groupPic} alt={name} className="size-full object-cover rounded-full" />
                    : <Users className="size-full text-gray-400 rounded-full object-cover border-2 border-base-content" />}</Link>
                  : 
                    target.profilePic 
                    ? <img src={target.profilePic} alt={name} className="size-full object-cover rounded-full" />
                    : <User className="size-full text-gray-400 rounded-full object-cover border-2 border-base-content" />
                }
                
              </div>
            
          </div>

          <div>
            <h3 className="font-medium">{name}</h3>
            {!isGroupChat && (
              <p className="text-sm text-base-content/70">
                {isOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setSelectedUser(null);
            setSelectedGroup(null);
          }}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
