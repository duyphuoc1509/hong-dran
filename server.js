/**
 * SERVER NODE.JS - HỒNG CHÍN D'RAN (MI HỒNG ĐÀ LẠT)
 * Phục vụ website tĩnh và tiếp nhận đơn hàng gửi thông báo tức thì về Telegram qua biến môi trường (.env)
 * Tương thích triển khai bằng Dokloy / Docker / VPS
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 10021;

// Tin tưởng proxy (Traefik / Dokloy / Nginx)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request trực quan giúp theo dõi truy cập trên Dokloy / Docker logs
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Phục vụ các file tĩnh trong thư mục dự án
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  maxAge: '1h'
}));

// Route trang chủ rõ ràng (Tránh bị treo trên reverse proxy)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint cho Dokloy / Docker container monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    port: PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
  });
});

// API tiếp nhận đơn hàng và gửi notification về Telegram
app.post('/api/send-order', async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      note,
      weight,
      estimateFruits,
      totalPrice,
      shipDate,
      timeSlot,
      ripeness,
      area
    } = req.body;

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!phone && !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ít nhất số điện thoại hoặc tên người nhận!'
      });
    }

    const customerName = name || 'Khách vãng lai';
    const customerPhone = phone || 'Chưa cung cấp';
    const customerAddress = address || 'Chưa cung cấp địa chỉ cụ thể';
    const customerNote = note || 'Không có';
    const formattedPrice = Number(totalPrice || 0).toLocaleString('vi-VN');
    const orderTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Tạo nội dung tin nhắn Telegram định dạng HTML
    const messageText = 
`🔔 <b>CÓ ĐƠN HÀNG HỒNG D'RAN MỚI!</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${customerName}
📞 <b>SĐT:</b> <a href="tel:${customerPhone}">${customerPhone}</a>
🏠 <b>Địa chỉ:</b> ${customerAddress}
━━━━━━━━━━━━━━━━━━━━━━
🍊 <b>Số lượng:</b> ${weight || 1}kg (${estimateFruits || ''})
💰 <b>Tổng tiền tạm tính:</b> <b>${formattedPrice} đ</b>
📅 <b>Ngày hẹn ship:</b> ${shipDate || 'Thứ Hai 19/10'}
⏰ <b>Khung giờ:</b> ${timeSlot || 'Cả ngày (Linh hoạt)'}
🍈 <b>Độ chín yêu cầu:</b> ${ripeness || 'Vàng cam còn cứng'}
🛵 <b>Khu vực:</b> ${area || 'Freeship quanh KDC Gia Hòa / ĐH Ngân Hàng'}
📝 <b>Ghi chú:</b> <i>${customerNote}</i>
━━━━━━━━━━━━━━━━━━━━━━
⏰ <i>Thời gian đặt: ${orderTime}</i>
🌐 <i>Nguồn: Website hongtrunglang-dran.vn</i>`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Nếu đã cấu hình biến môi trường TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID trong Dokloy / .env
    if (botToken && chatId) {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const tgResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const tgData = await tgResponse.json();

      if (!tgData.ok) {
        console.error('Lỗi phản hồi từ Telegram API:', tgData);
        return res.status(500).json({
          success: false,
          message: 'Không thể gửi tin nhắn qua Telegram Bot: ' + (tgData.description || 'Lỗi không xác định')
        });
      }

      console.log(`[ĐƠN HÀNG MỚI ĐÃ GỬI TELEGRAM] Khách: ${customerName} - SĐT: ${customerPhone} - Số lượng: ${weight}kg`);
      return res.status(200).json({
        success: true,
        message: 'Đơn hàng của bạn đã được gửi thành công đến Telegram của nhà vườn! Em sẽ liên hệ sớm nhất.'
      });
    } else {
      console.warn('⚠️ [CHƯA CẤU HÌNH BIẾN MÔI TRƯỜNG TELEGRAM] Đơn hàng nhận được:');
      console.log({
        customerName,
        customerPhone,
        customerAddress,
        weight,
        totalPrice: formattedPrice,
        shipDate,
        customerNote
      });

      return res.status(200).json({
        success: true,
        demo: true,
        message: 'Đã tiếp nhận đơn hàng thành công! (Lưu ý: Chưa điền TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID trong biến môi trường Dokloy)'
      });
    }

  } catch (error) {
    console.error('Lỗi máy chủ khi xử lý đơn hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra trên hệ thống máy chủ: ' + error.message
    });
  }
});

// Fallback cho SPA (chỉ những route không chứa đuôi mở rộng file tĩnh)
app.get('*', (req, res, next) => {
  if (req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Xử lý 404 cho file không tìm thấy
app.use((req, res) => {
  res.status(404).send('Không tìm thấy tệp yêu cầu!');
});

// Khởi chạy server: Lắng nghe trên mọi interface (IPv4 & IPv6 dual-stack) để tránh lỗi connection refused / treo khi curl localhost
const server = app.listen(PORT, () => {
  const addr = server.address();
  console.log(`====================================================`);
  console.log(`🍊 Website Hồng Chín D'Ran đang chạy tại cổng: ${PORT}`);
  console.log(`👉 Bound address: ${JSON.stringify(addr)}`);
  console.log(`👉 Truy cập local: http://localhost:${PORT}`);
  console.log(`👉 Health check:   http://localhost:${PORT}/health`);
  console.log(`📱 Telegram Bot:   ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Đã cấu hình' : '⚠️ Chưa cấu hình (Xem file .env)'}`);
  console.log(`====================================================`);
});
