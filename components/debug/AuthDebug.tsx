"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useState } from "react";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AuthDebug() {
  const auth = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    // Check localStorage data
    const checkLocalStorage = () => {
      const data = {
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
        user: localStorage.getItem("user"),
      };
      setLocalStorageData(data);
      return data;
    };

    // Initial check
    checkLocalStorage();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkLocalStorage();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check every 2 seconds for debugging
    const interval = setInterval(checkLocalStorage, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const testApiCall = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(
        "Testing API call with token:",
        token?.substring(0, 20) + "..."
      );

      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
    } catch (error) {
      console.error("API test error:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
      <h3 className="font-bold text-lg">Authentication Debug</h3>

      <div>
        <h4 className="font-semibold">Auth Context State:</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            {
              isAuthenticated: auth.isAuthenticated,
              isLoading: auth.isLoading,
              user: auth.user
                ? {
                    id: auth.user.id,
                    email: auth.user.email,
                    fullName: auth.user.fullName,
                  }
                : null,
              hasAccessToken: !!auth.accessToken,
              hasRefreshToken: !!auth.refreshToken,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">LocalStorage Data:</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            {
              accessToken:
                localStorageData.accessToken?.substring(0, 20) +
                (localStorageData.accessToken ? "..." : ""),
              refreshToken:
                localStorageData.refreshToken?.substring(0, 20) +
                (localStorageData.refreshToken ? "..." : ""),
              user: localStorageData.user
                ? JSON.parse(localStorageData.user)
                : null,
            },
            null,
            2
          )}
        </pre>
      </div>

      <button
        onClick={testApiCall}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test API Call
      </button>
    </div>
  );
}
