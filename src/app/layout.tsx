import type { Metadata } from "next";
import { Montserrat} from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import CustomLayout from "@/custom-layout"

export const metadata: Metadata = {
  title: "Next-Events",
  description: "An event booking platform built with Next.js and AI tools",
};

const montserratFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserratFont.className} antialiased`}
      >
        <CustomLayout>
          {children}
        </CustomLayout>
        
        <Toaster/>
      </body>
      
    </html>
  );
}
