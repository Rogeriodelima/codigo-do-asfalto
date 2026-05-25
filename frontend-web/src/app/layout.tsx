import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import { TemaProvider } from "@/contexts/TemaContext";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Código do Asfalto",
  description: "Evolução. Experiência. Propósito.",
  manifest: "/manifest.json",
  themeColor: "#0B1F3A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${jakarta.variable}`}>
      <body>
        <TemaProvider>{children}</TemaProvider>
      </body>
    </html>
  );
}
