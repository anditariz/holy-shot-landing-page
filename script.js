document.documentElement.classList.add("js");

// Ubah nilai di sini untuk mengatur badge, layout, posisi, atau visibilitas Tepache.
const TEPACHE_CONFIG = {
  badge: "",
  showBadge: false,
  layout: "regular",
  position: "bottom",
  visible: true,
};

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
const BUNDLING_PRODUCTS = ["Small A", "Small B", "Ginger Haters", "Big A", "All I Want is BIG", "Ginger Haters+", "Ginger Addict"];

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
  updateProductSubtotal();
});

sizeEl.addEventListener("change", updateProductSubtotal);
qtyEl.addEventListener("input", updateProductSubtotal);

document.querySelectorAll("[data-preselect-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.preselectProduct;
    if (!product || !prices[product]) {
      console.error("Produk CTA tidak ditemukan:", product);
      return;
    }

    productEl.value = product;
    productEl.dispatchEvent(new Event("change", { bubbles: true }));
    window.setTimeout(() => sizeEl.focus({ preventScroll: true }), 0);
  });
});

function applyTepacheConfig() {
  const section = document.getElementById("tepache");
  const badge = section?.querySelector(".tepache-badge");
  const signatureSection = document.getElementById("signature");
  const pureSection = document.getElementById("pure-series");

  if (!section || !badge || !signatureSection || !pureSection) {
    throw new Error("Elemen konfigurasi Tepache tidak ditemukan.");
  }
  if (typeof TEPACHE_CONFIG.badge !== "string" || typeof TEPACHE_CONFIG.showBadge !== "boolean" || typeof TEPACHE_CONFIG.visible !== "boolean") {
    throw new TypeError("Konfigurasi badge dan visible Tepache harus menggunakan tipe yang benar.");
  }
  if (!["highlight", "regular"].includes(TEPACHE_CONFIG.layout) || !["top", "bottom"].includes(TEPACHE_CONFIG.position)) {
    throw new Error("Konfigurasi layout atau position Tepache tidak valid.");
  }

  section.classList.toggle("is-highlight", TEPACHE_CONFIG.layout === "highlight");
  section.classList.toggle("is-regular", TEPACHE_CONFIG.layout === "regular");
  section.hidden = !TEPACHE_CONFIG.visible;

  const badgeText = badge.querySelector(".tepache-new-tag");
  badgeText.textContent = TEPACHE_CONFIG.badge;
  badge.hidden = !TEPACHE_CONFIG.showBadge || !TEPACHE_CONFIG.badge.trim();

  if (TEPACHE_CONFIG.position === "top") {
    signatureSection.before(section);
  } else {
    pureSection.after(section);
  }
}

applyTepacheConfig();

function updateProductSubtotal() {
  const product = productEl.value;
  const size = sizeEl.value;
  const quantity = Math.max(1, parseInt(qtyEl.value, 10) || 1);
  const price = prices[product]?.[size] || 0;
  document.getElementById("productSubtotal").textContent = `Subtotal: Rp ${(price * quantity).toLocaleString("id-ID")}`;
}

function adjustProductQuantity(amount) {
  qtyEl.value = Math.max(1, (parseInt(qtyEl.value, 10) || 1) + amount);
  updateProductSubtotal();
}

function addToCart() {
  const product = productEl.value;
  const size = sizeEl.value;
  const qty = Number(qtyEl.value);
  const addItemError = document.getElementById("addItemError");

  if (!product) {
    addItemError.textContent = "Pilih produk terlebih dahulu.";
    return;
  }

  if (!Number.isInteger(qty) || qty < 1) {
    addItemError.textContent = "Jumlah minimal 1 produk.";
    return;
  }

  const isBundle = BUNDLING_PRODUCTS.includes(product);

  if (!isBundle && !size) {
    addItemError.textContent = "Pilih ukuran terlebih dahulu.";
    return;
  }

  const actualSize = isBundle ? Object.keys(prices[product])[0] : size;

  if (!prices[product] || !prices[product][actualSize]) {
    addItemError.textContent = "Harga produk tidak ditemukan. Silakan pilih ulang produk.";
    return;
  }
  addItemError.textContent = "";

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
      name: productEl.selectedOptions[0].textContent,
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
  updateProductSubtotal();

  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function updateCartQuantity(index, amount) {
  const item = cart[index];
  if (!item) return;
  item.qty = Math.max(1, item.qty + amount);
  item.total = item.qty * item.price;
  renderCart();
}

function renderCart() {
  const cartContent = document.getElementById("cartContent");
  const cartCount = document.getElementById("cartCount");
  const btnCheckout = document.getElementById("btnCheckout");
  const custName = document.getElementById("custName");

  cartCount.textContent = cart.length;

  if (cart.length === 0) {
    cartContent.innerHTML = '<div class="cart-empty"><strong>Keranjang masih kosong</strong><span>Tambahkan produk untuk mulai menyusun pesanan.</span></div>';
    updateCheckoutState();
    return;
  }

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);
  let html = '<div class="cart-list">';

  cart.forEach((item, index) => {
    html += `<article class="cart-item">
      <div class="cart-item-heading">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-detail">${item.size}</div>
        </div>
        <span class="cart-unit-price">Rp ${item.price.toLocaleString("id-ID")} / item</span>
      </div>
      <div class="cart-item-controls">
        <div class="cart-qty-stepper" aria-label="Jumlah ${item.name}">
          <button type="button" aria-label="Kurangi jumlah ${item.name}" onclick="updateCartQuantity(${index}, -1)">−</button>
          <span>${item.qty}</span>
          <button type="button" aria-label="Tambah jumlah ${item.name}" onclick="updateCartQuantity(${index}, 1)">+</button>
        </div>
        <span class="cart-item-price">Subtotal Rp ${item.total.toLocaleString("id-ID")}</span>
        <button class="btn-remove" type="button" aria-label="Hapus ${item.name} dari keranjang" onclick="removeFromCart(${index})">Hapus</button>
      </div>
    </article>`;
  });

  html += "</div>";

  html += `<div class="cart-total">
    <span class="cart-total-label">Total (${cart.length} item)</span>
    <span class="cart-total-amount">Rp ${grandTotal.toLocaleString("id-ID")}</span>
  </div>`;

  cartContent.innerHTML = html;
  updateCheckoutState();
}

function isValidIndonesianPhone(phone) {
  const normalizedPhone = phone.replace(/[\s()-]/g, "");
  return /^(08[1-9]\d{7,10}|\+?628[1-9]\d{7,10})$/.test(normalizedPhone);
}

function getCheckoutError() {
  if (cart.length === 0) return "Keranjang masih kosong. Tambahkan minimal satu produk.";
  if (!document.getElementById("custName").value.trim()) return "Nama lengkap wajib diisi.";
  const phone = document.getElementById("custPhone").value.trim();
  if (!phone) return "Nomor handphone wajib diisi.";
  if (!isValidIndonesianPhone(phone)) return "Format nomor HP tidak valid. Gunakan 08xx, 62xx, atau +62xx.";
  return "";
}

function updateCheckoutState() {
  const error = getCheckoutError();
  document.getElementById("btnCheckout").disabled = Boolean(error);
  document.getElementById("checkoutMessage").textContent = error || "Data siap dikirim ke WhatsApp.";
}

document.getElementById("custName").addEventListener("input", updateCheckoutState);
document.getElementById("custPhone").addEventListener("input", updateCheckoutState);
updateProductSubtotal();
updateCheckoutState();

function checkoutWhatsApp() {
  const name = document.getElementById("custName").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const note = document.getElementById("custNote").value.trim();

  const checkoutError = getCheckoutError();
  if (checkoutError) {
    updateCheckoutState();
    return;
  }

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const itemsText = cart.map((item, index) => `${index + 1}. *${item.name}*\n   Ukuran: ${item.size}\n   Jumlah: ${item.qty}\n   Subtotal: Rp ${item.total.toLocaleString("id-ID")}`).join("\n\n");
  let message = `Halo Holy Shot!\nSaya ingin memesan:\n\n*DAFTAR PESANAN*\n${itemsText}\n\n*TOTAL: Rp ${grandTotal.toLocaleString("id-ID")}*\n\n*DATA PEMESAN*\n*Nama:* ${name}\n*Nomor Handphone:* ${phone}\n*Alamat:* ${address || "-"}\n*Catatan:* ${note || "-"}\n\n*Catatan: Sistem Pre-Order*\n`;
  message += `Pembayaran dan pengiriman (termasuk ongkir) akan diatur via WhatsApp.\n`;
  message += `Mohon info ketersediaan, estimasi pembuatan, dan ongkirnya. Terima kasih!`;

  const encoded = encodeURIComponent(message);
  // ✅ DIPERBAIKI — Nomor WhatsApp: 62 (kode Indonesia) + 82228051397
  window.open(`https://wa.me/6282228051397?text=${encoded}`, "_blank");
}

const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
const navigableSections = [...new Set(Array.from(sectionLinks, (link) => document.getElementById(link.hash.slice(1))).filter(Boolean))];

function updateCurrentSection() {
  const markerY = window.innerHeight * 0.42;
  const currentSection = navigableSections.find((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= markerY && bounds.bottom > markerY;
  });

  sectionLinks.forEach((link) => {
    const isCurrent = Boolean(currentSection && link.hash === `#${currentSection.id}`);
    link.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const mainContent = document.getElementById("main-content");
const siteFooter = document.querySelector("footer");

function closeMenu({ restoreFocus = false } = {}) {
  mobileMenu.classList.remove("active");
  mobileMenu.inert = true;
  mainContent.inert = false;
  siteFooter.inert = false;
  document.body.classList.remove("menu-open");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "Buka menu");
  if (restoreFocus) hamburger.focus();
}

hamburger.addEventListener("click", () => {
  const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    closeMenu();
    return;
  }

  mobileMenu.inert = false;
  mainContent.inert = true;
  siteFooter.inert = true;
  mobileMenu.classList.add("active");
  document.body.classList.add("menu-open");
  hamburger.setAttribute("aria-expanded", "true");
  hamburger.setAttribute("aria-label", "Tutup menu");
  mobileMenu.querySelector("a")?.focus();
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeMenu({ restoreFocus: true }));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
    closeMenu({ restoreFocus: true });
    return;
  }

  if (event.key === "Tab" && hamburger.getAttribute("aria-expanded") === "true") {
    const menuLinks = Array.from(mobileMenu.querySelectorAll("a"));
    const firstItem = menuLinks[0];
    const lastItem = menuLinks[menuLinks.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      hamburger.focus();
    } else if (!event.shiftKey && (document.activeElement === lastItem || document.activeElement === hamburger)) {
      event.preventDefault();
      firstItem.focus();
    }
  }
});

// Keep scroll effects to one layout read/write per animation frame.
const navbar = document.getElementById("navbar");
let scrollFrame = 0;

function updateScrollState() {
  scrollFrame = 0;
  navbar.classList.toggle("scrolled", window.scrollY > 60);
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  document.documentElement.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, scrollProgress))));
  updateCurrentSection();
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && hamburger.getAttribute("aria-expanded") === "true") closeMenu();
  updateScrollState();
});
updateScrollState();

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(".reveal");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealElements.forEach((el) => el.classList.add("visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
  );
  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("visible"));
}

// ===== PRODUCT CAROUSELS =====
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const pagination = carousel.querySelector("[data-carousel-pagination]");
  const status = carousel.querySelector("[data-carousel-status]");

  if (!track || !previousButton || !nextButton || !pagination || !status) return;

  const slides = Array.from(track.children);
  if (slides.length < 2) return;
  const slideCount = slides.length;

  if (carousel.dataset.carouselLayout === "stacked") {
    carousel.classList.add("is-stacked");
    let activeIndex = 0;
    let pointerStart = null;
    let autoplayTimer = 0;
    let isInViewport = !("IntersectionObserver" in window);
    const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const dots = slides.map((slide, index) => {
      const title = slide.querySelector(".product-name, h4")?.textContent.trim();
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} dari ${slideCount}${title ? `: ${title}` : ""}`);

      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Tampilkan produk ${index + 1}${title ? `: ${title}` : ""}`);
      dot.addEventListener("click", () => updateStackedSlide(index));
      pagination.appendChild(dot);
      return dot;
    });

    function updateStackedSlide(index) {
      activeIndex = (index + slideCount) % slideCount;
      slides.forEach((slide, slideIndex) => {
        const offset = (slideIndex - activeIndex + slideCount) % slideCount;
        const position = offset <= Math.floor(slideCount / 2) ? offset : offset - slideCount;
        slide.classList.remove("stack-card--active", "stack-card--next", "stack-card--next-two", "stack-card--previous", "stack-card--previous-two");

        if (position === 0) slide.classList.add("stack-card--active");
        else if (position === 1) slide.classList.add("stack-card--next");
        else if (position === 2) slide.classList.add("stack-card--next-two");
        else if (position === -1) slide.classList.add("stack-card--previous");
        else if (position === -2) slide.classList.add("stack-card--previous-two");

        const isActive = position === 0;
        slide.inert = !isActive;
        if (isActive) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
      });

      dots.forEach((dot, dotIndex) => {
        if (dotIndex === activeIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      status.textContent = `Produk ${activeIndex + 1} dari ${slideCount}`;
    }

    function scheduleAutoplay() {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = window.setTimeout(() => {
        if (
          !document.hidden &&
          isInViewport &&
          !carousel.matches(":hover") &&
          !carousel.contains(document.activeElement) &&
          !reducedMotionPreference.matches
        ) {
          updateStackedSlide(activeIndex + 1);
        }

        scheduleAutoplay();
      }, 5000);
    }

    if ("IntersectionObserver" in window) {
      const carouselObserver = new IntersectionObserver(([entry]) => {
        isInViewport = entry.isIntersecting;
      });
      carouselObserver.observe(carousel);
    }

    function resetAutoplayTimer() {
      scheduleAutoplay();
    }

    previousButton.addEventListener("click", () => {
      updateStackedSlide(activeIndex - 1);
      resetAutoplayTimer();
    });
    nextButton.addEventListener("click", () => {
      updateStackedSlide(activeIndex + 1);
      resetAutoplayTimer();
    });
    track.addEventListener("keydown", (event) => {
      if (event.target instanceof Element && event.target.closest("a, button, summary, input, select, textarea")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        updateStackedSlide(activeIndex - 1);
        resetAutoplayTimer();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        updateStackedSlide(activeIndex + 1);
        resetAutoplayTimer();
      }
    });
    track.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || (event.target instanceof Element && event.target.closest("a, button, summary, input, select, textarea"))) return;
      event.preventDefault();
      track.setPointerCapture(event.pointerId);
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    track.addEventListener("pointerup", (event) => {
      if (!pointerStart) return;
      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
      updateStackedSlide(activeIndex + (deltaX < 0 ? 1 : -1));
      resetAutoplayTimer();
    });
    track.addEventListener("pointercancel", () => {
      pointerStart = null;
    });
    track.addEventListener("lostpointercapture", () => {
      pointerStart = null;
    });

    updateStackedSlide(activeIndex);
    scheduleAutoplay();
    pagination.addEventListener("click", resetAutoplayTimer);
    return;
  }

  const createClone = (slide) => {
    const clone = slide.cloneNode(true);
    clone.dataset.carouselClone = "true";
    clone.setAttribute("aria-hidden", "true");
    clone.classList.remove("reveal", "visible", "reveal-delay-1", "reveal-delay-2", "reveal-delay-3");

    const accent = getComputedStyle(slide).getPropertyValue("--pure-accent");
    if (accent) clone.style.setProperty("--pure-accent", accent);

    clone.querySelectorAll("a, button, summary, [tabindex]").forEach((element) => element.setAttribute("tabindex", "-1"));
    return clone;
  };

  const leadingClones = slides.map(createClone);
  const trailingClones = slides.map(createClone);
  const leadingFragment = document.createDocumentFragment();
  const trailingFragment = document.createDocumentFragment();
  leadingClones.forEach((clone) => leadingFragment.appendChild(clone));
  trailingClones.forEach((clone) => trailingFragment.appendChild(clone));
  track.prepend(leadingFragment);
  track.append(trailingFragment);

  const allSlides = Array.from(track.children);
  let activeIndex = 0;
  let scrollFrame = 0;
  let settleTimer = 0;
  let isNormalizing = false;

  function getPhysicalIndex() {
    return allSlides.reduce(
      (closestIndex, slide, slideIndex) =>
        Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(allSlides[closestIndex].offsetLeft - track.scrollLeft) ? slideIndex : closestIndex,
      0,
    );
  }

  function updateActiveIndex(physicalIndex) {
    activeIndex = (physicalIndex % slideCount);
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    status.textContent = `Produk ${activeIndex + 1} dari ${slideCount}`;
  }

  function normalizeClones(physicalIndex = getPhysicalIndex()) {
    if (physicalIndex >= slideCount && physicalIndex < slideCount * 2) return;

    const targetIndex = physicalIndex < slideCount ? physicalIndex + slideCount : physicalIndex - slideCount;
    isNormalizing = true;
    track.style.scrollBehavior = "auto";
    track.style.scrollSnapType = "none";
    track.scrollLeft = allSlides[targetIndex].offsetLeft;
    updateActiveIndex(targetIndex);

    window.requestAnimationFrame(() => {
      track.style.removeProperty("scroll-behavior");
      track.style.removeProperty("scroll-snap-type");
      isNormalizing = false;
    });
  }

  function scheduleCloneNormalization() {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(normalizeClones, 180);
  }

  function scrollToSlide(physicalIndex) {
    track.scrollTo({
      left: allSlides[physicalIndex].offsetLeft,
      behavior: reducedMotionPreference.matches ? "auto" : "smooth",
    });
  }

  const dots = slides.map((slide, index) => {
    const title = slide.querySelector(".product-name, h4")?.textContent.trim();
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} dari ${slideCount}${title ? `: ${title}` : ""}`);

    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Tampilkan produk ${index + 1}${title ? `: ${title}` : ""}`);
    dot.addEventListener("click", () => scrollToSlide(slideCount + index));
    pagination.appendChild(dot);
    return dot;
  });

  function updateCarousel() {
    scrollFrame = 0;
    const physicalIndex = getPhysicalIndex();
    updateActiveIndex(physicalIndex);
    if (physicalIndex < slideCount || physicalIndex >= slideCount * 2) scheduleCloneNormalization();
  }

  previousButton.addEventListener("click", () => scrollToSlide(getPhysicalIndex() - 1));
  nextButton.addEventListener("click", () => scrollToSlide(getPhysicalIndex() + 1));
  track.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-preselect-product]") : null;
    if (!target || !target.closest("[data-carousel-clone]")) return;

    event.preventDefault();
    const product = target.dataset.preselectProduct;
    const original = slides
      .flatMap((slide) => Array.from(slide.querySelectorAll("[data-preselect-product]")))
      .find((button) => button.dataset.preselectProduct === product);
    if (original) original.click();
  });
  track.addEventListener(
    "scroll",
    () => {
      if (isNormalizing) return;
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateCarousel);
    },
    { passive: true },
  );
  track.addEventListener("scrollend", () => {
    window.clearTimeout(settleTimer);
    normalizeClones();
  });
  window.addEventListener("resize", () => {
    track.scrollLeft = slides[activeIndex].offsetLeft;
    updateCarousel();
  });
  track.scrollLeft = allSlides[slideCount].offsetLeft;
  updateCarousel();
});

// ===== HERO POINTER MOTION =====
const heroSection = document.getElementById("hero");
const heroLogoWrap = heroSection?.querySelector(".hero-logo-wrap");
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroSection && heroLogoWrap && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let heroMotionFrame = 0;

  heroSection.addEventListener("pointermove", (event) => {
    if (reducedMotionPreference.matches) {
      return;
    }

    cancelAnimationFrame(heroMotionFrame);
    heroMotionFrame = requestAnimationFrame(() => {
      const bounds = heroSection.getBoundingClientRect();
      const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;

      heroSection.style.setProperty("--hero-pointer-x", `${(pointerX * 8).toFixed(2)}px`);
      heroSection.style.setProperty("--hero-pointer-y", `${(pointerY * 6).toFixed(2)}px`);
      heroLogoWrap.style.setProperty("--hero-logo-shift-x", `${(pointerX * -4).toFixed(2)}px`);
      heroLogoWrap.style.setProperty("--hero-logo-shift-y", `${(pointerY * -3).toFixed(2)}px`);
      heroSection.style.setProperty("--hero-image-shift-x", `${(pointerX * -6).toFixed(2)}px`);
      heroSection.style.setProperty("--hero-image-shift-y", `${(pointerY * -4).toFixed(2)}px`);
    });
  });

  heroSection.addEventListener("pointerleave", () => {
    cancelAnimationFrame(heroMotionFrame);
    heroSection.style.setProperty("--hero-pointer-x", "0px");
    heroSection.style.setProperty("--hero-pointer-y", "0px");
    heroLogoWrap.style.setProperty("--hero-logo-shift-x", "0px");
    heroLogoWrap.style.setProperty("--hero-logo-shift-y", "0px");
    heroSection.style.setProperty("--hero-image-shift-x", "0px");
    heroSection.style.setProperty("--hero-image-shift-y", "0px");
  });
}

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
const REVIEWS_PER_PAGE = 5;
let reviewData = null;
let renderedReviewCount = 0;
let loadingReviews = false;
let reviewLoadFailed = false;
let reviewObserver = null;

// Fungsi buat narik data dari Spreadsheet
async function loadReviews() {
  if (loadingReviews) return;
  loadingReviews = true;
  setReviewStatus("loading", "Memuat ulasan...");
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Gagal memuat data ulasan.");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Format data ulasan tidak sesuai.");

    reviewLoadFailed = false;
    reviewData = data;
    renderedReviewCount = 0;
    document.getElementById("reviewItems").innerHTML = "";
    document.getElementById("reviewRetry").hidden = true;
    updateReviewSummary(data);
    setupReviewObserver();
    loadingReviews = false;
    await loadMoreReviews();
  } catch (error) {
    loadingReviews = false;
    reviewLoadFailed = true;
    console.error("Gagal memuat ulasan:", error);
    setReviewStatus("error", "Ulasan belum dapat dimuat.");
    document.getElementById("reviewRetry").hidden = false;
  }
}

function updateReviewSummary(data) {
  const countEl = document.getElementById("reviewCount");
  const averageEl = document.getElementById("reviewAverage");
  const ratings = data.map((review) => Number(review.rating)).filter((rating) => rating >= 1 && rating <= 5);
  const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

  countEl.textContent = `${data.length} ulasan`;
  averageEl.textContent = average ? `★ ${average.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5` : "";
  averageEl.setAttribute("aria-label", average ? `Rata-rata rating ${average.toFixed(1)} dari 5` : "");
}

function setReviewStatus(state, message) {
  const statusEl = document.getElementById("reviewStatus");
  statusEl.className = `tu-review-status tu-review-status--${state}`;
  statusEl.innerHTML = state === "loading" ? `<span class="tu-review-spinner" aria-hidden="true"></span> ${message}` : escHtml(message);
}

function setupReviewObserver() {
  const sentinel = document.getElementById("reviewSentinel");
  const loadMoreButton = document.getElementById("reviewLoadMore");

  if (!("IntersectionObserver" in window)) {
    loadMoreButton.hidden = !reviewData.length;
    return;
  }

  if (reviewObserver) reviewObserver.disconnect();
  reviewObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMoreReviews();
    },
    { root: document.getElementById("reviewList"), rootMargin: "0px 0px 100px 0px" },
  );
  reviewObserver.observe(sentinel);
}

function formatReviewDate(value) {
  const dateValue = String(value || "").trim();
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue.split(/[T ]/, 1)[0];

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

async function loadMoreReviews() {
  if (loadingReviews || !reviewData) return;
  if (renderedReviewCount >= reviewData.length) {
    setReviewStatus("done", reviewData.length ? "Semua ulasan sudah ditampilkan" : "Belum ada ulasan");
    document.getElementById("reviewLoadMore").hidden = true;
    return;
  }

  loadingReviews = true;
  document.getElementById("reviewRetry").hidden = true;
  setReviewStatus("loading", "Memuat ulasan...");

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    const batch = reviewData.slice(renderedReviewCount, renderedReviewCount + REVIEWS_PER_PAGE);
    const reviewFragment = document.createDocumentFragment();

    batch.forEach((review) => {
      const name = String(review.name || "");
      const rating = Math.min(5, Math.max(0, parseInt(review.rating, 10) || 0));
      const avatar = escHtml(name.charAt(0).toUpperCase());
      const starsStr = "★".repeat(rating) + "☆".repeat(5 - rating);
      const reviewCard = document.createElement("div");
      reviewCard.className = "tu-review-card";
      reviewCard.innerHTML = `
        <div class="tu-review-card-top">
          <div class="tu-review-avatar">${avatar}</div>
          <div class="tu-review-meta">
            <span class="tu-review-name">${escHtml(name)}</span>
            <span class="tu-review-city">${escHtml(review.city || "")}</span>
          </div>
          <span class="tu-review-badge">${escHtml(review.product || "")}</span>
        </div>
        <div class="tu-review-stars" aria-label="Rating ${rating} dari 5">${starsStr}</div>
        <p class="tu-review-text">"${escHtml(review.text || "")}"</p>
        <div class="tu-review-date">${escHtml(formatReviewDate(review.tanggal))}</div>
      `;
      reviewFragment.appendChild(reviewCard);
    });

    document.getElementById("reviewItems").appendChild(reviewFragment);
    renderedReviewCount += batch.length;
    const hasMore = renderedReviewCount < reviewData.length;
    document.getElementById("reviewLoadMore").hidden = !hasMore || "IntersectionObserver" in window;
    setReviewStatus(hasMore ? "ready" : "done", hasMore ? "" : "Semua ulasan sudah ditampilkan");
  } catch (error) {
    console.error("Gagal menampilkan ulasan:", error);
    setReviewStatus("error", "Ulasan belum dapat dimuat.");
    document.getElementById("reviewRetry").hidden = false;
  } finally {
    loadingReviews = false;
  }
}

function retryReviews() {
  if (!reviewLoadFailed && reviewData) {
    loadMoreReviews();
  } else {
    loadReviews();
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
  const answer = document.getElementById(button.getAttribute("aria-controls"));
  const isActive = item.classList.contains("active");

  document.querySelectorAll(".faq-item.active").forEach(function (el) {
    el.classList.remove("active");
    const activeButton = el.querySelector(".faq-question");
    const activeAnswer = document.getElementById(activeButton.getAttribute("aria-controls"));
    activeButton.setAttribute("aria-expanded", "false");
    activeAnswer.setAttribute("aria-hidden", "true");
    activeAnswer.inert = true;
  });

  if (!isActive) {
    item.classList.add("active");
    button.setAttribute("aria-expanded", "true");
    answer.setAttribute("aria-hidden", "false");
    answer.inert = false;
  }
}
