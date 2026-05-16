import ProductCard from "@/components/ProductCard";

const products = [
  {
    id: "1",
    title: "iPhone 13",
    price: 700,
    category: "Tecnología",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
  }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold">MercadoChat</h1>
        <p className="text-zinc-400 mt-4">Marketplace moderno con chat en tiempo real.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Productos recientes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}