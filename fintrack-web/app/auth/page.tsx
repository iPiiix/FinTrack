"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../lib/auth";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
      <span className="font-mono text-[10px] tracking-[0.22em] text-zinc-600">
        REDIRIGIENDO...
      </span>
    </div>
  );
}
