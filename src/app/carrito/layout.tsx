import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Carrito de Compras | Sequoia Speed",
};

export default function CarritoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
