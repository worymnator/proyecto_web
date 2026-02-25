/**
 * main.js - Sistema de carga de componentes y funcionalidad principal
 * Arquitectura modular para ToolMaster Industrial
 * Vanilla JavaScript sin dependencias externas
 */

// Configuración global
const CONFIG = {
  componentsPath: "components/",
  assetsPath: "assets/",
  api: {
    products: "data/products.json",
  },
};

// Sistema principal de carga de componentes
class ComponentLoader {
  /**
   * Carga todos los componentes necesarios para la página
   */
  static async loadAllComponents() {
    try {
      // 1. Primero cargar el head dinámicamente
      await this.loadHead();

      // 2. Luego cargar header y footer
      await Promise.all([
        this.loadComponent("header", "header-container"),
        this.loadComponent("footer", "footer-container")
      ]);

      console.log("✅ Todos los componentes cargados correctamente");
    } catch (error) {
      console.error("❌ Error cargando componentes:", error);
      this.showFallbackUI();
    }
  }

  /**
   * Carga dinámicamente el contenido del head
   */
  static async loadHead() {
    try {
      const response = await fetch(`${CONFIG.componentsPath}head.html`);

      if (!response.ok) {
        throw new Error(`Error ${response.status} cargando head`);
      }

      const headContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(headContent, "text/html");
      const headElements = doc.head.children;

      for (const element of headElements) {
        document.head.appendChild(element.cloneNode(true));
      }

      console.log("✅ Head cargado correctamente");
    } catch (error) {
      console.error("❌ Error cargando head:", error);
      this.loadDefaultHead();
    }
  }

  static loadDefaultHead() {
    const defaultHead = `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ToolMaster | Suministros Industriales</title>
            <meta name="description" content="Tienda online de herramientas profesionales">
            <link rel="stylesheet" href="${CONFIG.assetsPath}css/main.css">
        `;

    const parser = new DOMParser();
    const doc = parser.parseFromString(defaultHead, "text/html");
    const headElements = doc.head.children;

    for (const element of headElements) {
      document.head.appendChild(element.cloneNode(true));
    }
  }

  static async loadComponent(componentName, targetId) {
    try {
      const response = await fetch(`${CONFIG.componentsPath}${componentName}.html`);

      if (!response.ok) {
        throw new Error(`Error ${response.status} cargando ${componentName}`);
      }

      const html = await response.text();
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.outerHTML = html;
        this.initComponent(componentName);
      }
    } catch (error) {
      this.showComponentFallback(componentName, targetId);
    }
  }

  static initComponent(componentName) {
    switch (componentName) {
      case "header":
        this.initHeader();
        break;
      case "footer":
        this.initFooter();
        break;
    }
  }

  static showComponentFallback(componentName, targetId) {
    const fallbacks = {
      header: `<header class="fallback-header" style="background: #0f172a; color: white; padding: 1rem; border-bottom: 3px solid #f97316;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
            <a href="/index.html" style="text-decoration: none; color: inherit;">
                <h1 style="margin: 0; font-family: sans-serif; letter-spacing: -1px;">TOOL<span style="color: #f97316;">MASTER</span></h1>
            </a>
            <nav>
                <a href="/index.html" style="color: white; text-decoration: none; margin-left: 1.5rem; font-weight: bold; font-size: 0.9rem;">INICIO</a>
                <a href="/pages/productos.html" style="color: white; text-decoration: none; margin-left: 1.5rem; font-weight: bold; font-size: 0.9rem;">CATÁLOGO</a>
                <a href="/pages/ofertas.html" style="color: white; text-decoration: none; margin-left: 1.5rem; font-weight: bold; font-size: 0.9rem;">OFERTAS</a>
            </nav>
        </div>
    </header>`,
      footer: `<footer class="fallback-footer" style="background: #0f172a; color: #94a3b8; padding: 2rem; text-align: center; border-top: 1px solid #334155;">
        <p style="color: white; margin-bottom: 0.5rem;">&copy; 2026 ToolMaster Industrial - Suministros Profesionales</p>
    </footer>`,
    };

    const target = document.getElementById(targetId);
    if (target && fallbacks[componentName]) {
      target.innerHTML = fallbacks[componentName];
    }
  }

  static showFallbackUI() {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.innerHTML = `
                <div class="fallback-message" style="text-align:center; padding: 50px;">
                    <h2>ToolMaster Industrial</h2>
                    <p>Sincronizando catálogo técnico. Por favor recarga la página.</p>
                    <button onclick="location.reload()">Recargar</button>
                </div>`;
    }
  }

  static initHeader() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navList = document.querySelector(".nav-list");

    if (menuToggle && navList) {
      menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", !isExpanded);
        navList.classList.toggle("nav-list--active");
        menuToggle.classList.toggle("menu-toggle--active");
      });
    }
    this.initCartModal();
    if (window.cartManager) window.cartManager.updateCartUI();
  }

  static initCartModal() {
    const cartButton = document.getElementById("cartButton");
    const cartModal = document.getElementById("cartModal");
    const modalClose = document.querySelector(".modal-close");

    if (cartButton && cartModal) {
      cartButton.addEventListener("click", () => {
        cartModal.style.display = "flex";
        setTimeout(() => cartModal.classList.add("modal--active"), 10);
        if (window.cartManager) window.cartManager.updateCartUI();
      });

      modalClose?.addEventListener("click", () => {
        cartModal.classList.remove("modal--active");
        setTimeout(() => cartModal.style.display = "none", 300);
      });
    }
  }

  static initFooter() {
    const newsletterForm = document.getElementById("newsletterForm");
    newsletterForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("¡Gracias por su suscripción técnica!");
    });
  }
}

// Gestor del carrito
class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("toolmaster-cart")) || [];
  }

  addProduct(product) {
    const existingItem = this.cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.cart.push({ ...product, quantity: product.quantity || 1 });
    }
    this.saveCart();
    this.updateCartUI();
    this.showAddToCartFeedback(product);
  }

  removeProduct(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) this.removeProduct(productId);
      else {
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  saveCart() {
    localStorage.setItem("toolmaster-cart", JSON.stringify(this.cart));
  }

  updateCartUI() {
    const countElement = document.getElementById("cartCount");
    const totalElement = document.getElementById("cartTotal");
    const itemsContainer = document.getElementById("cartItems");

    if (countElement) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      countElement.textContent = totalItems;
      countElement.style.display = totalItems > 0 ? "flex" : "none";
    }

    if (totalElement) {
      const totalPrice = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      totalElement.textContent = `S/ ${totalPrice.toFixed(2)}`;
    }

    if (itemsContainer) this.renderCartItems(itemsContainer);
  }

  renderCartItems(container) {
    if (this.cart.length === 0) {
      container.innerHTML = `<div class="cart-empty"><p>El pedido está vacío</p></div>`;
      return;
    }

    container.innerHTML = this.cart
      .map((item) => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">S/ ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn plus">+</button>
                    <button class="remove-btn">&times;</button>
                </div>
            </div>`)
      .join("");

    container.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.closest(".cart-item").dataset.id;
        const isPlus = e.target.classList.contains("plus");
        const item = this.cart.find((i) => i.id == productId);
        if (item) this.updateQuantity(item.id, isPlus ? item.quantity + 1 : item.quantity - 1);
      });
    });

    container.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.removeProduct(e.target.closest(".cart-item").dataset.id);
      });
    });
  }

  showAddToCartFeedback(product) {
    let feedback = document.querySelector(".cart-feedback") || document.createElement("div");
    if (!feedback.parentElement) {
        feedback.className = "cart-feedback";
        document.body.appendChild(feedback);
    }
    feedback.innerHTML = `<span>✅ ${product.name} añadido al pedido</span>`;
    feedback.classList.add("cart-feedback--show");
    setTimeout(() => feedback.classList.remove("cart-feedback--show"), 3000);
  }
}

// Gestor de productos
class ProductManager {
  static async loadFeaturedProducts() {
    try {
      const container = document.getElementById("featuredProducts");
      if (!container) return;

      container.innerHTML = `<div class="loading-spinner"></div>`;
      const products = await this.getMockProducts();

      container.innerHTML = products
        .map((product) => `
                <article class="product-card" data-id="${product.id}">
                    <div class="product-image">
                        <span class="product-badge">${product.badge || ""}</span>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-footer">
                            <span class="product-price">S/ ${product.price.toFixed(2)}</span>
                            <button class="btn btn-add-cart" data-id="${product.id}">Añadir</button>
                        </div>
                    </div>
                </article>`)
        .join("");

      container.querySelectorAll(".btn-add-cart").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const product = products.find((p) => p.id == e.target.dataset.id);
          if (product) window.cartManager.addProduct(product);
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  static async getMockProducts() {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [
      { id: 1, name: "Taladro Percutor 800W", description: "Motor de alto rendimiento y velocidad variable", price: 89.90, badge: "🔥 Top" },
      { id: 2, name: "Set Herramientas 100pzs", description: "Maletín reforzado en cromo vanadio", price: 149.90, badge: "✨ Nuevo" },
      { id: 3, name: "Amoladora Angular 4-1/2\"", description: "Protección contra rearranque accidental", price: 59.90, badge: "⚡ Oferta" },
      { id: 4, name: "Nivel Láser Autonivelante", description: "Precisión técnica para interiores", price: 119.90, badge: "🏗️ Pro" },
    ];
  }
}

class App {
  static async init() {
    window.cartManager = new CartManager();
    await ComponentLoader.loadAllComponents();
    if (document.getElementById("featuredProducts")) {
      await ProductManager.loadFeaturedProducts();
    }
    this.initCheckout();
    this.initScrollEffects();
  }

  static initCheckout() {
    document.getElementById("checkoutBtn")?.addEventListener("click", () => {
      if (window.cartManager.cart.length === 0) return alert("Pedido vacío");
      const total = window.cartManager.cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
      alert(`Finalizando pedido...\nTotal: S/ ${total}`);
    });
  }

  static initScrollEffects() {
    const header = document.querySelector(".main-header");
    window.addEventListener("scroll", () => {
        header?.classList.toggle("header-scrolled", window.pageYOffset > 100);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => App.init());