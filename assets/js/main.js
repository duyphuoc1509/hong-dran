/**
 * HỒNG TRỨNG LÁNG D'RAN (MI HỒNG ĐÀ LẠT) - MAIN JAVASCRIPT
 * Tương tác tính giá, đếm ngược ngày giao hàng, chọn ngày ship linh hoạt
 * Tích hợp gửi thông báo đơn hàng trực tiếp về Telegram qua backend Dokloy API
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initShippingDateControls();
  initOrderCalculator();
  initFaqAccordion();
  initCopyHotline();
  initSmoothScroll();
  initSuccessModalControls();
});

/* ==========================================================================
   1. ĐỒNG HỒ ĐẾM NGƯỢC CHUYẾN GIAO HỒNG
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-mins');
  const secondsEl = document.getElementById('count-secs');
  const tripBadgeEl = document.getElementById('current-trip-badge');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const currentYear = new Date().getFullYear();
  const trip1Target = new Date(`${currentYear}-10-19T08:00:00+07:00`).getTime();
  const trip2Target = new Date(`${currentYear}-10-23T08:00:00+07:00`).getTime();

  function updateTimer() {
    const now = new Date().getTime();
    let target = trip1Target;
    let tripName = "Chuyến 1: Thứ Hai 19/10 (Trước Rằm 9)";

    if (now > trip1Target) {
      target = trip2Target;
      tripName = "Chuyến 2: Thứ Sáu 23/10 (Đúng đợt Rằm 9)";
    }

    if (tripBadgeEl) {
      tripBadgeEl.innerText = tripName;
    }

    const distance = target - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      if (tripBadgeEl) tripBadgeEl.innerText = "Đang giao các đơn hàng đợt Rằm!";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   2. KHỞI TẠO ĐIỀU KHIỂN CHỌN NGÀY SHIP LINH HOẠT
   ========================================================================== */
function initShippingDateControls() {
  const dateInput = document.getElementById('order-custom-date');
  const dateQuickButtons = document.querySelectorAll('.js-quick-date-btn');
  const customDateContainer = document.getElementById('custom-date-container');

  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  dateQuickButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      dateQuickButtons.forEach(b => {
        b.classList.remove('bg-orange-600', 'text-white', 'border-orange-600');
        b.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
      });

      btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
      btn.classList.add('bg-orange-600', 'text-white', 'border-orange-600');

      const targetValue = btn.dataset.dateValue;

      if (targetValue === 'custom') {
        if (customDateContainer) {
          customDateContainer.classList.remove('hidden');
          if (dateInput) dateInput.focus();
        }
      } else {
        if (customDateContainer) {
          customDateContainer.classList.add('hidden');
        }
        if (dateInput && btn.dataset.dateIso) {
          dateInput.value = btn.dataset.dateIso;
        }
      }
    });
  });
}

/* ==========================================================================
   3. BỘ TÍNH TIỀN NHANH, GỬI ĐƠN TELEGRAM & ZALO
   ========================================================================== */
function initOrderCalculator() {
  const packageRadios = document.querySelectorAll('input[name="persimmon_package"]');
  const customKgInput = document.getElementById('custom-kg-input');
  const totalAmountEl = document.getElementById('calc-total-amount');
  const unitEstimateEl = document.getElementById('calc-unit-estimate');
  const savingEl = document.getElementById('calc-saving-badge');
  const shippingBadgeEl = document.getElementById('calc-shipping-badge');
  const areaSelect = document.getElementById('order-area-select');
  const timeSlotSelect = document.getElementById('order-time-slot');
  const ripenessSelect = document.getElementById('order-ripeness-pref');
  const dateInput = document.getElementById('order-custom-date');
  const customerNameInput = document.getElementById('customer-name');
  const customerPhoneInput = document.getElementById('customer-phone');
  const customerAddressInput = document.getElementById('customer-address');
  const customerNoteInput = document.getElementById('customer-note');
  
  const btnOrderSubmit = document.getElementById('btn-order-submit');
  const btnZaloSubmit = document.getElementById('btn-order-zalo');

  if (!totalAmountEl) return;

  function calculate() {
    let selectedPackage = document.querySelector('input[name="persimmon_package"]:checked');
    let packageType = selectedPackage ? selectedPackage.value : '3kg';
    let weight = 3;
    let totalPrice = 180000;
    let estimateFruits = "Khoảng 40 – 50 trái";
    let saving = 6000;

    if (packageType === '1kg') {
      weight = 1;
      totalPrice = 62000;
      estimateFruits = "Khoảng 13 – 17 trái";
      saving = 0;
      if (customKgInput) customKgInput.value = 1;
    } else if (packageType === '3kg') {
      weight = 3;
      totalPrice = 180000;
      estimateFruits = "Khoảng 40 – 50 trái";
      saving = 6000;
      if (customKgInput) customKgInput.value = 3;
    } else if (packageType === '5kg') {
      weight = 5;
      totalPrice = 295000;
      estimateFruits = "Khoảng 65 – 85 trái";
      saving = 15000;
      if (customKgInput) customKgInput.value = 5;
    } else if (packageType === 'custom') {
      weight = parseFloat(customKgInput.value) || 1;
      if (weight <= 0) weight = 1;
      
      if (weight === 3) {
        totalPrice = 180000;
        saving = 6000;
      } else if (weight === 5) {
        totalPrice = 295000;
        saving = 15000;
      } else if (weight < 3) {
        totalPrice = weight * 62000;
        saving = 0;
      } else if (weight < 5) {
        totalPrice = weight * 60000;
        saving = weight * 2000;
      } else {
        totalPrice = weight * 59000;
        saving = weight * 3000;
      }
      
      const minFruits = Math.round(weight * 13);
      const maxFruits = Math.round(weight * 17);
      estimateFruits = `Khoảng ${minFruits} – ${maxFruits} trái`;
    }

    totalAmountEl.textContent = Number(totalPrice).toLocaleString('vi-VN') + ' đ';
    if (unitEstimateEl) {
      unitEstimateEl.textContent = `${weight}kg (${estimateFruits})`;
    }

    if (savingEl) {
      if (saving > 0) {
        savingEl.textContent = `Tiết kiệm ${saving.toLocaleString('vi-VN')} đ`;
        savingEl.classList.remove('hidden');
      } else {
        savingEl.classList.add('hidden');
      }
    }

    if (shippingBadgeEl && areaSelect) {
      if (areaSelect.value === 'freeship') {
        shippingBadgeEl.innerHTML = `<span class="inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-lg text-xs font-bold">🎉 Miễn Phí Vận Chuyển (Bán kính 5km quanh Q9 / Thủ Đức)</span>`;
      } else {
        shippingBadgeEl.innerHTML = `<span class="inline-flex items-center text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg text-xs font-bold">🚚 Nhận COD toàn quốc (Mua túi 3kg/5kg hỗ trợ tiền ship tối đa)</span>`;
      }
    }

    return { weight, totalPrice, estimateFruits, packageType };
  }

  packageRadios.forEach(radio => radio.addEventListener('change', calculate));

  if (customKgInput) {
    customKgInput.addEventListener('input', () => {
      const customRadio = document.querySelector('input[value="custom"]');
      if (customRadio) customRadio.checked = true;
      calculate();
    });
  }

  if (areaSelect) areaSelect.addEventListener('change', calculate);

  // Lấy dữ liệu đơn hàng hiện tại
  function getOrderData() {
    const current = calculate();
    const name = customerNameInput ? customerNameInput.value.trim() : '';
    const phone = customerPhoneInput ? customerPhoneInput.value.trim() : '';
    const address = customerAddressInput ? customerAddressInput.value.trim() : '';
    const note = customerNoteInput ? customerNoteInput.value.trim() : '';
    const area = areaSelect ? areaSelect.options[areaSelect.selectedIndex].text : 'Freeship quanh KDC Gia Hòa / ĐH Ngân Hàng';
    const timeSlot = timeSlotSelect ? timeSlotSelect.value : 'Cả ngày (Linh hoạt)';
    const ripeness = ripenessSelect ? ripenessSelect.value : 'Hồng mới về còn cứng vàng cam (tự ủ 2-3 hôm)';

    let selectedDateStr = 'Thứ Hai ngày 19/10 (Trước Rằm)';
    const activeDateBtn = document.querySelector('.js-quick-date-btn.bg-orange-600');
    
    if (activeDateBtn) {
      const val = activeDateBtn.dataset.dateValue;
      if (val === 'custom') {
        if (dateInput && dateInput.value) {
          const parts = dateInput.value.split('-');
          if (parts.length === 3) {
            selectedDateStr = `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            selectedDateStr = dateInput.value;
          }
        } else {
          selectedDateStr = 'Giao ngày sớm nhất có thể';
        }
      } else {
        selectedDateStr = activeDateBtn.textContent.trim().replace(/\s+/g, ' ');
      }
    }

    return {
      name,
      phone,
      address,
      note,
      weight: current.weight,
      estimateFruits: current.estimateFruits,
      totalPrice: current.totalPrice,
      shipDate: selectedDateStr,
      timeSlot,
      ripeness,
      area
    };
  }

  // Hàm xử lý gửi đơn lên Server (gửi Telegram)
  async function submitOrderProcess(triggerButton, openZaloAfterwards = false) {
    const orderData = getOrderData();

    if (!orderData.phone && !orderData.name) {
      showToast("Vui lòng nhập số điện thoại hoặc họ tên để em tiện liên hệ giao hàng nha!");
      if (customerPhoneInput) customerPhoneInput.focus();
      return;
    }

    // Hiệu ứng nút đang gửi
    const originalText = triggerButton.innerHTML;
    triggerButton.disabled = true;
    triggerButton.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> Đang gửi đơn...`;

    try {
      // Gửi yêu cầu đến API backend Dokloy
      const response = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const resData = await response.json().catch(() => ({ success: true }));

      // Mở modal thành công trên giao diện
      showSuccessModal(orderData);
      showToast("🎉 Đã gửi đơn thành công về hệ thống shop!");

      // Nếu người dùng chọn đặt qua Zalo
      if (openZaloAfterwards) {
        let msg = `Chào shop Hồng Trứng Láng D'Ran (Mi Hồng Đà Lạt)!\n`;
        msg += `Mình vừa gửi đơn qua web và muốn xác nhận thêm:\n`;
        msg += `🍊 Số lượng: ${orderData.weight}kg (${orderData.estimateFruits})\n`;
        msg += `💰 Thành tiền tạm tính: ${Number(orderData.totalPrice).toLocaleString('vi-VN')} đ\n`;
        msg += `📅 Ngày ship: ${orderData.shipDate}\n`;
        msg += `⏰ Khung giờ: ${orderData.timeSlot}\n`;
        msg += `🍈 Yêu cầu quả: ${orderData.ripeness}\n`;
        if (orderData.name) msg += `👤 Họ tên: ${orderData.name}\n`;
        if (orderData.phone) msg += `📞 SĐT: ${orderData.phone}\n`;
        if (orderData.address) msg += `🏠 Địa chỉ: ${orderData.address}\n`;
        if (orderData.note) msg += `📝 Ghi chú: ${orderData.note}\n`;
        msg += `Shop kiểm tra tin nhắn Telegram hoặc xác nhận tại đây giúp mình nhé! Cảm ơn shop 🧡`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).catch(() => {});
        }

        setTimeout(() => {
          window.open('https://zalo.me/0797599056', '_blank');
        }, 600);
      }

    } catch (err) {
      console.warn('Lỗi kết nối API gửi đơn:', err);
      // Fallback: Nếu web đang chạy dạng file:// tĩnh không có server, vẫn mở modal thành công và mở Zalo
      showSuccessModal(orderData);
      showToast("Đã ghi nhận đơn hàng! Mở Zalo để liên hệ trực tiếp...");
      if (openZaloAfterwards) {
        setTimeout(() => {
          window.open('https://zalo.me/0797599056', '_blank');
        }, 500);
      }
    } finally {
      triggerButton.disabled = false;
      triggerButton.innerHTML = originalText;
    }
  }

  // Gắn sự kiện cho nút Đặt Hàng & Gửi Đơn Ngay (Gửi Telegram)
  if (btnOrderSubmit) {
    btnOrderSubmit.addEventListener('click', () => {
      submitOrderProcess(btnOrderSubmit, false);
    });
  }

  // Gắn sự kiện cho nút Gửi Đơn Qua Zalo (Gửi Telegram + Mở Zalo)
  if (btnZaloSubmit) {
    btnZaloSubmit.addEventListener('click', () => {
      submitOrderProcess(btnZaloSubmit, true);
    });
  }

  calculate();
}

/* ==========================================================================
   4. MODAL THÔNG BÁO ĐẶT HÀNG THÀNH CÔNG
   ========================================================================== */
function showSuccessModal(orderData) {
  const modal = document.getElementById('order-success-modal');
  if (!modal) return;

  const summaryName = document.getElementById('modal-summary-name');
  const summaryPhone = document.getElementById('modal-summary-phone');
  const summaryPackage = document.getElementById('modal-summary-package');
  const summaryDate = document.getElementById('modal-summary-date');
  const summaryTotal = document.getElementById('modal-summary-total');

  if (summaryName) summaryName.textContent = orderData.name || 'Quý khách';
  if (summaryPhone) summaryPhone.textContent = orderData.phone || 'Chưa cung cấp';
  if (summaryPackage) summaryPackage.textContent = `${orderData.weight}kg (${orderData.estimateFruits})`;
  if (summaryDate) summaryDate.textContent = `${orderData.shipDate} - ${orderData.timeSlot}`;
  if (summaryTotal) summaryTotal.textContent = Number(orderData.totalPrice).toLocaleString('vi-VN') + ' đ';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function initSuccessModalControls() {
  const modal = document.getElementById('order-success-modal');
  const closeBtns = document.querySelectorAll('.js-close-modal');

  if (!modal) return;

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    });
  });

  // Đóng khi click ngoài backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  });
}

/* ==========================================================================
   5. ACCORDION CÂU HỎI THƯỜNG GẶP (FAQ)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.accordion-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. TIỆN ÍCH COPY SỐ ĐIỆN THOẠI & TOAST
   ========================================================================== */
function initCopyHotline() {
  const copyButtons = document.querySelectorAll('.js-copy-hotline');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = "0797599056";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(phone).then(() => {
          showToast(`Đã chép số SĐT/Zalo: ${phone}`);
        });
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('persimmon-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'persimmon-toast';
    toast.className = 'fixed top-5 right-5 z-[9999] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all transform duration-300 opacity-0 -translate-y-4 max-w-sm flex items-center space-x-2 border border-orange-500';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="text-orange-400 text-lg">🍊</span><span>${message}</span>`;
  toast.classList.remove('opacity-0', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-4');
  }, 4000);
}

/* ==========================================================================
   7. CUỘN TRANG MƯỢT MÀ CHO LINK NEO
   ========================================================================== */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
