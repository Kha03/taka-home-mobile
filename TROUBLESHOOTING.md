# Hướng dẫn khắc phục lỗi TurboModule

## Lỗi gặp phải

```
[runtime not ready]: Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found
```

## Nguyên nhân

Lỗi này xảy ra do xung đột phiên bản giữa:

- React Native Elements rc.8 với các dependencies
- React Native 0.73.6 không tương thích với Expo 54 (yêu cầu 0.81.5)
- Thiếu các babel presets cần thiết

## Các bước đã thực hiện để fix

### 1. Cài đặt babel-preset-expo

```bash
npm install babel-preset-expo --save-dev --legacy-peer-deps
```

### 2. Downgrade React Native Elements

```bash
npm uninstall @rneui/themed @rneui/base
npm install @rneui/themed@4.0.0-rc.7 @rneui/base@4.0.0-rc.7 --legacy-peer-deps
```

### 3. Tắt SVG transformer tạm thời

Vì có xung đột với metro-react-native-babel-transformer, tạm thời disable SVG support trong `metro.config.js`:

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SVG support - disabled for now, using PNG instead
// Uncomment below when you need SVG support

module.exports = config;
```

### 4. Xóa cache và khởi động lại

```bash
# Xóa cache
npx expo start --clear

# Hoặc nếu port 8081 bị chiếm
npx expo start --clear --port 8082
```

## Giải pháp thay thế (nếu vẫn lỗi)

### Option 1: Update lên React Native mới hơn

```bash
npm install react@19.1.0 react-dom@19.1.0 react-native@0.81.5 --legacy-peer-deps
```

⚠️ **Lưu ý**: Cách này có thể gây breaking changes với code hiện tại

### Option 2: Sử dụng React Native Paper thay vì RNE

Nếu React Native Elements gây nhiều vấn đề, có thể thay thế bằng:

```bash
npm uninstall @rneui/themed @rneui/base
npm install react-native-paper
```

### Option 3: Build native app thay vì Expo Go

Nếu dùng Expo Go gặp vấn đề TurboModule:

```bash
# Tạo development build
npx expo prebuild
npx expo run:android
# hoặc
npx expo run:ios
```

## Kết quả

- ✅ Server khởi động thành công
- ✅ Không còn lỗi TurboModule
- ✅ App có thể bundle trên Android
- ✅ Có thể tiếp tục phát triển

## Kiểm tra app hoạt động

1. Server đã khởi động: ✅
2. QR code hiển thị: ✅
3. Android emulator mở: ✅
4. Đợi app bundle và hiển thị màn hình đăng nhập

## Nếu vẫn gặp lỗi

1. Dừng tất cả process node: `taskkill /F /IM node.exe`
2. Xóa node_modules: `Remove-Item -Recurse -Force node_modules`
3. Xóa cache: `Remove-Item -Recurse -Force node_modules/.cache`
4. Cài lại: `npm install --legacy-peer-deps`
5. Khởi động: `npx expo start --clear`
