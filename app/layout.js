import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./Components/navigation/navigation";
import { AuthProvider } from "./auth/authContext";
import TopNavigation from "./Components/navigation/topNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Riel Point",
  description: "Loyalty rewards platform",
  icons: {
    icon: "/icon-192.png",
  },
  openGraph: {
    images: ["/icon-192.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TopNavigation/>
          <main className="flex-1 pb-28 sm:pb-24">{children}</main>
          <Navigation />
        </AuthProvider>
      </body>
    </html>
  );
}