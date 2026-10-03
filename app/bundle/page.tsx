"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BUNDLES } from "@/lib/data";
import { hydrate, useStore } from "@/lib/store";
import SetView from "../set/[id]/view";

function Item() {
  useStore();
  const id = useSearchParams().get("id") ?? "";
  const [ready, setReady] = useState(false);
  useEffect(() => { hydrate(); setReady(true); }, []);
  if (!ready) return <div className="wrap page" />;
  if (!BUNDLES.some((b) => b.id === id)) {
    return (
      <div className="wrap page empty">
        <span className="eyebrow">Bundle</span>
        <h2>We could not find this bundle.</h2>
        <Link className="btn" href="/shop/">Shop the collection</Link>
      </div>
    );
  }
  return <SetView id={id} />;
}

export default function Page() {
  return <Suspense><Item /></Suspense>;
}
