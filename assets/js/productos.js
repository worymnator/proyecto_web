const searchInput = document.getElementById("product-search");
const categoryButtons = document.querySelectorAll(".category-pill");
const products = document.querySelectorAll(".product-card");

let activeCategory = "all";

searchInput.addEventListener("input", filterProducts);

categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    filterProducts();
  });
});

function filterProducts() {
  const searchText = searchInput.value.toLowerCase();

  products.forEach((product) => {
    const name = product.querySelector(".product-name").textContent.toLowerCase();
    const category = product.dataset.category;

    const matchesSearch = name.includes(searchText);
    const matchesCategory = activeCategory === "all" || category === activeCategory;

    product.style.display = matchesSearch && matchesCategory ? "block" : "none";
  });
}

const cartMessage = document.getElementById("cart-message");
const addToCartButtons = document.querySelectorAll(".btn-add-cart");

addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productCard = button.closest(".product-card");
    const productName = productCard.querySelector(".product-name").textContent;

    showCartMessage(`"${productName}" fue agregado al carrito`);
  });
});

function showCartMessage(message) {
  cartMessage.textContent = message;
  cartMessage.classList.add("show");

  setTimeout(() => {
    cartMessage.classList.remove("show");
  }, 2500);
}
