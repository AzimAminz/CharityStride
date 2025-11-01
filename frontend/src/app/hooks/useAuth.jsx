import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../lib/auth";

export function useAuth(roleRequired = null) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }

        const userData = await getCurrentUser();
        setUser(userData);

        if (roleRequired && userData.role !== roleRequired) {
          router.replace("/login");
        }

      } catch {
        router.replace("/login");
      }
    }

    check();
  }, [roleRequired]);

  return { user };
}
