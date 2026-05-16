import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupabaseProvider from "@/components/SupabaseProvider";
import Image from "next/image";

export const metadata = {
  title: "MercadoChat",
  description: "Marketplace moderno con chat en tiempo real.",
  icons: {
    icon: "/logo-mercadochat.png",
    shortcut: "/logo-mercadochat.png",
    apple: "/logo-mercadochat.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 text-white antialiased">

        {/* PROVEEDOR GLOBAL DE AUTENTICACIÓN */}
        <SupabaseProvider>

          {/* NAVBAR */}
          <Navbar />

          {/* CONTENIDO */}
          <main className="min-h-[80vh] max-w-7xl mx-auto px-6 py-10">
            {children}
          </main>

          {/* FOOTER */}
          <Footer />

        </SupabaseProvider>
      </body>
    </html>
  );
}
