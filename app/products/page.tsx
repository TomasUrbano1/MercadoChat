"use client";

import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  image_url: string;
};

const mockProducts: Product[] = [
  {
    id: "1",
    title: "MacBook Pro",
    price: 1200,
    category: "Tecnología",
    image_url:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-20">
      {/* HEADER */}
      <motion.header
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl font-extrabold tracking-tight">
          Productos
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Explorá los artículos publicados por la comunidad. Todo en un solo lugar.
        </p>
      </motion.header>

      {/* GRID */}
      <section>
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {mockProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
