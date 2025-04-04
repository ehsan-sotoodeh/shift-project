// components/withAuth.tsx
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { JSX, useEffect } from "react";

export function withAuth<P>(WrappedComponent: React.ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login");
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      );
    }

    if (!user) return null;

    return <WrappedComponent {...(props as P & JSX.IntrinsicAttributes)} />;
  };

  WithAuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithAuthComponent;
}
