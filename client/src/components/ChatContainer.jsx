import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { User } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const isGroupChat = Boolean(selectedGroup);

  // Fetch messages when user or group is selected
  useEffect(() => {
    if (selectedUser || selectedGroup) {
      const id = isGroupChat ? selectedGroup._id : selectedUser._id;
      getMessages(id, isGroupChat);
      subscribeToMessages(id, isGroupChat);
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    selectedGroup?._id,
    isGroupChat,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isSelf = message.senderId === authUser._id;
          const sender = isSelf
            ? authUser
            : isGroupChat
            ? message.sender // Should be populated with { name, profilePic }
            : selectedUser;

          return (
            <div
              key={message._id}
              className={`chat ${isSelf ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              {/* Show avatar only for group chats and when sender is not self */}
              {isGroupChat && !isSelf && (
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    {sender?.profilePic ? (
                      <img
                        src={sender.profilePic}
                        alt="profile"
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="size-10 text-gray-400 rounded-full" />
                    )}
                  </div>
                </div>
              )}

              <div className="chat-header mb-1">
                {!isSelf && isGroupChat && (
                  <span className="text-sm font-semibold">
                    {sender?.name || "User"}
                  </span>
                )}
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div
                className={`chat-bubble flex flex-col ${
                  isSelf ? "bg-primary text-primary-content" : ""
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
