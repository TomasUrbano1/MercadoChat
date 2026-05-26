// @ts-ignore: side-effect import for global CSS
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupabaseProvider from "@/components/SupabaseProvider";

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
        {/* Fondo global con degradado suave */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black" />

        {/* Sutil overlay de ruido / textura si querés agregarlo luego */}
        {/* <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08] bg-[url('/noise.png')]" /> */}

        <SupabaseProvider>
          <div className="flex min-h-screen flex-col">
            {/* NAVBAR */}
            <Navbar />

            {/* CONTENIDO */}
            <main className="flex-1 w-full">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                {children}
              </div>
            </main>

            {/* FOOTER */}
            <Footer />
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
