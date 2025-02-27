import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Posture Perfect",
  description: "An application that tracks your posture and helps you improve it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased font-['Quicksand'] `}
      >
        {children}
      </body>
    </html>
  );
}
