import { Card, CardHeader } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import { useEffect, useState } from "react";

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
        console.log("currentIndex: ", currentIndex);
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [content]);

  if (role === "assistant") {
    return (
      <div className="flex flex-col gap-3 p-6 whitespace-pre-wrap">
        <div className="flex items-center gap-2">
          <Bot />
          Assistant:
        </div>
        {streamText ? content : displayedText}
      </div>
    );
  }
  return (
    <Card className="whitespace-pre-wrap">
      <CardHeader>
        <div className="flex items-center gap-2  justify-end">
          <User size={36} />
          {content}
        </div>
      </CardHeader>
    </Card>
  );
};

export default Message;
