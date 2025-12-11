# Taka Home Mobile - Tài Liệu Hệ Thống

## Tổng Quan Hệ Thống

Taka Home Mobile là ứng dụng di động được xây dựng bằng React Native và Expo, phục vụ cho việc quản lý bất động sản, cho thuê nhà, và quản lý hợp đồng.

## Công Nghệ Sử Dụng

### Core Technologies

- **Framework**: React Native với Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **UI Framework**: Native Base / Custom Components

### Key Libraries

- **API Communication**: Axios
- **Real-time Communication**: Socket.IO
- **Maps**: React Native Maps
- **Authentication**: JWT-based authentication
- **Notifications**: Push notifications

## Kiến Trúc Ứng Dụng

### Cấu Trúc Thư Mục

```
taka-home-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── chat/              # Chat screens
│   ├── contracts/         # Contract details
│   ├── invoices/          # Invoice management
│   ├── profile/           # User profile
│   ├── properties/        # Property details
│   ├── verify/            # Verification screens
│   └── wallet/            # Wallet management
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat components
│   ├── contracts/        # Contract components
│   ├── properties/       # Property components
│   └── ui/               # UI components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Core libraries
│   ├── api/             # API services
│   ├── auth/            # Authentication utilities
│   ├── config/          # Configuration
│   ├── contracts/       # Contract utilities
│   ├── socket/          # WebSocket handling
│   ├── theme/           # Theme configuration
│   └── utils/           # Utility functions
├── schema/               # Data schemas
└── types/                # TypeScript type definitions
```

## Các Tính Năng Chính

### 1. Xác Thực & Phân Quyền

- Đăng nhập / Đăng ký
- Xác thực khuôn mặt (Face Verification)
- Phân quyền người dùng (roles)
- Bảo vệ routes (AuthGuard)

**Chi tiết**: Xem [AUTH_README.md](./AUTH_README.md)

### 2. Quản Lý Bất Động Sản

- Xem danh sách properties
- Chi tiết property với bản đồ
- Tìm kiếm và lọc properties
- Upload hình ảnh

**Chi tiết**:

- [PROPERTY_DETAIL_GUIDE.md](./PROPERTY_DETAIL_GUIDE.md)
- [PROPERTY_DETAIL_MOBILE_README.md](./PROPERTY_DETAIL_MOBILE_README.md)
- [HOUSING_TYPE_GUIDE.md](./HOUSING_TYPE_GUIDE.md)

### 3. Quản Lý Hợp Đồng

- Danh sách hợp đồng của người dùng
- Chi tiết hợp đồng
- Theo dõi trạng thái hợp đồng
- Lịch sử hợp đồng trên blockchain

**Chi tiết**:

- [MY_CONTRACTS_GUIDE.md](./MY_CONTRACTS_GUIDE.md)
- [BLOCKCHAIN_HISTORY_GUIDE.md](./BLOCKCHAIN_HISTORY_GUIDE.md)

### 4. Thanh Toán & Hóa Đơn

- Quản lý hóa đơn
- Thanh toán hóa đơn
- Lịch sử thanh toán
- Tích hợp ví điện tử

**Chi tiết**: [INVOICE_PAYMENT_GUIDE.md](./INVOICE_PAYMENT_GUIDE.md)

### 5. Chat & Messaging

- Chat real-time với WebSocket
- Danh sách cuộc trò chuyện
- Chat room
- Chatbot hỗ trợ

**Chi tiết**: [WEBSOCKET_CHAT_GUIDE.md](./WEBSOCKET_CHAT_GUIDE.md)

### 6. Bản Đồ

- Hiển thị vị trí property
- Tích hợp Google Maps
- Marker và info windows

**Chi tiết**:

- [REACT_NATIVE_MAPS_GUIDE.md](./REACT_NATIVE_MAPS_GUIDE.md)
- [MAP_SUMMARY.md](./MAP_SUMMARY.md)

### 7. Ví Điện Tử

- Quản lý số dư
- Lịch sử giao dịch
- Nạp tiền / Rút tiền

## API Services

### Core Services (lib/api/services/)

- **auth.ts**: Xác thực người dùng
- **property.ts**: Quản lý bất động sản
- **contract.ts**: Quản lý hợp đồng
- **invoice.ts**: Quản lý hóa đơn
- **payment.ts**: Xử lý thanh toán
- **chat.ts**: Dịch vụ chat
- **chatbot.ts**: Chatbot AI
- **notification.ts**: Thông báo push
- **booking.ts**: Đặt phòng
- **statistics.ts**: Thống kê
- **vietnam-address.ts**: Địa chỉ Việt Nam

## State Management

### Contexts

- **AuthContext**: Quản lý trạng thái xác thực
- **ChatContext**: Quản lý trạng thái chat real-time

### Custom Hooks

- **use-contracts.ts**: Logic quản lý hợp đồng
- **use-wallet.ts**: Logic quản lý ví
- **use-notifications.ts**: Logic thông báo
- **use-image-upload.ts**: Logic upload ảnh
- **use-toast.ts**: Toast notifications
- **use-role.ts**: Kiểm tra quyền người dùng

## Navigation Structure

### Root Layout

- `app/_layout.tsx`: Root layout với providers

### Authentication Flow

- `app/(auth)/signin.tsx`: Đăng nhập
- `app/(auth)/signup.tsx`: Đăng ký

### Main App (Tabs)

- `app/(tabs)/index.tsx`: Trang chủ
- `app/(tabs)/my-properties.tsx`: Properties của tôi
- `app/(tabs)/contracts.tsx`: Hợp đồng
- `app/(tabs)/contract-history.tsx`: Lịch sử hợp đồng
- `app/(tabs)/chats.tsx`: Danh sách chat
- `app/(tabs)/profile.tsx`: Hồ sơ cá nhân

### Dynamic Routes

- `app/properties/[id].tsx`: Chi tiết property
- `app/contracts/[id].tsx`: Chi tiết hợp đồng
- `app/chat/[roomId].tsx`: Chat room

## Real-time Features

### WebSocket Integration

- Socket.IO client cho chat real-time
- Tự động reconnection
- Event handling cho messages
- Typing indicators (nếu có)

## Security

### Authentication Flow

1. User đăng nhập với credentials
2. Server trả về JWT token
3. Token được lưu trong secure storage
4. Mọi API request kèm theo token trong header
5. AuthGuard bảo vệ các routes yêu cầu xác thực

### Face Verification

- Xác thực khuôn mặt cho các giao dịch quan trọng
- Tích hợp với camera device
- Validation trên server

## Data Flow

### API Request Flow

```
Component → Custom Hook → API Service → Axios Client → Backend Server
                                              ↓
                                         JWT Token
                                              ↓
                                      Error Handler
```

### Real-time Chat Flow

```
Chat Component → ChatContext → Socket.IO → Chat Server
                                  ↓
                           Event Listeners
                                  ↓
                          State Updates
```

## Environment Configuration

### Required Environment Variables

- API Base URL
- WebSocket URL
- Google Maps API Key
- Payment Gateway Keys
- Notification Service Keys

## Build & Deployment

### Development

```bash
npm install
npm start
```

### iOS Build

```bash
eas build --platform ios
```

### Android Build

```bash
eas build --platform android
```

## Testing

### Unit Tests

- Component testing
- Hook testing
- Utility function testing

### Integration Tests

- API integration tests
- Navigation flow tests

## Performance Optimization

### Strategies

- Image lazy loading
- List virtualization
- Memoization của components
- API response caching
- WebSocket connection pooling

## Troubleshooting

### Common Issues

1. **Maps không hiển thị**: Kiểm tra API key
2. **Socket connection failed**: Kiểm tra WebSocket URL
3. **Authentication errors**: Kiểm tra token expiration
4. **Image upload fails**: Kiểm tra file size và format

## Future Enhancements

### Planned Features

- [ ] Offline mode support
- [ ] Advanced search filters
- [ ] Property comparison
- [ ] AR view cho properties
- [ ] Voice commands
- [ ] Multi-language support
- [ ] Dark mode

## Contributing

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Write/update tests
4. Update documentation
5. Submit PR for review

## Support & Contact

Để được hỗ trợ, vui lòng liên hệ team phát triển hoặc tạo issue trên repository.

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintained by**: Taka Home Development Team
