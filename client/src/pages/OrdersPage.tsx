import ComingSoonPage from "@/components/ComingSoonPage";
import { ShoppingCart } from "lucide-react";
export default function OrdersPage() {
  return (
    <ComingSoonPage
      icon={ShoppingCart}
      title="Orders"
      description="Track purchases, manage suppliers, and get smart restock suggestions."
      features={[
        "Purchase history and order tracking",
        "Supplier management and price tracking",
        "Restock suggestions based on usage",
        "One-click reorder from saved links",
        "Price comparison across suppliers",
      ]}
      accentColor="oklch(0.70 0.18 145)"
    />
  );
}
