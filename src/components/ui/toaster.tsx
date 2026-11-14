"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        style: {
          fontSize: "13px",
          color: "#111111",
          background: "rgb(255 255 255 / 0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgb(17 17 17 / 0.1)",
          borderRadius: "999px",
          boxShadow: "0 10px 30px -12px rgb(17 17 17 / 0.2)",
        },
        iconTheme: { primary: "#111111", secondary: "#ffffff" },
      }}
    />
  );
}
