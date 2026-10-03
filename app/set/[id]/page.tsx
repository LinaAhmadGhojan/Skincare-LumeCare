import { BUNDLES } from "@/lib/data";
import SetView from "./view";

export function generateStaticParams() {
  return BUNDLES.map((b) => ({ id: b.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SetView id={id} />;
}
