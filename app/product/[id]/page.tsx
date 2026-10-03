import { PRODUCTS } from "@/lib/data";
import ProductView from "./view";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductView id={id} />;
}
