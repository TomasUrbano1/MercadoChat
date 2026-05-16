import ProductCard from "@/components/ProductCard";

const products = [
  {
    id: "1",
    title: "Macbook Pro",
    price: 1200,
    category: "Tecnología",
    image_url: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8"
  }
];

export default function ProductsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Productos</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}