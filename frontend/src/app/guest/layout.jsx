"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false); // prevent flicker

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {

      setChecked(true);
      return;
    }

    const user = JSON.parse(storedUser);

    switch (user.role) {
      case "admin":
        router.replace("/admin");
        break;
      case "ngo":
        router.replace("/ngo");
        break;
      case "user":
        router.replace("/dashboard");
        break;
      default:
        router.replace("/login");
    }
  }, [router]);

 
  if (!checked) return null; 

  return <>{children}</>;
}
