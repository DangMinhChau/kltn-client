"use client";

import React from "react";
import { useAuth } from "@/lib/context/AuthContext";

export const AuthDebug = () => {
  const { user, isAuthenticated, accessToken, isLoading } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg text-xs max-w-sm z-50 shadow-lg border-2 border-white">
      <h4 className="font-bold mb-2 text-yellow-300">🔍 Auth Debug</h4>
      <div className="space-y-1">
        <div>
          ✅ isAuthenticated:{" "}
          <span className="font-bold">
            {isAuthenticated ? "TRUE" : "FALSE"}
          </span>
        </div>
        <div>
          ⏳ isLoading:{" "}
          <span className="font-bold">{isLoading ? "TRUE" : "FALSE"}</span>
        </div>
        <div>
          👤 user:{" "}
          <span className="font-bold">{user ? user.fullName : "NULL"}</span>
        </div>
        <div>
          📧 email:{" "}
          <span className="font-bold">{user ? user.email : "NULL"}</span>
        </div>
        <div>
          🔑 hasToken:{" "}
          <span className="font-bold">{accessToken ? "YES" : "NO"}</span>
        </div>
        <div>
          🔑 tokenLength:{" "}
          <span className="font-bold">
            {accessToken ? accessToken.length : "0"}
          </span>
        </div>
        <div>
          💾 localStorage:{" "}
          <span className="font-bold">
            {typeof window !== "undefined"
              ? localStorage.getItem("user")
                ? "EXISTS"
                : "EMPTY"
              : "N/A"}
          </span>
        </div>
        <div>
          💾 userLS:{" "}
          <span className="font-bold">
            {typeof window !== "undefined"
              ? localStorage.getItem("user") || "NULL"
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
