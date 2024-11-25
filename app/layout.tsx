import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dinosaur Game",
  description: "Replicate of the famous google chrome dinosaur game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Dinosaur Game" />
        <meta property="og:description" content="Replicate of the famous google chrome dinosaur game" />
        <meta property="og:image" content="/dinosaur-meta.png" />
        <meta property="og:url" content="https://yourwebsite.com" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dinosaur Game" />
        <meta name="twitter:description" content="Replicate of the famous google chrome dinosaur game" />
        <meta name="twitter:image" content="/dinosaur-meta.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
