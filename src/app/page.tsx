"use client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Message from "../components/Message/Message";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db, dbName } from "./firebase";
import { UserAuth } from "./context/AuthContext";
import { ModeToggle } from "@/components/ui/ModeToggle/ModeToggle";
import Footer from "@/components/Footer/Footer";
import About from "@/components/About/About";

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

  useEffect(() => {
    const scrollableDiv = document.getElementById(
      "scrollableDiv"
    ) as HTMLDivElement | null;

    if (scrollableDiv) {
      scrollableDiv.scrollIntoView({ behavior: "smooth" });
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
  }, []);

  const sendMessage = async () => {
    setMessage("");

    // Create a new array with the current messages plus the new user message
    const newMessages = [...messages, { role: "user", content: message }];
    setMessages(newMessages);

    const response = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessages),
    });

    const data = await response.json();
    // Add the assistant's response to the messages array
    const updatedMessages = [
      ...newMessages,
      { role: "assistant", content: data.message },
    ];
    setMessages(updatedMessages);

    // updating user db with new messages
    if (user) {
      const docRef = doc(db, dbName, user?.uid as string);
      await updateDoc(docRef, {
        chat: updatedMessages,
      });
    }
  };

  // handles user data, whether new client, returning client, or guest
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          setMessages([
            {
              role: "assistant",
              content:
                "Hi! I'm the FamFinance support assistant. How can I help you today?",
            },
          ]);
        } else {
          const docRef = doc(db, dbName, user?.uid as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // old client
            const prevMsg = docSnap.data().chat;
            setMessages(prevMsg);
          } else {
            // new client
            const newChat = [
              {
                role: "assistant",
                content:
                  "Hi " +
                  user?.displayName +
                  "! I'm the FamFinance support assistant. How can I help you today?",
              },
            ];
            setMessages(newChat);
            const newPerson = {
              name: user?.displayName,
              email: user?.email,
              chat: newChat,
            };
            setDoc(docRef, newPerson);
          }
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, [user, messages]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      googleSignIn();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      logOut();
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
    <main className="home-container">
      <div className="nav-container">
        <h1>𝔽𝕒𝕞𝔽𝕚𝕟𝕒𝕟𝕔𝕖</h1>
        <div className="nav-list">
          {loading ? null : user ? (
            <Button onClick={handleSignOut}> Sign Out</Button>
          ) : (
            <Button onClick={handleSignIn}> Login</Button>
          )}
          <ModeToggle />
        </div>
      </div>

      <div className="body-section">
        <About />
        <div>
          <h1 className="welcome-text">
            {user
              ? "Welcome, " + user.displayName + " 😎"
              : "Welcome, New User!"}
          </h1>

          <div className="chatbox">
            <div className="response-box" id="scrollableDiv">
              {loading
                ? null
                : messages.map((message, index) => (
                    <Message
                      key={index}
                      message={message}
                      streamText={index == messages.length - 1}
                    />
                  ))}
            </div>
            <div className="text-container">
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
                className="rounded-full sendButton"
                onClick={sendMessage}
              >
                <Send size={24} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
