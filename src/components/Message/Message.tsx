import { Card, CardHeader } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import { useEffect, useState } from "react";
import "./Message.css";

interface MessageData {
  role: string;
  content: string;
}

interface MessageProp {
  message: MessageData;
  streamText: boolean;
}

const Message: React.FC<MessageProp> = ({ message, streamText }) => {
  const { role, content } = message;
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex !== content.length) {
        setDisplayedText(content.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [content]);

  if (role === "assistant") {
    return (
      <div className="flex flex-col gap-2 p-5 whitespace-pre-wrap ai-message">
        <div className="flex items-center gap-2">
          <Bot />
          Assistant:
        </div>
        {streamText ? displayedText : content}
      </div>
    );
  }
  return (
    <Card className="whitespace-pre-wrap user-box">
      <CardHeader>
        <div className="flex items-center gap-2 justify-end">
          {content}
          <User size={36} />
        </div>
      </CardHeader>
    </Card>
  );
};

export default Message;
