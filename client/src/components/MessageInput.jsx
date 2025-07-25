import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import EmojiPicker from "emoji-picker-react";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const {
    sendMessage,
    sendGroupMessage,
    selectedGroup,
  } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await (selectedGroup ? sendGroupMessage : sendMessage)({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full">
        {emojiPickerVisible && (
          <div className="absolute bottom-12 right-0 z-50">
            <EmojiPicker
              theme="dark"
              emojiStyle="native"
              onEmojiClick={handleEmojiClick}
            />
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              type="button"
              className="btn btn-circle"
              onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
            >
              <Smile size={20} />
            </button>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type="button"
              className={`hidden sm:flex btn btn-circle ${
                imagePreview ? "text-emerald-500" : ""
              }`}
              onClick={() => {
                setEmojiPickerVisible(false);
                fileInputRef.current?.click();
              }}
            >
              <Image size={20} />
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary h-10 min-h-0 hover:bg-primary-focus"
            disabled={!text.trim() && !imagePreview}
            onClick={() => setEmojiPickerVisible(false)}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
