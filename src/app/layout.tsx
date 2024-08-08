import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
import Login from "./components/Login/Login";
import Home from "./page";
import { authOptions } from "./auth/[...nextauth]/route";
import { AuthContextProvider } from "./context/AuthContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FamFinance ChatBot",
  description: "FamFinance AI Customer Chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // console.log("in here");
  // const session = await getServerSession(authOptions);
  // console.log("Session: ", session);
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>{children}</AuthContextProvider>
        {/* <SessionProvider session={session}>
          {!session ? <Login /> : <Home />}
        </SessionProvider> */}
      </body>
    </html>
  );
}
