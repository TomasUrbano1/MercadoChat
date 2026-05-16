import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="relative h-[500px]">
        <Image
          src="https://images.unsplash.com/photo-1517336714739-489689fd1ca8"
          alt="product"
          fill
          className="object-cover rounded-2xl"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold">Macbook Pro</h1>
        <p className="text-2xl text-green-400">$1200</p>
        <p>Excelente estado.</p>

        <Link href="/chat/demo" className="inline-block bg-blue-600 px-4 py-2 rounded-lg">
          Chatear con el vendedor
        </Link>
      </div>
    </div>
  );
}