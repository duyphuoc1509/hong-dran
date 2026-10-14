/**
 * HỒNG TRỨNG LÁNG D'RAN - MAIN JAVASCRIPT
 * Tương tác tính giá, đếm ngược ngày giao hàng, mở Zalo đặt hàng nhanh
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initOrderCalculator();
  initFaqAccordion();
  initCopyHotline();
  initSmoothScroll();
});

/* ==========================================================================
   1. ĐỒNG HỒ ĐẾM NGƯỢC CHUYẾN GIAO HỒNG
   Chuyến 1: Thứ Hai 19/10 | Chuyến 2: Thứ Sáu 23/10
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-mins');
  const secondsEl = document.getElementById('count-secs');
  const tripBadgeEl = document.getElementById('current-trip-badge');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const currentYear = new Date().getFullYear();
  
  // Mục tiêu chuyến 1: 19/10 lúc 08:00 sáng
  const trip1Target = new Date(`${currentYear}-10-19T08:00:00+07:00`).getTime();
  // Mục tiêu chuyến 2: 23/10 lúc 08:00 sáng
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
   2. BỘ TÍNH TIỀN NHANH & ĐẶT HÀNG QUA ZALO
   ========================================================================== */
function initOrderCalculator() {
  const packageRadios = document.querySelectorAll('input[name="persimmon_package"]');
  const customKgInput = document.getElementById('custom-kg-input');
  const totalAmountEl = document.getElementById('calc-total-amount');
  const unitEstimateEl = document.getElementById('calc-unit-estimate');
  const savingEl = document.getElementById('calc-saving-badge');
  const shippingBadgeEl = document.getElementById('calc-shipping-badge');
  const tripSelect = document.getElementById('order-trip-select');
  const areaSelect = document.getElementById('order-area-select');
  const customerNameInput = document.getElementById('customer-name');
  const customerPhoneInput = document.getElementById('customer-phone');
  const customerAddressInput = document.getElementById('customer-address');
  const btnZaloSubmit = document.getElementById('btn-order-zalo');
  const btnDirectCall = document.getElementById('btn-order-call');

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

    // Cập nhật giao diện
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

    // Phí ship theo địa chỉ
    if (shippingBadgeEl && areaSelect) {
      if (areaSelect.value === 'freeship') {
        shippingBadgeEl.innerHTML = `<span class="inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-semibold">🎉 Miễn Phí Vận Chuyển (Bán kính 5km)</span>`;
      } else {
        shippingBadgeEl.innerHTML = `<span class="inline-flex items-center text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-xs font-semibold">🚚 Hỗ trợ tiền ship COD khi mua túi 3kg/5kg</span>`;
      }
    }

    return { weight, totalPrice, estimateFruits, packageType };
  }

  // Lắng nghe chọn radio
  packageRadios.forEach(radio => {
    radio.addEventListener('change', calculate);
  });

  // Khi thay đổi số kg tùy chọn
  if (customKgInput) {
    customKgInput.addEventListener('input', () => {
      const customRadio = document.querySelector('input[value="custom"]');
      if (customRadio) {
        customRadio.checked = true;
      }
      calculate();
    });
  }

  // Khi chọn khu vực
  if (areaSelect) {
    areaSelect.addEventListener('change', calculate);
  }

  // Nút Đặt Hàng Qua Zalo
  if (btnZaloSubmit) {
    btnZaloSubmit.addEventListener('click', (e) => {
      const current = calculate();
      const name = customerNameInput ? customerNameInput.value.trim() : '';
      const phone = customerPhoneInput ? customerPhoneInput.value.trim() : '';
      const address = customerAddressInput ? customerAddressInput.value.trim() : '';
      const trip = tripSelect ? tripSelect.options[tripSelect.selectedIndex].text : 'Thứ Hai 19/10';
      const area = areaSelect ? areaSelect.options[areaSelect.selectedIndex].text : 'Freeship quanh KDC Gia Hòa / ĐH Ngân Hàng';

      let msg = `Chào shop Hồng Trứng Láng D'Ran!\n`;
      msg += `Mình muốn đặt hàng:\n`;
      msg += `🍊 Số lượng: ${current.weight}kg (${current.estimateFruits})\n`;
      msg += `💰 Thành tiền tạm tính: ${Number(current.totalPrice).toLocaleString('vi-VN')} đ\n`;
      msg += `🚚 Chuyến giao mong muốn: ${trip}\n`;
      msg += `📍 Khu vực: ${area}\n`;
      if (name) msg += `👤 Họ tên: ${name}\n`;
      if (phone) msg += `📞 SĐT: ${phone}\n`;
      if (address) msg += `🏠 Địa chỉ nhận: ${address}\n`;
      msg += `Shop xác nhận đơn giúp mình nhé! Cảm ơn shop.`;

      // Sao chép nội dung vào clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).catch(() => {});
      }

      showToast("Đã soạn sẵn thông tin đơn! Đang mở Zalo shop 0797599056...");

      // Mở Zalo chat với số điện thoại 0797599056
      setTimeout(() => {
        window.open('https://zalo.me/0797599056', '_blank');
      }, 700);
    });
  }

  // Khởi tạo tính lần đầu
  calculate();
}

/* ==========================================================================
   3. ACCORDION CÂU HỎI THƯỜNG GẶP (FAQ)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.accordion-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Đóng tất cả các item khác
      faqItems.forEach(i => i.classList.remove('active'));

      // Mở item hiện tại nếu trước đó chưa mở
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. TIỆN ÍCH COPY SỐ ĐIỆN THOẠI & TOAST
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
  }, 3500);
}

/* ==========================================================================
   5. CUỘN TRANG MƯỢT MÀ CHO LINK NEO
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
