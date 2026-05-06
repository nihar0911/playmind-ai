import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ChatBot from "@/components/ChatBot";
import { AnalysisProvider } from "@/context/AnalysisContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayMind AI | Sports Intelligence",
  description: "AI-powered sports analytics and performance insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-[#050508] text-white overflow-hidden">
        <AnalysisProvider>
          <Sidebar />
          <main className="flex-1 ml-64 h-screen overflow-y-auto relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neon-purple/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 p-8">
              {children}
            </div>
          </main>
          <ChatBot />
        </AnalysisProvider>
      </body>
    </html>
  );
}
Pressing key...Stopping...

Stop Agent
