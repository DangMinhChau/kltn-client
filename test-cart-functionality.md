# Test Cart Functionality Checklist

## ✅ Đã Hoàn Thành

### Toast Thông Báo

- [x] Toast khi thêm sản phẩm vào giỏ hàng thành công
- [x] Toast khi cập nhật số lượng sản phẩm trong giỏ hàng
- [x] Toast khi xóa sản phẩm khỏi giỏ hàng
- [x] Toast khi xóa tất cả sản phẩm khỏi giỏ hàng
- [x] Toast khi có lỗi xảy ra (thêm, cập nhật, xóa)

### Validation Stock

- [x] Kiểm tra tồn kho khi thêm sản phẩm (local cart)
- [x] Kiểm tra tồn kho khi cập nhật số lượng (local cart)
- [x] Hiển thị thông báo lỗi khi vượt quá tồn kho

### Loading States

- [x] Loading spinner cho nút tăng/giảm số lượng
- [x] Loading spinner cho nút xóa sản phẩm
- [x] Loading spinner cho nút "Xóa tất cả"
- [x] Disable buttons khi đang loading

### UI/UX Improvements

- [x] CartSheet responsive (w-full sm:max-w-lg)
- [x] Empty state đẹp cho CartSheet
- [x] Empty state đẹp cho trang cart
- [x] Badge animation cho CartIcon
- [x] Hiển thị đúng số lượng sản phẩm trong badge
- [x] Hiển thị giá gốc và giá giảm
- [x] Hiển thị màu sắc và kích thước sản phẩm

## 🧪 Cần Test Manual

### Cart Operations

1. **Thêm sản phẩm vào giỏ hàng:**

   - Từ trang chi tiết sản phẩm
   - Từ QuickViewModal
   - Kiểm tra toast hiển thị
   - Kiểm tra badge số lượng cập nhật

2. **Cập nhật số lượng:**

   - Tăng số lượng từ CartSheet
   - Giảm số lượng từ CartSheet
   - Tăng số lượng từ trang cart
   - Giảm số lượng từ trang cart
   - Kiểm tra validation tồn kho

3. **Xóa sản phẩm:**

   - Xóa từ CartSheet
   - Xóa từ trang cart
   - Kiểm tra toast thông báo

4. **Xóa tất cả:**
   - Từ CartSheet
   - Từ trang cart
   - Kiểm tra toast thông báo

### Error Handling

1. **Trường hợp lỗi mạng:**

   - Thêm sản phẩm khi API lỗi
   - Cập nhật số lượng khi API lỗi
   - Xóa sản phẩm khi API lỗi

2. **Trường hợp vượt tồn kho:**
   - Thêm số lượng lớn hơn tồn kho
   - Cập nhật số lượng vượt tồn kho

### UI/UX

1. **Loading states:**

   - Kiểm tra spinner hiển thị khi đang thực hiện thao tác
   - Kiểm tra buttons bị disable khi loading

2. **Responsive:**

   - Test CartSheet trên mobile
   - Test trang cart trên mobile
   - Test badge CartIcon trên mobile

3. **Transitions:**
   - Mở/đóng CartSheet
   - Animation badge khi thêm sản phẩm
   - Transitions khi xóa item

## 🔧 Cải Thiện Tiếp Theo (Tùy Chọn)

### Performance

- [ ] Thêm debounce cho cập nhật số lượng
- [ ] Lazy loading cho hình ảnh sản phẩm
- [ ] Memoization cho computed values

### UX Enhancements

- [ ] Thêm animation khi thêm/xóa item
- [ ] Thêm confirmation dialog khi xóa tất cả
- [ ] Thêm skeleton loading khi fetch cart
- [ ] Thêm offline support

### Advanced Features

- [ ] Save for later
- [ ] Recently viewed items suggestion
- [ ] Cross-sell/up-sell recommendations
- [ ] Share cart functionality
