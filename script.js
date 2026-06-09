    // ===== PRICE DATA =====
const prices = {
  "Tepache":       { "250ml": 15000, "500ml": 27000 },
  "Gingr Shot":    { "500ml": 38000, "1000ml": 75000 },
  "Glow Shot":     { "500ml": 38000, "1000ml": 75000 },
  "G-Juice":       { "500ml": 47000, "1000ml": 93000 },
  "Morning Juice": { "500ml": 38000, "1000ml": 75000 },
  "Bloody Shot":   { "500ml": 43000, "1000ml": 85000 },
  "Ginger Bold":   { "250ml": 37000, "500ml": 73000 },
  "Glow Aura":     { "250ml": 37000, "500ml": 73000 },
  "G-Power":       { "250ml": 42000, "500ml": 83000 },
  "Morning Kick":  { "250ml": 32000, "500ml": 63000 },
  "Bloody Punch":  { "250ml": 37000, "500ml": 73000 },
  "Small A":          { "Small A": 119000 },
  "Small B":          { "Small B": 195000 },
  "Ginger Hater":    { "Ginger Hater": 75000 },
  "Big A":            { "Big A": 230000 },
  "All I Want is BIG":{ "All I Want is BIG": 390000 },
  "Ginger Haters+":    { "Ginger Haters": 155000 },
  "Ginger Addict":    { "Ginger Addict": 145000 }
};

// ===== CART =====
let cart = [];

const productEl = document.getElementById('product');
const sizeEl = document.getElementById('size');
const qtyEl = document.getElementById('qty');

// Update sizes when product changes
productEl.addEventListener('change', function() {
  const product = this.value;
  sizeEl.innerHTML = '<option value="" disabled selected>-- Ukuran --</option>';
  if (prices[product]) {
    Object.keys(prices[product]).forEach(size => {
      const opt = document.createElement('option');
      opt.value = size;
      const price = prices[product][size];
      opt.textContent = size + ' — Rp ' + price.toLocaleString('id-ID');
      sizeEl.appendChild(opt);
    });
    sizeEl.disabled = false;
  }
});

function addToCart() {
  const product = productEl.value;
  const size = sizeEl.value;
  const qty = parseInt(qtyEl.value) || 0;

  if (!product || !size || qty < 1) {
    alert('Pilih produk, ukuran, dan jumlah terlebih dahulu.');
    return;
  }

  const price = prices[product][size];
  const total = price * qty;

  // Check if same product+size already in cart
  const existing = cart.find(item => item.product === product && item.size === size);
  if (existing) {
    existing.qty += qty;
    existing.total = existing.qty * existing.price;
  } else {
    cart.push({
      product: product,
      size: size,
      qty: qty,
      price: price,
      total: total
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
  const cartContent = document.getElementById('cartContent');
  const cartCount = document.getElementById('cartCount');
  const btnCheckout = document.getElementById('btnCheckout');
  const custName = document.getElementById('custName');

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
      <td style="color:var(--text-muted); font-size:0.85rem;">Rp ${item.price.toLocaleString('id-ID')}</td>
      <td><span class="cart-item-price">Rp ${item.total.toLocaleString('id-ID')}</span></td>
      <td><button class="btn-remove" onclick="removeFromCart(${index})">Hapus</button></td>
    </tr>`;
  });

  html += '</tbody></table>';

  html += `<div class="cart-total">
    <span class="cart-total-label">Total (${cart.length} item)</span>
    <span class="cart-total-amount">Rp ${grandTotal.toLocaleString('id-ID')}</span>
  </div>`;

  cartContent.innerHTML = html;

  // Enable checkout if name is filled
  btnCheckout.disabled = custName.value.trim() === '';
}

// Enable/disable checkout based on name
document.getElementById('custName').addEventListener('input', function() {
  document.getElementById('btnCheckout').disabled =
    this.value.trim() === '' || cart.length === 0;
});

function checkoutWhatsApp() {
  const name = document.getElementById('custName').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const note = document.getElementById('custNote').value.trim();

  if (!name || cart.length === 0) {
    alert('Isi nama dan tambahkan minimal 1 produk.');
    return;
  }

  let grandTotal = 0;
  let itemsText = '';

  cart.forEach((item, i) => {
    grandTotal += item.total;
    itemsText += `${i + 1}. *${item.product}*\n   Ukuran: ${item.size}\n   Jumlah: ${item.qty}\n   Subtotal: Rp ${item.total.toLocaleString('id-ID')}\n\n`;
  });

  let message = `Halo Holy Shot!\nSaya ingin memesan:\n\n`;
  message += itemsText;
  message += `*Total: Rp ${grandTotal.toLocaleString('id-ID')}*\n\n`;
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
  window.open(`https://wa.me/6282228051397?text=${encoded}`, '_blank');
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', function() {
  mobileMenu.classList.toggle('active');
});

function closeMenu() {
  mobileMenu.classList.remove('active');
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => observer.observe(el));



