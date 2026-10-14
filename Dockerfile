# Sử dụng Node.js Alpine nhẹ và tối ưu cho môi trường Dokloy
FROM node:20-alpine

WORKDIR /app

# Cài đặt thư viện production
COPY package*.json ./
RUN npm install --omit=dev

# Sao chép toàn bộ mã nguồn website
COPY . .

# Khai báo biến môi trường mặc định
ENV NODE_ENV=production
ENV PORT=3000

# Mở cổng 3000 phục vụ truy cập
EXPOSE 3000

# Lệnh khởi chạy ứng dụng
CMD ["node", "server.js"]
