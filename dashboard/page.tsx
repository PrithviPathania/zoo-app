// ============================================================================
// app/dashboard/page.tsx   →   THE PROTECTED PAGE (logged-in users only)
// ============================================================================
//
// "Protected" means: if you're NOT logged in, you can't see it — we send you
// back to the login page.
//
// How we protect it (the simple way): when the page loads, we ask Supabase
// "who is logged in?". If nobody, we redirect to "/". If someone, we show the
// page. This runs in the browser — simple and good enough for learning.
// ----------------------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true); // still finding out?

  // When the page loads, check who is logged in.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/"); // not logged in → back to the login page
      } else {
        setUser(data.user); // logged in → remember them and show the page
      }
      setChecking(false);
    });
  }, [router]);

  // SIGN OUT: end the session, then go back to the login page.
  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  // While we're checking, show nothing much (avoids a flash of the page).
  if (checking) {
    return <main className="max-w-md mx-auto px-6 py-16">Loading…</main>;
  }

  // If there's no user we're already redirecting, so render nothing.
  if (!user) return null;

  return (
    <main className="max-w-md mx-auto px-6 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
      <p className="text-gray-500 mb-6">
        You can only see this page because you are logged in.
      </p>

      <div className="rounded-lg bg-white border border-gray-200 p-4 mb-8">
        <p className="text-sm text-gray-700">
          Signed in as <strong>{user.email}</strong>
        </p>
      </div>

      <button
        onClick={signOut}
        className="rounded-lg bg-gray-800 px-5 py-2.5 font-semibold text-white hover:bg-gray-900"
      >
        Sign out
      </button>
    </main>
  );
}
 