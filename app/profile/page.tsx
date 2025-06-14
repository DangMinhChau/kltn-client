import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserProfile from "@/components/user/UserProfile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin cá nhân và tài khoản của bạn
          </p>
        </div>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
