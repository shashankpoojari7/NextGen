"use client";

import { Loader2 } from "lucide-react";
import { useGlobalLoader } from "@/store/useGlobalLoader";

export default function GlobalLoader() {
  const loading = useGlobalLoader((s) => s.loading);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-999999">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
    </div>
  );
}
