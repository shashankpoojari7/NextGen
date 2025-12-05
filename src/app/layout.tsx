import type { Metadata } from "next";
import "./globals.css";
import { MainWrapper } from "@/app/MainWrapper";

export const metadata: Metadata = {
  title: "NextGen",
  description: "",
};


export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) 
{
  return (
    <html lang="en" className="dark">
        <body className="font-sans antialiased">
          <MainWrapper>
            {children}
          </MainWrapper>
        </body>
    </html>
  );
}
