import Image from "next/image";
import Link from "next/link";

interface Props {
  product: {
    id: string;
    title: string;
    price: number;
    category: string;
    image_url: string;
  };
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
      <div className="relative h-52">
        <Image src={product.image_url} alt={product.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-green-400">${product.price}</p>
        <p className="text-zinc-400 text-sm">{product.category}</p>
      </div>
    </Link>
  );
}