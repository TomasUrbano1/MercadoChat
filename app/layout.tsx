import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "MercadoChat",
  description: "Marketplace con chat realtime",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="min-h-screen p-6 max-w-7xl mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}