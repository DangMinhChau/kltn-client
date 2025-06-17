# 🔍 PayPal Integration Debug Guide

## 🚨 Current Issue

Lỗi "Validation failed" khi nhấn thanh toán PayPal

## 🛠️ Debug Steps Đã Thêm

### 1. Frontend Validation (Checkout Page)

✅ **Validation orderData trước khi gửi:**

- Kiểm tra finalTotal > 0
- Kiểm tra customerName, customerEmail, shippingAddress không trống
- Kiểm tra items có tồn tại
- Hiển thị lỗi validation nếu có

✅ **Debug logging:**

- Log tất cả dữ liệu checkout (subtotal, shipping, discount, finalTotal)
- Log shipping form data
- Log items và voucher

### 2. PayPal Button Component

✅ **Enhanced validation:**

- Validate amount > 0
- Validate orderData có đầy đủ thông tin
- Validate orderID tồn tại
- Round amount cho VND currency

✅ **Detailed logging:**

- Log từng bước create order
- Log API request/response
- Log error details với status code

✅ **Improved error handling:**

- Handle JSON và text response errors
- Log response headers
- More specific error messages

## 🧪 Testing Checklist

### Step 1: Kiểm tra Frontend Data

1. Mở Developer Tools (F12)
2. Navigate to Console tab
3. Điền đầy đủ form checkout
4. Chọn PayPal payment method
5. Kiểm tra console logs:
   ```
   === PayPal Checkout Debug ===
   Subtotal: [number]
   Shipping Fee: [number]
   Discount: [number]
   Final Total: [number]
   ```

### Step 2: Kiểm tra Validation Errors

- Nếu có validation errors, sẽ hiển thị red box với danh sách lỗi
- Sửa tất cả validation errors trước khi test PayPal

### Step 3: Kiểm tra PayPal Order Creation

Khi click PayPal button, check console logs:

```
=== PayPal Create Order Debug ===
Amount: [number]
OrderData: [object]
Creating backend order first...
Backend order response status: [status]
Backend order created with ID: [orderID]
Creating PayPal order with orderID: [orderID]
PayPal order payload: [object]
PayPal API response status: [status]
PayPal order response: [object]
PayPal order created successfully: [paypalOrderID]
```

## 🔧 Common Issues & Solutions

### Issue 1: Amount = 0 hoặc âm

**Symptoms:** "Invalid amount for PayPal order"
**Solutions:**

- Kiểm tra discount không vượt quá subtotal + shipping
- Đảm bảo items có giá > 0

### Issue 2: Missing Required Fields

**Symptoms:** "Missing required shipping information"
**Solutions:**

- Điền đầy đủ: tên, email, địa chỉ giao hàng
- Kiểm tra form validation

### Issue 3: Empty Cart

**Symptoms:** "No items in order"
**Solutions:**

- Thêm sản phẩm vào giỏ hàng
- Kiểm tra items mapping

### Issue 4: Backend Order Creation Failed

**Symptoms:** HTTP 400/500 từ `/orders` endpoint
**Solutions:**

- Kiểm tra backend server running
- Kiểm tra authentication token
- Kiểm tra order data format

### Issue 5: PayPal API Failed

**Symptoms:** HTTP error từ `/payments/paypal/create-order`
**Solutions:**

- Kiểm tra PayPal configuration
- Kiểm tra VND currency support
- Kiểm tra amount format (integer cho VND)

## 📊 Expected Data Format

### OrderData Structure:

```json
{
  "customerName": "string (required)",
  "customerEmail": "string (required)",
  "customerPhone": "string",
  "shippingAddress": "string (required)",
  "items": [
    {
      "variantId": "string",
      "quantity": "number",
      "unitPrice": "number"
    }
  ],
  "voucherId": "string|null",
  "subTotal": "number",
  "shippingFee": "number",
  "discount": "number",
  "totalPrice": "number (positive)",
  "note": "string",
  "userId": "string|null"
}
```

### PayPal Order Payload:

```json
{
  "orderId": "string (required)",
  "amount": "number (positive integer for VND)",
  "currency": "VND"
}
```

## 🎯 Next Steps

1. **Test với debug logging** - Xem console để identify exact error
2. **Check backend logs** - Kiểm tra server logs cho detailed error
3. **Verify PayPal config** - Đảm bảo PayPal SDK và credentials đúng
4. **Test với simple data** - Try với minimal valid data trước

## 🆘 If Still Failing

Nếu vẫn lỗi sau khi check tất cả trên:

1. Share exact console logs
2. Share backend error logs
3. Test với Postman để isolate frontend vs backend issue
4. Check PayPal sandbox dashboard cho transaction logs
