import React from "react";

interface NotificationData {
  type: "LIKE" | "COMMENT" | "MESSAGE";
  senderUsername: string;
  senderImage: string;
  postPreview?: string;
  comment?: string;
}

export default function NotificationLayouts(data: NotificationData) {
  const { type, senderUsername, senderImage, postPreview } = data;

  const getText = () => {
    switch (type) {
      case "LIKE":
        return "liked your post";
      case "COMMENT":
        return "commented on your post";
      case "MESSAGE":
        return "sent you a message";
      default:
        return "notification";
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <img src={senderImage || '/no-profile.jpg'} className="w-10 h-10 rounded-full shrink-0" />

      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-bold truncate">{senderUsername}</span>
        <span className="text-xs opacity-90">{getText()}</span>
      </div>

      {postPreview && (
        <img
          src={postPreview}
          className="w-10 h-10 rounded-md shrink-0 object-cover"
        />
      )}
    </div>
  );
}