import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forno do Cosmos — um império de cookies",
  description: "Clique, produza e construa um império de cookies neste jogo incremental.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
