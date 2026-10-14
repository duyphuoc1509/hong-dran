# Sử dụng Node.js Alpine nhẹ và tối ưu cho môi trường Dokloy
FROM node:20-alpine

WORKDIR /app

# Cài đặt curl phục vụ healthcheck và kiểm tra kết nối trong container
RUN apk add --no-cache curl

# Cài đặt thư viện production
COPY package*.json ./
RUN npm install --omit=dev

# Sao chép toàn bộ mã nguồn website
COPY . .

# Khai báo biến môi trường mặc định
ENV NODE_ENV=production
ENV PORT=10021

# Mở cổng 10021 phục vụ truy cập
EXPOSE 10021

# Healthcheck chuẩn Docker giúp Dokloy nhận diện trạng thái healthy ngay lập tức
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:10021/health || exit 1

# Lệnh khởi chạy ứng dụng
CMD ["node", "server.js"]
