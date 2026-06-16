// ===== PRICE DATA =====
const prices = {
  Tepache: { "250ml": 15000, "500ml": 27000 },
  "Gingr Shot": { "500ml": 38000, "1000ml": 75000 },
  "Glow Shot": { "500ml": 38000, "1000ml": 75000 },
  "G-Juice": { "500ml": 47000, "1000ml": 93000 },
  "Morning Juice": { "500ml": 38000, "1000ml": 75000 },
  "Bloody Shot": { "500ml": 43000, "1000ml": 85000 },
  "Ginger Bold": { "250ml": 37000, "500ml": 73000 },
  "Glow Aura": { "250ml": 37000, "500ml": 73000 },
  "G-Power": { "250ml": 42000, "500ml": 83000 },
  "Morning Kick": { "250ml": 32000, "500ml": 63000 },
  "Bloody Punch": { "250ml": 37000, "500ml": 73000 },
  "Small A": { "Small A": 119000 },
  "Small B": { "Small B": 195000 },
  "Ginger Haters": { "Ginger Haters": 75000 },
  "Big A": { "Big A": 230000 },
  "All I Want is BIG": { "All I Want is BIG": 390000 },
  "Ginger Haters+": { "Ginger Haters+": 155000 },
  "Ginger Addict": { "Ginger Addict": 145000 },
};

// ✅ DIPERBAIKI — Daftar bundling dipisah agar bisa dipakai di beberapa tempat
const BUNDLING_PRODUCTS = [
  "Small A", "Small B", "Ginger Haters",
  "Big A", "All I Want is BIG", "Ginger Haters+", "Ginger Addict"
];

// ===== CART =====
let cart = [];

const productEl = document.getElementById("product");
const sizeEl = document.getElementById("size");
const qtyEl = document.getElementById("qty");

// Update sizes when product changes
productEl.addEventListener("change", function () {
  const product = this.value;
  sizeEl.innerHTML = '<option value="" disabled selected>-- Ukuran --</option>';

  if (prices[product]) {
    const isBundle = BUNDLING_PRODUCTS.includes(product); // ✅ DIPERBAIKI — pakai konstanta

    Object.keys(prices[product]).forEach((size) => {
      const opt = document.createElement("option");
      opt.value = size;
      const price = prices[product][size];
      opt.textContent = size + " — Rp " + price.toLocaleString("id-ID");
      sizeEl.appendChild(opt);
    });

    if (isBundle) {
      // ✅ DIPERBAIKI — Bundling: auto-select ukuran lalu disable dropdown
      sizeEl.selectedIndex = 1; // Index 1 = opsi pertama setelah "-- Ukuran --"
      sizeEl.disabled = true;
    } else {
      // Produk reguler: aktifkan dropdown
      sizeEl.value = "";
      sizeEl.disabled = false;
    }
  } else {
    sizeEl.disabled = true;
  }
});

function addToCart() {
  const product = productEl.value;
  const size = sizeEl.value;
  const qty = parseInt(qtyEl.value) || 0;

  if (!product || qty < 1) {
    alert("Pilih produk dan jumlah terlebih dahulu.");
    return;
  }

  const isBundle = BUNDLING_PRODUCTS.includes(product); // ✅ DIPERBAIKI

  // ✅ DIPERBAIKI — Ukuran wajib hanya untuk produk reguler
  if (!isBundle && !size) {
    alert("Pilih ukuran terlebih dahulu.");
    return;
  }

  // ✅ DIPERBAIKI — Untuk bundling, gunakan key dari prices langsung
  const actualSize = isBundle ? Object.keys(prices[product])[0] : size;

  if (!prices[product] || !prices[product][actualSize]) {
    alert("Data harga tidak ditemukan.");
    return;
  }

  const price = prices[product][actualSize];
  const total = price * qty;

  // Check if same product+size already in cart
  const existing = cart.find((item) => item.product === product && item.size === actualSize);
  if (existing) {
    existing.qty += qty;
    existing.total = existing.qty * existing.price;
  } else {
    cart.push({
      product: product,
      size: actualSize,
      qty: qty,
      price: price,
      total: total,
    });
  }

  // Reset form
  productEl.selectedIndex = 0;
  sizeEl.innerHTML = '<option value="" disabled selected>-- Ukuran --</option>';
  sizeEl.disabled = true;
  qtyEl.value = 1;

  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartContent = document.getElementById("cartContent");
  const cartCount = document.getElementById("cartCount");
  const btnCheckout = document.getElementById("btnCheckout");
  const custName = document.getElementById("custName");

  cartCount.textContent = cart.length;

  if (cart.length === 0) {
    cartContent.innerHTML = '<div class="cart-empty">Keranjang masih kosong. Tambahkan produk di atas.</div>';
    btnCheckout.disabled = true;
    return;
  }

  let grandTotal = 0;
  let html = '<table class="cart-table"><thead><tr><th>Produk</th><th>Harga</th><th>Subtotal</th><th></th></tr></thead><tbody>';

  cart.forEach((item, index) => {
    grandTotal += item.total;
    html += `<tr>
      <td>
        <div class="cart-item-name">${item.product}</div>
        <div class="cart-item-detail">${item.size} &times; ${item.qty}</div>
      </td>
      <td style="color:var(--text-muted); font-size:0.85rem;">Rp ${item.price.toLocaleString("id-ID")}</td>
      <td><span class="cart-item-price">Rp ${item.total.toLocaleString("id-ID")}</span></td>
      <td><button class="btn-remove" onclick="removeFromCart(${index})">Hapus</button></td>
    </tr>`;
  });

  html += "</tbody></table>";

  html += `<div class="cart-total">
    <span class="cart-total-label">Total (${cart.length} item)</span>
    <span class="cart-total-amount">Rp ${grandTotal.toLocaleString("id-ID")}</span>
  </div>`;

  cartContent.innerHTML = html;

  // Enable checkout if name is filled
  btnCheckout.disabled = custName.value.trim() === "";
}

// Enable/disable checkout based on name
document.getElementById("custName").addEventListener("input", function () {
  document.getElementById("btnCheckout").disabled = this.value.trim() === "" || cart.length === 0;
});

function checkoutWhatsApp() {
  const name = document.getElementById("custName").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const note = document.getElementById("custNote").value.trim();

  if (!name || cart.length === 0) {
    alert("Isi nama dan tambahkan minimal 1 produk.");
    return;
  }

  let grandTotal = 0;
  let itemsText = "";

  cart.forEach((item, i) => {
    grandTotal += item.total;
    itemsText += `${i + 1}. *${item.product}*\n   Ukuran: ${item.size}\n   Jumlah: ${item.qty}\n   Subtotal: Rp ${item.total.toLocaleString("id-ID")}\n\n`;
  });

  let message = `Halo Holy Shot!\nSaya ingin memesan:\n\n`;
  message += itemsText;
  message += `*Total: Rp ${grandTotal.toLocaleString("id-ID")}*\n\n`;
  message += `*Nama:* ${name}\n`;

  if (address) {
    message += `*Alamat:* ${address}\n`;
  }
  if (note) {
    message += `*Catatan:* ${note}\n`;
  }

  message += `\n*Catatan: Sistem Pre-Order*\n`;
  message += `Mohon info ketersediaan, estimasi pembuatan, dan ongkirnya. Terima kasih!`;

  const encoded = encodeURIComponent(message);
  // ✅ DIPERBAIKI — Nomor WhatsApp: 62 (kode Indonesia) + 82228051397
  window.open(`https://wa.me/6282228051397?text=${encoded}`, "_blank");
}

// ===== NAVBAR SCROLL =====
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", function () {
  mobileMenu.classList.toggle("active");
});

function closeMenu() {
  mobileMenu.classList.remove("active");
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((el) => observer.observe(el));

/* =========================================
   TESTIMONI & ULASAN — MERGED FUNCTIONALITY
   ========================================= */

// ---- Tab Switching ----
function switchTab(tabName) {
  const tabs = document.querySelectorAll(".tu-tab");
  const contents = document.querySelectorAll(".tu-content");
  const indicator = document.getElementById("tuTabIndicator");

  tabs.forEach((t) => t.classList.remove("active"));
  contents.forEach((c) => {
    c.classList.remove("tu-content--active");
    c.style.display = "none";
  });

  const targetTab = document.querySelector(`.tu-tab[data-tab="${tabName}"]`);
  const targetContent = document.getElementById(`tab-${tabName}`);

  targetTab.classList.add("active");
  targetContent.style.display = "block";

  requestAnimationFrame(() => {
    targetContent.classList.add("tu-content--active");
  });

  if (tabName === "ulasan") {
    indicator.classList.add("right");
  } else {
    indicator.classList.remove("right");
  }
}

// Initialize tab display on load
document.addEventListener("DOMContentLoaded", () => {
  const defaultContent = document.getElementById("tab-testimoni");
  if (defaultContent) {
    defaultContent.style.display = "block";
  }
});

// ---- Star Rating ----
const starRatingEl = document.getElementById("starRating");
const reviewRatingInput = document.getElementById("reviewRating");
const ratingLabel = document.getElementById("ratingLabel");
const stars = document.querySelectorAll(".tu-star");
const ratingLabels = ["", "Kurang", "Cukup", "Bagus", "Sangat Bagus", "Luar Biasa!"];

if (starRatingEl) {
  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => {
      const val = parseInt(star.dataset.value);
      stars.forEach((s) => {
        s.classList.remove("hovered");
        if (parseInt(s.dataset.value) <= val) {
          s.classList.add("hovered");
        }
      });
    });

    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.value);
      reviewRatingInput.value = val;
      stars.forEach((s) => {
        s.classList.remove("active", "hovered");
        if (parseInt(s.dataset.value) <= val) {
          s.classList.add("active");
        }
      });
      if (ratingLabel) {
        ratingLabel.textContent = ratingLabels[val];
      }
    });
  });

  starRatingEl.addEventListener("mouseleave", () => {
    stars.forEach((s) => s.classList.remove("hovered"));
  });
}

// ---- Character Counter ----
const reviewTextEl = document.getElementById("reviewText");
const charCountEl = document.getElementById("charCount");

if (reviewTextEl && charCountEl) {
  reviewTextEl.addEventListener("input", () => {
    const len = reviewTextEl.value.length;
    charCountEl.textContent = len;
    if (len > 300) {
      reviewTextEl.value = reviewTextEl.value.substring(0, 300);
      charCountEl.textContent = 300;
    }
    charCountEl.style.color = len >= 280 ? "#ae2012" : "";
  });
}

// ---- Submit Review & Fetch Data (GAS) ----

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby4ewk542ToZpaJl24zgt1l83qp_RaOuzb9LnxHg4QYdZUZyQwCKUX0x8GR3QHw2cmP/exec";

// Fungsi buat narik data dari Spreadsheet
async function loadReviews() {
  const reviewList = document.getElementById("reviewList");
  const testiGrid = document.getElementById("testiGrid");

  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();

    if (reviewList) reviewList.innerHTML = "";
    if (testiGrid) testiGrid.innerHTML = "";

    data.forEach((ulasan) => {
      const avatar = ulasan.name.charAt(0).toUpperCase();
      const starsStr = "★".repeat(ulasan.rating) + "☆".repeat(5 - ulasan.rating);

      if (testiGrid) {
        const testiCard = document.createElement("div");
        testiCard.className = "tu-testi-card";
        testiCard.innerHTML = `
          <div class="tu-testi-quote">"</div>
          <div class="tu-testi-stars">${starsStr}</div>
          <p class="tu-testi-text">${escHtml(ulasan.text)}</p>
          <div class="tu-testi-footer">
            <div class="tu-testi-avatar">${avatar}</div>
            <div>
              <div class="tu-testi-name">${escHtml(ulasan.name)}</div>
              <div class="tu-testi-role">Pelanggan — ${escHtml(ulasan.city || "Indonesia")}</div>
            </div>
            <span class="tu-testi-product">${escHtml(ulasan.product)}</span>
          </div>
        `;
        testiGrid.appendChild(testiCard);
      }

      if (reviewList) {
        const reviewCard = document.createElement("div");
        reviewCard.className = "tu-review-card";
        reviewCard.innerHTML = `
          <div class="tu-review-card-top">
            <div class="tu-review-avatar">${avatar}</div>
            <div class="tu-review-meta">
              <span class="tu-review-name">${escHtml(ulasan.name)}</span>
              <span class="tu-review-city">${escHtml(ulasan.city || "Indonesia")}</span>
            </div>
            <span class="tu-review-badge">${escHtml(ulasan.product)}</span>
          </div>
          <div class="tu-review-stars">${starsStr}</div>
          <p class="tu-review-text">"${escHtml(ulasan.text)}"</p>
          <div class="tu-review-date">${ulasan.tanggal}</div>
        `;
        reviewList.appendChild(reviewCard);
      }
    });

    const countEl = document.getElementById("reviewCount");
    if (countEl) countEl.textContent = `${data.length} ulasan`;
  } catch (error) {
    console.error("Gagal memuat ulasan:", error);
  }
}

// Panggil ulasan pas web pertama kali dibuka
document.addEventListener("DOMContentLoaded", () => {
  const defaultContent = document.getElementById("tab-testimoni");
  if (defaultContent) {
    defaultContent.style.display = "block";
  }
  loadReviews();
});

// Fungsi submit ulasan baru
async function submitReview() {
  const product = document.getElementById("reviewProduct").value;
  const name = document.getElementById("reviewerName").value.trim();
  const city = document.getElementById("reviewerCity").value.trim();
  const rating = parseInt(document.getElementById("reviewRating").value);
  const text = document.getElementById("reviewText").value.trim();

  if (!product) return showToast("Pilih produk yang ingin diulas.", "error");
  if (!name) return showToast("Masukkan nama kamu.", "error");
  if (rating === 0) return showToast("Beri rating bintang terlebih dahulu.", "error");
  if (!text) return showToast("Tulis ulasanmu terlebih dahulu.", "error");
  if (text.length < 10) return showToast("Ulasan terlalu pendek, minimal 10 karakter.", "error");

  const dataKirim = {
    product: product,
    name: name,
    city: city,
    rating: rating,
    text: text,
  };

  showToast("Sedang mengirim ulasan...", "success");

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dataKirim),
    });

    document.getElementById("reviewProduct").selectedIndex = 0;
    document.getElementById("reviewerName").value = "";
    document.getElementById("reviewerCity").value = "";
    document.getElementById("reviewText").value = "";
    document.getElementById("reviewRating").value = "0";
    if (charCountEl) charCountEl.textContent = "0";
    if (ratingLabel) ratingLabel.textContent = "";
    stars.forEach((s) => s.classList.remove("active"));

    showToast("Terima kasih! Ulasanmu berhasil dikirim. 🎉", "success");

    loadReviews();
  } catch (error) {
    showToast("Gagal mengirim ulasan, coba lagi ya.", "error");
    console.error(error);
  }
}

// ---- Toast ----
function showToast(message, type = "success") {
  const existing = document.querySelector(".tu-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `tu-toast tu-toast--${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✓" : "!"}</span> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ---- Escape HTML ----
function escHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

/* =============================================
   FAQ ACCORDION
   ============================================= */

function toggleFaq(button) {
  const item = button.parentElement;
  const isActive = item.classList.contains("active");

  document.querySelectorAll(".faq-item.active").forEach(function (el) {
    el.classList.remove("active");
  });

  if (!isActive) {
    item.classList.add("active");
  }
}