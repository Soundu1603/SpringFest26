import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Session check failed");
        }

        const data = await response.json();
        if (active) {
          setIsAuthenticated(Boolean(data.authenticated));
        }
      } catch (error) {
        if (active) {
          setIsAuthenticated(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  return { isAuthenticated, loading };
}
