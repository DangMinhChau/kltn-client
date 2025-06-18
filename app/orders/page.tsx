import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderHistory from "../../components/order/OrderHistory";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử đặt hàng</h1>
            <p className="text-gray-600 mt-2">
              Xem lại tất cả các đơn hàng đã đặt của bạn
            </p>
          </div>
          <OrderHistory />
        </div>
      </div>
    </ProtectedRoute>
  );
}
