"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import Message from "./components/Message/Message";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, dbName } from "./firebase";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the FamFinance support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
    ]);

    const response = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    });

    const data = await response.json();
    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: data.message },
    ]);

    // updating user db with new messages
    const docRef = doc(db, dbName, "test101@gmail.com");
    await updateDoc(docRef, {
      chat: messages,
    });
  };

  // retrieving previous message data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, dbName, "test101@gmail.com");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const prevMsg = docSnap.data().chat;
          setMessages([
            ...prevMsg,
            {
              role: "assistant",
              content: "Hi! Welcome back. How can I help you today?",
            },
          ]);
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "Hi! I'm the FamFinance support assistant. How can I help you today?",
            },
          ]);
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="fixed h-full w-full  bg-muted">
      <div className="container h-full w-full flex flex-col py-8">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        </div>
        <div className="mt-auto relative">
          <Textarea
            className="w-full text-lg"
            placeholder="Say something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message}
            className="absolute top-1/2 transform -translate-y-1/2 right-4 rounded-full"
            onClick={sendMessage}
          >
            <Send size={24} />
          </Button>
        </div>
      </div>
    </main>
  );
}
