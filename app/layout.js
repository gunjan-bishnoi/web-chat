import { Asap, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";


const asap = Asap({
  variable: "--font-asap-sans",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});



export const metadata = {
  title: "Chat Web",
  description: "chat",
};

import { AlertProvider } from "./context/AlertContext";
import CustomAlert from "./components/common/CustomAlert";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${asap.variable} ${inter.variable}  antialiased`}
      >
        <AlertProvider>
          {children}
          <CustomAlert />
        </AlertProvider>
      </body>
    </html>
  );
}
