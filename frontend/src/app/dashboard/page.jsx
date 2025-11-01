'use client';
import { useAuth } from "../hooks/useAuth";

export default function Page() {
  const { user } = useAuth("user");

  return <div>Welcome {user?.name}</div>;
}
