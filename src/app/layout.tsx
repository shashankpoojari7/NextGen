import type { Metadata } from "next";
import "./globals.css";
import { MainWrapper } from "@/app/MainWrapper";
import ThemeInit from "@/components/Theme-init";

export const metadata: Metadata = {
  title: "NextGen",
  description: "",
};


export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) 
{
  return (
    <html lang="en" className="dark">
        <body className="font-sans antialiased">
          <ThemeInit/>
          <MainWrapper>
            {children}
          </MainWrapper>
        </body>
    </html>
  );
}
