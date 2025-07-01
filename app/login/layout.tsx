import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Admin Portal",
  description: "Sign in to access the admin portal",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
} 