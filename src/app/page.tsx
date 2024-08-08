"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import Message from "./components/Message/Message";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db, dbName } from "./firebase";
import { UserAuth } from "./context/AuthContext";

import Login from "./components/Login/Login";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the FamFinance support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const { user, setUser, googleSignIn, logOut } = UserAuth();
  const [loading, setLoading] = useState(true);

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
    if (user) {
      const docRef = doc(db, dbName, user?.uid as string);
      await updateDoc(docRef, {
        chat: messages,
      });
    }
  };

  // retrieving previous message data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, dbName, user?.uid as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const prevMsg = docSnap.data().chat;
          setMessages([
            ...prevMsg,
            {
              role: "assistant",
              content:
                "Hi " +
                user?.displayName +
                "! Welcome back. How can I help you today?",
            },
          ]);
        } else {
          const displayName = user ? user.displayName ?? "" : "";
          setMessages([
            {
              role: "assistant",
              content:
                "Hi " +
                displayName +
                "! I'm the FamFinance support assistant. How can I help you today?",
            },
          ]);

          const newPerson = {
            name: user?.displayName,
            email: user?.email,
            chat: messages,
          };
          if (user) setDoc(docRef, newPerson);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, [user, messages]);

  const handleSignIn = async () => {
    try {
      googleSignIn();
      const docRef = doc(db, dbName, user?.uid as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const prevMsg = docSnap.data().chat;
        setMessages([
          ...prevMsg,
          {
            role: "assistant",
            content:
              "Hi " +
              user?.displayName +
              "! Welcome back. How can I help you today?",
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              "Hi " +
              user?.displayName +
              "! I'm the FamFinance support assistant. How can I help you today?",
          },
        ]);

        const newPerson = {
          name: user?.displayName,
          email: user?.email,
          chat: messages,
        };
        setDoc(docRef, newPerson);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      logOut();
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm the FamFinance support assistant. How can I help you today?",
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  });

  return (
    <main className="fixed h-full w-full  bg-muted">
      {loading ? null : !user ? (
        <Button onClick={handleSignIn}> Login</Button>
      ) : (
        <Button onClick={handleSignOut}> Sign Out</Button>
      )}

      <div className="container h-full w-full flex flex-col py-8">
        <div className="flex-1 overflow-y-auto">
          {loading
            ? null
            : messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  streamText={index !== messages.length - 1}
                />
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
