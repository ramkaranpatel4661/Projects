"use client"; // Enables Client Component in Next.js (used with App Router)

import React, { Suspense } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import AuthProvider from "./AuthProvider";

// Creating the Convex client using an environment variable
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function Provider({ children }) {
  return (
    <Suspense fallback={<p>Loading....</p>}>
    <ConvexProvider client={convex}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
    </Suspense>
  );
}

export default Provider;
