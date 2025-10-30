# Taka Home Mobile - Authentication

Ứng dụng di động Taka Home với tính năng đăng nhập và đăng ký đã được xây dựng hoàn chỉnh.

## 🎨 Tính năng

### Đăng nhập (Sign In)

- ✅ Form đăng nhập với email và mật khẩu
- ✅ Validation đầy đủ cho các trường
- ✅ Hiển thị/ẩn mật khẩu
- ✅ Thông báo lỗi rõ ràng
- ✅ Loading state khi đăng nhập
- ✅ Tích hợp với Auth Context
- ✅ UI đẹp mắt với React Native Elements
- ✅ Sử dụng hình ảnh từ assets

### Đăng ký (Sign Up)

- ✅ Form đăng ký với họ tên, email, số điện thoại, mật khẩu
- ✅ Xác nhận mật khẩu
- ✅ Chọn vai trò (Người thuê/Chủ nhà)
- ✅ Checkbox đồng ý điều khoản
- ✅ Validation đầy đủ cho tất cả các trường
- ✅ Hiển thị/ẩn mật khẩu và xác nhận mật khẩu
- ✅ Thông báo lỗi chi tiết
- ✅ Loading state khi đăng ký
- ✅ Tự động đăng nhập sau khi đăng ký thành công
- ✅ UI đẹp mắt với React Native Elements

### UI/UX

- ✅ Giao diện hiện đại, chuyên nghiệp
- ✅ Responsive và tương thích với nhiều kích thước màn hình
- ✅ Keyboard avoiding view
- ✅ Scroll view cho form dài
- ✅ Icons đẹp mắt từ Material Design
- ✅ Theme tutỳ chỉnh cho React Native Elements
- ✅ Sử dụng hình ảnh từ assets/imgs
- ✅ Status bar được cấu hình

## 📁 Cấu trúc dự án

```
app/
├── _layout.tsx                 # Root layout với ThemeProvider và AuthProvider
├── index.tsx                   # Màn hình khởi đầu với logic điều hướng
├── (auth)/
│   ├── signin.tsx             # Màn hình đăng nhập
│   └── signup.tsx             # Màn hình đăng ký
└── (tabs)/                    # Các màn hình chính sau khi đăng nhập

contexts/
└── auth-context.tsx           # Auth context đã được cập nhật cho React Native

lib/
├── api/
│   └── services/
│       └── auth.ts            # Auth service đã được cập nhật
└── theme/
    └── index.tsx              # Theme configuration cho React Native Elements

components/
└── ui/
    ├── Button.tsx             # Custom Button component
    ├── Input.tsx              # Custom Input component
    └── index.ts               # Export UI components

assets/
├── imgs/
│   ├── avatar.png             # Logo/Avatar hiển thị trên trang auth
│   └── illustrate-auth.jpg    # Hình minh họa cho trang đăng nhập
└── logos/
    └── logoHome.svg           # Logo chính của app
```

## 🚀 Cài đặt

### Dependencies đã cài

```bash
npm install @rneui/themed @rneui/base --legacy-peer-deps
npm install --save-dev react-native-svg-transformer
```

### Chạy ứng dụng

```bash
# iOS
npm run ios

# Android
npm run android

# Web (nếu hỗ trợ)
npm run web
```

## 🎯 Cách sử dụng

### 1. Đăng nhập

- Mở app, bạn sẽ được chuyển đến màn hình đăng nhập
- Nhập email và mật khẩu
- Nhấn "Đăng nhập"
- Nếu thành công, bạn sẽ được chuyển đến màn hình chính

### 2. Đăng ký

- Từ màn hình đăng nhập, nhấn "Đăng ký ngay"
- Điền đầy đủ thông tin:
  - Họ và tên (bắt buộc)
  - Email (bắt buộc)
  - Số điện thoại (tùy chọn)
  - Mật khẩu (bắt buộc, tối thiểu 6 ký tự)
  - Xác nhận mật khẩu (phải khớp với mật khẩu)
- Chọn vai trò: Người thuê hoặc Chủ nhà
- Đồng ý với điều khoản sử dụng
- Nhấn "Đăng ký"
- App sẽ tự động đăng nhập sau khi đăng ký thành công

## 🛠️ Công nghệ sử dụng

- **React Native** - Framework di động
- **Expo Router** - Navigation
- **React Native Elements** - UI Library
- **AsyncStorage** - Local storage
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **React Hook Form** (có thể tích hợp) - Form management
- **Zod** (có thể tích hợp) - Schema validation

## 📝 Validation Rules

### Email

- Không được để trống
- Phải đúng định dạng email

### Mật khẩu

- Không được để trống
- Tối thiểu 6 ký tự

### Họ và tên (Đăng ký)

- Không được để trống
- Tối thiểu 2 ký tự

### Số điện thoại (Đăng ký)

- Tùy chọn
- Nếu nhập phải có đúng 10 chữ số

### Xác nhận mật khẩu (Đăng ký)

- Phải khớp với mật khẩu

### Điều khoản (Đăng ký)

- Phải đồng ý mới có thể đăng ký

## 🎨 Customization

### Theme

Bạn có thể tùy chỉnh theme trong `lib/theme/index.tsx`:

- Màu sắc chính
- Màu sắc phụ
- Font size
- Border radius
- Spacing

### Styles

Mỗi màn hình có styles riêng ở cuối file, bạn có thể tùy chỉnh:

- Colors
- Spacing
- Border radius
- Font sizes
- Shadows

## 🔐 Security

- Mật khẩu được ẩn mặc định
- Token được lưu trong AsyncStorage (secure)
- Auto logout khi token hết hạn
- Validation phía client và server

## 📱 Screenshots

_(Chạy app để xem giao diện thực tế)_

## 🐛 Troubleshooting

### SVG không hiển thị

- Đảm bảo đã cài `react-native-svg-transformer`
- Kiểm tra `metro.config.js` đã được cấu hình đúng
- Clear cache: `npx expo start --clear`

### AsyncStorage lỗi

- Đảm bảo đã cài `@react-native-async-storage/async-storage`
- Rebuild app sau khi cài

### Navigation không hoạt động

- Kiểm tra `expo-router` đã được cài đúng version
- Đảm bảo file structure đúng

## 📄 License

MIT

## 👥 Author

Taka Home Team
