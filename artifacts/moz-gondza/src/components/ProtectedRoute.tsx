import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && !isAdmin) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}
