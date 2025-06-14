"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
        <p className="text-gray-600 mt-2">
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
