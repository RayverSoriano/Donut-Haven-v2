// ========== CUSTOM CONFIRMATION MODAL FUNCTION ==========
function showCustomConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customConfirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    
    // Set message
    messageEl.textContent = message;
    
    // Show modal
    modal.classList.add('active');
    
    // Remove previous event listeners
    const newOkBtn = okBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners
    newOkBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      resolve(true);
    });
    
    newCancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      resolve(false);
    });
    
    // Close on outside click
    const handleOutsideClick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        resolve(false);
        modal.removeEventListener('click', handleOutsideClick);
      }
    };
    
    modal.addEventListener('click', handleOutsideClick);
  });
}

// ========== SPLASH SCREEN FUNCTIONALITY ==========
function initializeSplashScreen() {
  const splashScreen = document.getElementById('splashScreen');
  
  // Show splash screen for 5 seconds then transition to home
  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    
    // After fade out animation completes, hide splash and show home
    setTimeout(() => {
      splashScreen.style.display = 'none';
      showSection('homeSection');
      
      // Initialize the rest of the app
      initializeApp();
    }, 800); // Match this with CSS transition duration
  }, 5000); // 5 seconds
}

function initializeApp() {
  // restore current user if any
  currentUsername = localStorage.getItem("currentUsername") || "";
  if (currentUsername) {
    const found = users.find(u => u.username === currentUsername);
    currentUser = found ? found.role : "customer";
  } else {
    currentUser = "guest";
  }

  // Load the appropriate cart for the current user
  loadCart();

  updateNavbar();
  showMenu();            // start on Menu so user sees items
  renderReviewCards();
  localStorage.setItem("dh_users", JSON.stringify(users)); // sync stored users
  
  // Initialize nav link handlers
  setupNavLinkHandlers();
}

// ========== CUSTOM POPUP NOTIFICATION FUNCTION ==========
function showPopup(message, duration = 3000) {
  const popup = document.getElementById('customPopup');
  const messageEl = document.getElementById('popupMessage');
  
  // Set message
  messageEl.textContent = message;
  
  // Show popup
  popup.classList.remove('fade-out');
  popup.classList.add('active');
  
  // Auto hide after duration
  setTimeout(() => {
    popup.classList.add('fade-out');
    setTimeout(() => {
      popup.classList.remove('active');
    }, 300);
  }, duration);
}

// ---------- State ----------
let currentUser = "guest";
let currentUsername = "";
let cart = []; // Initialize empty, will be set based on user
let orders = JSON.parse(localStorage.getItem("dh_orders")) || [];
let orderHistory = JSON.parse(localStorage.getItem("dh_orderHistory")) || [];
let hiddenHistory = JSON.parse(localStorage.getItem("dh_hiddenHistory")) || {}; // map username => array of hidden order IDs
let previousSection = "menuSection"; // Track previous section for back navigation

// load saved users from localStorage (if any), otherwise default accounts
let users = JSON.parse(localStorage.getItem("dh_users")) || [
  { username: "admin", password: "admin123", role: "admin", contact: "", address: "", email: "admin@donuthaven.com" },
  { username: "staff", password: "staff123", role: "staff", contact: "", address: "", email: "staff@donuthaven.com" },
  { username: "user", password: "user123", role: "customer", contact: "", address: "", email: "user@gmail.com" },
];

// load saved reviews (store under "dh_reviews")
let reviews = JSON.parse(localStorage.getItem("dh_reviews")) || [
  { name: "Maria", stars: 5, text: "The best donuts in town!" },
  { name: "John", stars: 4, text: "Affordable and delicious. Highly recommend!" },
  { name: "Angela", stars: 5, text: "Fast service and friendly staff." }
];

// load login history
let loginHistory = JSON.parse(localStorage.getItem("dh_loginHistory")) || [];

// persist synced users/reviews on load only if not present in localStorage
if (!localStorage.getItem("dh_reviews")) localStorage.setItem("dh_reviews", JSON.stringify(reviews));
if (!localStorage.getItem("dh_users")) localStorage.setItem("dh_users", JSON.stringify(users));
if (!localStorage.getItem("dh_loginHistory")) localStorage.setItem("dh_loginHistory", JSON.stringify(loginHistory));

// sample menu (images placeholders)
let menu = [
  { name: 'Glazed Donut', price: 35, category: 'donuts', img: 'glazed.webp' },
  { name: 'Chocolate Frosted', price: 40, category: 'donuts', img: 'chocolate frosted.jpg' },
  { name: 'Bavarian Creme', price: 35, category: 'donuts', img: 'bavarian creme.jpg' },
  { name: 'Vanilla Marble', price: 50, category: 'donuts', img: 'vanilla marble.jpg' },
  { name: 'Boston Creme', price: 35, category: 'donuts', img: 'boston creme.jpg' },
  { name: 'Double Chocolate', price: 35, category: 'donuts', img: 'double chocolate.jpg' },
  { name: 'Rainbow Sprinkle', price: 35, category: 'donuts', img: 'rainbow sprinkle.jpg' },
  { name: 'Mocha Creme', price: 35, category: 'donuts', img: 'mocha creme.jpg' },
  { name: 'Nutty Choco', price: 35, category: 'donuts', img: 'nutty choco.jpg' },
  { name: 'Strawberry Frosted', price: 35, category: 'donuts', img: 'strawberry frosted.jpg' },
  { name: 'Choco Butternut', price: 15, category: 'munchkins', img: 'choco butternut.jpg' },
  { name: 'Choco Glazed', price: 15, category: 'munchkins', img: 'choco glazed.jpg' },
  { name: 'Banana Maple', price: 15, category: 'munchkins', img: 'banana maple.jpg' },
  { name: 'Bavarian', price: 15, category: 'munchkins', img: 'bavarian.jpg' },
  { name: 'Boston Creme', price: 15, category: 'munchkins', img: 'boston.jpg' },
  { name: 'Strawberry filled', price: 15, category: 'munchkins', img: 'strawberry filled.jpg' },
  { name: 'Dutch Choco', price: 15, category: 'munchkins', img: 'smidgets.png' },
  { name: 'Choco Crinkles', price: 15, category: 'munchkins', img: 'crinkles.png' },
  { name: 'Choco Peanut', price: 15, category: 'munchkins', img: 'Peanut.png' },
  { name: 'Butternut Funbites', price: 15, category: 'munchkins', img: 'funbites.png' },
  { name: 'Famous 9', price: 300, category: 'bundles', img: 'famous9.png' },
  { name: 'Famous 12', price: 380, category: 'bundles', img: 'famous12.png' },
  { name: 'Famous Plus', price: 400, category: 'bundles', img: 'famous plus.png' },
  { name: 'Family Bundle', price: 500, category: 'bundles', img: 'family bundle.png' },
  { name: 'Barkada Bundle', price: 559, category: 'bundles', img: 'barkada bundle.png' },
  { name: 'Brewed Coffee', price: 75, category: 'drinks', img: 'brewed coffee.jpg' },
  { name: 'Hot Chocolate', price: 60, category: 'drinks', img: 'hot chocolate.jpg' },
  { name: 'Choco Java', price: 85, category: 'drinks', img: 'choco java.jpg' },
  { name: 'Brewed Tea', price: 80, category: 'drinks', img: 'brewed tea.jpg' },
  { name: 'Spanish Latte', price: 75, category: 'drinks', img: 'spanish latte.jpg' },
  { name: 'Iced Coffee', price: 65, category: 'drinks', img: 'iced coffee.jpg' },
  { name: 'Iced Choco Java', price: 85, category: 'drinks', img: 'iced choco java.jpg' },
  { name: 'Icy Choco', price: 55, category: 'drinks', img: 'icy choco.jpg' },
  { name: 'Iced Macchiato', price: 75, category: 'drinks', img: 'iced macchiato.jpg' },
  { name: 'Iced Americano', price: 85, category: 'drinks', img: 'iced americano.jpg' },
  { name: 'Combo 1', price: 109, category: 'combos', img: 'combo1.jpg' },
  { name: 'Combo 2', price: 120, category: 'combos', img: 'combo2.jpg' },
  { name: 'Combo 3', price: 130, category: 'combos', img: 'combo3.jpg' },
  { name: 'Combo 4', price: 159, category: 'combos', img: 'combo4.jpg' },
  { name: 'Combo 5', price: 140, category: 'combos', img: 'combo5.jpg' },
  { name: 'Combo 6', price: 130, category: 'combos', img: 'combo6.jpg' },
  { name: 'Combo 7', price: 149, category: 'combos', img: 'combo7.jpg' },
  { name: 'Combo 8', price: 120, category: 'combos', img: 'combo8.jpg' },
  { name: 'Combo 9', price: 130, category: 'combos', img: 'combo9.jpg' },
  { name: 'Combo 10', price: 129, category: 'combos', img: 'combo10.jpg' },
];

// ========== CART MANAGEMENT FUNCTIONS ==========
function getCartKey() {
  if (currentUser === "guest") {
    return "dh_cart_guest";
  } else {
    return `dh_cart_${currentUsername}`;
  }
}

function loadCart() {
  const cartKey = getCartKey();
  cart = JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart() {
  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function clearCurrentCart() {
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
  cart = [];
}

// ---------- NAV (hamburger + link handlers) ----------
const navLinksEl = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");

// Update hamburger click handler
hamburger && hamburger.addEventListener("click", () => {
  navLinksEl.classList.toggle("active");
});

// Update nav link handlers to close menu when clicked
function setupNavLinkHandlers() {
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        navLinksEl.classList.remove("active");
      }
    });
  });
}

// Update your existing nav link handlers to also close the menu on mobile
document.getElementById("homeLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "homeSection";
  showSection("homeSection");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("menuLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "menuSection";
  showMenu();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("cartLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "cartSection";
  showCart();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("ordersLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "ordersSection";
  showOrders();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("orderHistoryLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "orderHistorySection";
  showHistory();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("loginLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "loginSection";
  showSection("loginSection");
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("logoutLink").onclick = (e) => {
  e.preventDefault();
  logout();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

// Updated handlers for admin dashboard navigation
document.getElementById("manageUsersLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "adminDashboardSection";
  showAdminDashboard();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

document.getElementById("signupLink").onclick = (e) => {
  e.preventDefault();
  previousSection = "signupModal";
  openSignup();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

// ME dropdown links
document.getElementById("viewInfoBtn").onclick = (e) => {
  e.preventDefault();
  previousSection = "userDashboardSection";
  showDashboard();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};
document.getElementById("logoutMenuBtn").onclick = (e) => {
  e.preventDefault();
  logout();
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
};

// simple helper to show one section
function showSection(id) {
  document.querySelectorAll("body > section").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  if (window.innerWidth <= 820) navLinksEl.classList.remove("active");
  // scroll to top of section
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Back to previous section function
function backToPreviousSection() {
  if (previousSection) {
    showSection(previousSection);
  } else {
    backToMenu();
  }
}

// helper to scroll inside the active home section to a sub-block
function scrollToElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // ensure home section visible
  showSection("homeSection");
  // allow rendering then scroll
  setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
}

// ---------- NAVBAR UI updates ----------
function updateNavbar() {
  // refresh users from storage (in case mutated elsewhere)
  users = JSON.parse(localStorage.getItem("dh_users")) || users;

  // default visibility
  document.getElementById("loginLink").style.display = currentUser === "guest" ? "block" : "none";
  document.getElementById("logoutLink").style.display = currentUser === "guest" ? "none" : "none"; // We use ME dropdown for logged users
  document.getElementById("signupLink").style.display = currentUser === "guest" ? "block" : "none";

  // order history visible for logged roles
  document.getElementById("orderHistoryLink").style.display =
    (currentUser === "customer" || currentUser === "staff" || currentUser === "admin") ? "block" : "none";

  // admin controls & manage users link
  document.getElementById("adminControls").style.display = currentUser === "admin" ? "block" : "none";
  
  // Show admin dashboard links for admin users
  const isAdmin = currentUser === "admin";
  document.getElementById("manageUsersLink").style.display = isAdmin ? "block" : "none";

  // visibility for menu/cart depending on role
  if (currentUser === "staff") {
    document.getElementById("menuLink").style.display = "none";
    document.getElementById("cartLink").style.display = "none";
  } else if (currentUser === "admin") {
    document.getElementById("menuLink").style.display = "block";
    document.getElementById("cartLink").style.display = "none";
  } else {
    document.getElementById("menuLink").style.display = "block";
    document.getElementById("cartLink").style.display = "block";
  }

  // show ME dropdown if logged in
  const meMenu = document.getElementById("meMenu");
  const userDisplay = document.getElementById("userDisplay");
  if (currentUser !== "guest" && currentUsername) {
    meMenu.style.display = "inline-block";
    userDisplay.style.display = "none";
    // update ME button text
    const meBtn = document.getElementById("meBtn");
    if (meBtn) meBtn.textContent = `${currentUsername} ▾`;
  } else {
    meMenu.style.display = "none";
    userDisplay.style.display = "none";
  }

  // toggle add-review area depending on login state
  const addReview = document.getElementById("addReviewArea");
  if (addReview) addReview.style.display = (currentUser !== "guest" && currentUsername) ? "block" : "none";
}

// ======== DISPLAY REVIEWS (render from dh_reviews) ========
function renderReviewCards() {
  reviews = JSON.parse(localStorage.getItem("dh_reviews")) || reviews;
  const container = document.getElementById("reviewsCards");
  container.innerHTML = "";
  
  if (!reviews || reviews.length === 0) {
    container.innerHTML = `<p>No reviews yet. Be the first to share your thoughts!</p>`;
    return;
  }

  // Get the actual current logged-in username
  const loggedInUsername = localStorage.getItem("currentUsername") || currentUsername;
  
  console.log("Current logged in user:", loggedInUsername); // Debug line

  reviews.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "review-card";
    
    // Show delete button ONLY if the current logged-in user is the author of this review
    let deleteBtn = "";
    if (loggedInUsername && r.name === loggedInUsername) {
      deleteBtn = `<button class="delete-btn" onclick="deleteReview(${index})">🗑️ Remove</button>`;
    } else {
      console.log(`No delete button for review by ${r.name} - current user is ${loggedInUsername}`); // Debug
    }
    
    div.innerHTML = `
      <h4>${escapeHtml(r.name)}</h4>
      <p class="star">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</p>
      <p>${escapeHtml(r.text)}</p>
      ${deleteBtn}
    `;
    container.appendChild(div);
  });
}

// ======== SUBMIT REVIEW ========
async function submitReview() {
  const loggedInUsername = localStorage.getItem("currentUsername") || currentUsername;
  
  if (currentUser === "guest" || !loggedInUsername) {
    showPopup("You must be logged in to submit a review.");
    return;
  }
  
  const stars = Number(document.getElementById("reviewStars").value);
  const text = document.getElementById("reviewText").value.trim();
  if (!text) {
    showPopup("Please write a review.");
    return;
  }

  reviews = JSON.parse(localStorage.getItem("dh_reviews")) || reviews;
  const existingIndex = reviews.findIndex(r => r.name === loggedInUsername);
  
  if (existingIndex !== -1) {
    const confirmed = await showCustomConfirm("You already have a review. Replace it?");
    if (!confirmed) return;
    reviews[existingIndex].stars = stars;
    reviews[existingIndex].text = text;
  } else {
    reviews.unshift({ name: loggedInUsername, stars, text });
  }
  
  localStorage.setItem("dh_reviews", JSON.stringify(reviews));
  renderReviewCards();
  clearReviewForm();
  showPopup("Thanks — your review was added!");
}

// ======== DELETE REVIEW ========
async function deleteReview(index) {
  reviews = JSON.parse(localStorage.getItem("dh_reviews")) || reviews;
  
  // Get the actual current logged-in username
  const loggedInUsername = localStorage.getItem("currentUsername") || currentUsername;
  
  if (!reviews[index]) {
    showPopup("Review not found.");
    return;
  }
  
  // Triple security check
  if (!loggedInUsername) {
    showPopup("You must be logged in to delete a review.");
    return;
  }
  
  if (reviews[index].name !== loggedInUsername) {
    showPopup("You can only delete your own reviews.");
    return;
  }
  
  const confirmed = await showCustomConfirm("Are you sure you want to delete your review?");
  if (!confirmed) return;
  
  reviews.splice(index, 1);
  localStorage.setItem("dh_reviews", JSON.stringify(reviews));
  renderReviewCards();
  showPopup("Your review has been deleted.");
}

// ======== CLEAR FORM ========
function clearReviewForm() {
  const starsEl = document.getElementById("reviewStars");
  const txtEl = document.getElementById("reviewText");
  if (starsEl) starsEl.value = "5";
  if (txtEl) txtEl.value = "";
}

// ---------- LOGIN ----------
function login() {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();

  users = JSON.parse(localStorage.getItem("dh_users")) || users;
  const found = users.find(u => u.email === email && u.password === pass);
  
  if (!found) {
    showPopup("Invalid credentials! Browsing as guest.");
    currentUser = "guest";
    currentUsername = "";
    localStorage.removeItem("currentUsername");
    loadCart(); // Load guest cart
  } else {
    const previousUser = currentUser;
    const previousUsername = currentUsername;
    
    currentUser = found.role === "customer" ? "customer" : found.role;
    currentUsername = found.username;
    localStorage.setItem("currentUsername", currentUsername);
    
    // Transfer cart from guest to user if logging in from guest
    if (previousUser === "guest" && previousUsername === "") {
      const guestCartKey = "dh_cart_guest";
      const userCartKey = `dh_cart_${currentUsername}`;
      const guestCart = JSON.parse(localStorage.getItem(guestCartKey)) || [];
      
      if (guestCart.length > 0) {
        // Merge carts: combine quantities for same items
        const userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
        const mergedCart = [...userCart];
        
        guestCart.forEach(guestItem => {
          const existingItem = mergedCart.find(item => item.name === guestItem.name);
          if (existingItem) {
            existingItem.qty += guestItem.qty;
          } else {
            mergedCart.push({ ...guestItem });
          }
        });
        
        cart = mergedCart;
        saveCart();
        // Clear guest cart
        localStorage.removeItem(guestCartKey);
        
        showPopup(`Welcome back ${currentUsername}! Your guest cart items have been transferred to your account.`);
      } else {
        loadCart(); // Load user's existing cart
        showPopup(`Welcome back ${currentUsername}!`);
      }
    } else {
      loadCart(); // Load user's cart
      showPopup(`Welcome back ${currentUsername}!`);
    }
    
    // Record login history
    const loginRecord = {
      username: found.username,
      role: found.role,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().getTime()
    };
    
    loginHistory.unshift(loginRecord);
    localStorage.setItem("dh_loginHistory", JSON.stringify(loginHistory));
  }

  updateNavbar();
  renderReviewCards();
  showMenu();
}

// logout
function logout() {
  const previousUsername = currentUsername;
  
  currentUser = "guest";
  currentUsername = "";
  localStorage.removeItem("currentUsername");
  
  // Switch to guest cart
  loadCart();
  
  updateNavbar();
  renderReviewCards();
  showPopup("You are now browsing as guest.");
  showMenu();
}

// ---------- DASHBOARD FUNCTIONS ----------
function showDashboard() {
  showSection("userDashboardSection");
  loadUserInfo();
  
  // Show/hide analytics based on user role
  const analyticsCard = document.getElementById("analyticsCard");
  if (currentUser === "customer") {
    analyticsCard.style.display = "block";
    // Small delay to ensure the chart container is rendered
    setTimeout(loadSpendingChart, 100);
  } else {
    analyticsCard.style.display = "none";
  }
}

function loadUserInfo() {
  if (!currentUsername) return;
  
  const user = users.find(u => u.username === currentUsername);
  if (!user) return;
  
  document.getElementById("dbUsername").value = user.username;
  document.getElementById("dbRole").value = user.role;
  document.getElementById("dbEmail").value = user.email || "";
  document.getElementById("dbContact").value = user.contact || "";
  document.getElementById("dbAddress").value = user.address || "";
}

// Enable editing of user info
document.getElementById("editInfoBtn").addEventListener("click", function() {
  const fields = ["dbEmail", "dbContact", "dbAddress"];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    field.readOnly = false;
    field.style.backgroundColor = "white";
  });
  document.getElementById("updateInfoBtn").disabled = false;
});

// Update user info
document.getElementById("updateInfoBtn").addEventListener("click", updateUserInfo);

function updateUserInfo() {
  if (!currentUsername) return;
  
  const email = document.getElementById("dbEmail").value.trim();
  const contact = document.getElementById("dbContact").value.trim();
  const address = document.getElementById("dbAddress").value.trim();
  
  // Basic validation
  if (email && !isValidEmail(email)) {
    showPopup("Please enter a valid email address.");
    return;
  }
  
  const userIndex = users.findIndex(u => u.username === currentUsername);
  if (userIndex !== -1) {
    users[userIndex].email = email;
    users[userIndex].contact = contact;
    users[userIndex].address = address;
    
    // Save to localStorage
    localStorage.setItem("dh_users", JSON.stringify(users));
    
    // Disable editing and show success message
    const fields = ["dbEmail", "dbContact", "dbAddress"];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      field.readOnly = true;
      field.style.backgroundColor = "#f5f5f5";
    });
    document.getElementById("updateInfoBtn").disabled = true;
    
    showPopup("Information updated successfully!");
  }
}

// Change password functionality
document.getElementById("changePasswordBtn").addEventListener("click", changePassword);

function changePassword() {
  if (!currentUsername) return;
  
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showPopup("Please fill in all password fields.");
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showPopup("New passwords do not match.");
    return;
  }
  
  if (newPassword.length < 6) {
    showPopup("New password must be at least 6 characters long.");
    return;
  }
  
  const userIndex = users.findIndex(u => u.username === currentUsername);
  if (userIndex === -1) {
    showPopup("User not found.");
    return;
  }
  
  if (users[userIndex].password !== currentPassword) {
    showPopup("Current password is incorrect.");
    return;
  }
  
  // Update password
  users[userIndex].password = newPassword;
  localStorage.setItem("dh_users", JSON.stringify(users));
  
  // Clear password fields
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  
  showPopup("Password changed successfully!");
}

// Spending chart
let spendingChart = null;

function loadSpendingChart() {
  const ctx = document.getElementById('spendingChart');
  if (!ctx) return;
  
  // Destroy existing chart if it exists
  if (spendingChart) {
    spendingChart.destroy();
  }
  
  const timeFilter = document.getElementById('timeFilter').value;
  const data = getSpendingData(timeFilter);
  
  spendingChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Spending (₱)',
        data: data.amounts,
        borderColor: '#c47a2c',
        backgroundColor: 'rgba(196, 122, 44, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₱' + value;
            }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}

function getSpendingData(timeFilter) {
  // Get order history for current user
  const userOrders = orderHistory.filter(order => order.user === currentUsername);
  
  if (userOrders.length === 0) {
    return { labels: ['No data'], amounts: [0] };
  }
  
  let labels = [];
  let amounts = [];
  
  const now = new Date();
  
  switch(timeFilter) {
    case 'week':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTotal = userOrders
          .filter(order => {
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            return orderDate === dateStr;
          })
          .reduce((sum, order) => sum + order.total, 0);
        
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        amounts.push(dayTotal);
      }
      break;
      
    case 'month':
      // Last 30 days grouped by week
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i + 1) * 7);
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        
        const weekTotal = userOrders
          .filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= weekStart && orderDate < weekEnd;
          })
          .reduce((sum, order) => sum + order.total, 0);
        
        labels.push(`Week ${4-i}`);
        amounts.push(weekTotal);
      }
      break;
      
    case 'year':
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthTotal = userOrders
          .filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= month && orderDate < nextMonth;
          })
          .reduce((sum, order) => sum + order.total, 0);
        
        labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
        amounts.push(monthTotal);
      }
      break;
      
    case 'all':
    default:
      // Group by year
      const years = [...new Set(userOrders.map(order => new Date(order.date).getFullYear()))].sort();
      labels = years.map(year => year.toString());
      amounts = years.map(year => 
        userOrders
          .filter(order => new Date(order.date).getFullYear() === year)
          .reduce((sum, order) => sum + order.total, 0)
      );
      break;
  }
  
  return { labels, amounts };
}

// Time filter change handler
document.getElementById('timeFilter').addEventListener('change', loadSpendingChart);

// Utility function for email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// show user info via alert (simple)
function showUserInfo() {
  if (!currentUsername) return showPopup("No user info available.");
  users = JSON.parse(localStorage.getItem("dh_users")) || users;
  const u = users.find(x => x.username === currentUsername);
  if (!u) return showPopup("User not found.");

  // Fill modal fields
  document.getElementById("infoUsername").textContent = u.username;
  document.getElementById("infoRole").textContent = u.role;
  document.getElementById("infoEmail").textContent = u.email;
  document.getElementById("infoContact").textContent = u.contact || "(none)";
  document.getElementById("infoAddress").textContent = u.address || "(none)";

  // Show modal
  document.getElementById("userInfoModal").style.display = "flex";
}

function closeUserInfo() {
  document.getElementById("userInfoModal").style.display = "none";
}

// ---------- Signup UI ----------
function openSignup() {
  document.getElementById("signupModal").style.display = "flex";
}
function closeSignup() {
  document.getElementById("signupModal").style.display = "none";
}

// Sign up: username, email, password, contact, address
function signup() {
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const contact = document.getElementById("signupContact").value.trim();
  const address = document.getElementById("signupAddress").value.trim();

  if (!username || !password || !email) {
    showPopup("Username, email and password are required.");
    return;
  }
  
  if (!isValidEmail(email)) {
    showPopup("Please enter a valid email address.");
    return;
  }

  users = JSON.parse(localStorage.getItem("dh_users")) || users;
  if (users.find(u => u.username === username)) {
    showPopup("Username already exists.");
    return;
  }
  if (users.find(u => u.email === email)) {
    showPopup("Email already exists.");
    return;
  }

  const newUser = { username, email, password, role: "customer", contact, address };
  users.push(newUser);
  // persist to localStorage
  localStorage.setItem("dh_users", JSON.stringify(users));

  // clear fields
  document.getElementById("signupUsername").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupPassword").value = "";
  document.getElementById("signupContact").value = "";
  document.getElementById("signupAddress").value = "";

  showPopup("Sign up successful! The new user has been added.");
  closeSignup();

  // keep manage users closed by default; admin can open it when needed
}

// ---------- MENU DISPLAY ----------
function showMenu() {
  showSection("menuSection");
  showCategory('all');
}

function showCategory(cat) {
  const container = document.getElementById("menuItems");
  container.innerHTML = "";

  menu.filter(item => cat === 'all' || item.category === cat)
    .forEach(item => {
      const div = document.createElement("div");
      div.classList.add("menu-item");
      let orderPart = (currentUser === "customer")
            ? `<button onclick="addToCart('${escapeHtml(item.name)}')">Add to Cart</button>`
            : `<p style='color:gray;'></p>`;


      // admin edit button
      let adminEditBtn = "";
      if (currentUser === "admin") {
        adminEditBtn = `<button class="admin-edit" onclick="openEditMenuModal('${escapeHtml(item.name)}')">EDIT</button>`;
        // show remove hint too if desired; but admin has remove modal above
      }

      div.innerHTML = `
        <img src="${item.img}">
        <h3>${escapeHtml(item.name)}</h3>
        <p>₱${item.price}</p>
        <div style="display:flex; justify-content:center; gap:8px;">
          ${orderPart}
          ${adminEditBtn}
        </div>
      `;
      container.appendChild(div);
    });
}

// ---------- ADMIN: add / remove / edit via modal ----------
let menuEditOriginalName = null;
function openAddMenuModal() {
  menuEditOriginalName = null;
  document.getElementById("addMenuTitle").textContent = "Add Menu Item";
  document.getElementById("addItemName").value = "";
  document.getElementById("addItemPrice").value = "";
  document.getElementById("addItemCategory").value = "";
  document.getElementById("addItemImg").value = "";
  document.getElementById("addMenuModal").style.display = "flex";
}
function closeAddMenuModal() {
  document.getElementById("addMenuModal").style.display = "none";
}
function openEditMenuModal(itemName) {
  // find item and prefill
  const it = menu.find(m => m.name === itemName);
  if (!it) {
    showPopup("Item not found");
    return;
  }
  menuEditOriginalName = it.name;
  document.getElementById("addMenuTitle").textContent = "Edit Menu Item";
  document.getElementById("addItemName").value = it.name;
  document.getElementById("addItemPrice").value = it.price;
  document.getElementById("addItemCategory").value = it.category;
  document.getElementById("addItemImg").value = it.img || "";
  document.getElementById("addMenuModal").style.display = "flex";
}
function confirmAddOrEditMenuItem() {
  const name = document.getElementById("addItemName").value.trim();
  const price = Number(document.getElementById("addItemPrice").value);
  const category = document.getElementById("addItemCategory").value;
  const img = document.getElementById("addItemImg").value || 'https://via.placeholder.com/150';
  if (!name || !price || !category) {
    showPopup("All fields required!");
    return;
  }

  if (menuEditOriginalName) {
    // edit mode
    const idx = menu.findIndex(m => m.name === menuEditOriginalName);
    if (idx !== -1) {
      menu[idx] = { name, price, category, img };
      showPopup("Menu item updated!");
    } else {
      showPopup("Original item not found, adding new item instead.");
      menu.push({ name, price, category, img });
    }
  } else {
    // add mode
    menu.push({ name, price, category, img });
    showPopup("Menu item added!");
  }
  closeAddMenuModal();
  showMenu();
}

function openRemoveMenuModal() {
  document.getElementById("removeItemName").value = "";
  document.getElementById("removeMenuModal").style.display = "flex";
}
function closeRemoveMenuModal() {
  document.getElementById("removeMenuModal").style.display = "none";
}
async function confirmRemoveMenuItem() {
  const name = document.getElementById("removeItemName").value.trim();
  if (!name) {
    showPopup("Enter the item name to remove.");
    return;
  }
  const idx = menu.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) {
    showPopup("Item not found!");
    return;
  }
  
  const confirmed = await showCustomConfirm(`Remove ${menu[idx].name}?`);
  if (!confirmed) return;
  
  menu.splice(idx, 1);
  showPopup("Menu item removed!");
  closeRemoveMenuModal();
  showMenu();
}

// ---------- CART ----------
function addToCart(itemName) {
  if (currentUser !== "customer") {
    showPopup("Only logged-in customers can order!");
    return;
  }

  const existing = cart.find(i => i.name === itemName);
  if (existing) {
    existing.qty++;
  } else {
    const item = menu.find(m => m.name === itemName);
    cart.push({ ...item, qty: 1 });
  }
  
  saveCart(); // Use the new save function
  showPopup(`${itemName} added to cart!`);
}

function showCart() {
  showSection("cartSection");
  const container = document.getElementById("cartItems");
  const totalContainer = document.getElementById("cartTotal");
  container.innerHTML = "";
  
  // Ensure we're showing the current user's cart
  if (cart.length === 0) {
    container.innerHTML = "<p class='empty-message'>Your cart is empty. Add some delicious donuts! 🍩</p>";
    totalContainer.innerHTML = "";
    return;
  }

  let subtotal = 0;
  cart.forEach((item, i) => {
    subtotal += item.price * item.qty;
    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" class="cart-img">
        <div class="cart-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>₱${item.price} x ${item.qty}</p>
        </div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>`;
  });
  
  const shippingFee = 50;
  const total = subtotal + shippingFee;
  
  totalContainer.innerHTML = `
    <h3>Subtotal: ₱${subtotal}</h3>
    <h3>Shipping Fee: ₱${shippingFee}</h3>
    <h2>Total: ₱${total}</h2>
  `;
}


function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(); // Use the new save function
  showCart();
}

// ---------- PAYMENT FLOW ----------
let selectedPayment = "";
let gcashFormVisible = false;

function openPaymentModal() {
  if (cart.length === 0) {
    showPopup("Your cart is empty!");
    return;
  }
  
  // Close mobile navigation if open
  if (window.innerWidth <= 820 && navLinksEl) {
    navLinksEl.classList.remove("active");
  }
  
  document.getElementById("paymentModal").style.display = "flex";
  resetPaymentForm();
  
  // Auto-focus on first input for better mobile UX
  setTimeout(() => {
    document.getElementById("payName").focus();
  }, 300);
}

function closePaymentModal() {
  document.getElementById("paymentModal").style.display = "none";
  resetPaymentForm();
}

function resetPaymentForm() {
  selectedPayment = "";
  gcashFormVisible = false;
  
  // Show payment options, hide GCash form
  document.querySelector('.payment-options').style.display = 'flex';
  document.getElementById('gcashForm').style.display = 'none';
  document.querySelector('.payment-cancel').style.display = 'block';
  
  // Reset GCash form fields
  document.getElementById('gcashUserNumber').value = '';
  document.getElementById('gcashReference').value = '';
}

function selectPayment(method) {
  selectedPayment = method;
  
  if (method === 'GCash') {
    showGCashForm();
  } else {
    // For COD and Card, proceed directly to payment
    document.getElementById("paymentModal").style.display = "none";
    processPayment();
  }
}

function showGCashForm() {
  gcashFormVisible = true;
  
  // Hide payment options, show GCash form
  document.querySelector('.payment-options').style.display = 'none';
  document.getElementById('gcashForm').style.display = 'block';
  document.querySelector('.payment-cancel').style.display = 'none';
  
  // Calculate and display total amount
  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const shippingFee = 50;
  const total = subtotal + shippingFee;
  
  document.getElementById('gcashAmount').value = `₱${total}`;
  
  // Auto-focus on first GCash input
  setTimeout(() => {
    document.getElementById('gcashUserNumber').focus();
  }, 300);
}

function cancelGCash() {
  resetPaymentForm();
}

async function confirmGCashPayment() {
  const gcashUserNumber = document.getElementById('gcashUserNumber').value.trim();
  const gcashReference = document.getElementById('gcashReference').value.trim();
  
  // Validation
  if (!gcashUserNumber) {
    showPopup("Please enter your GCash number.");
    document.getElementById('gcashUserNumber').focus();
    return;
  }
  
  if (!gcashReference) {
    showPopup("Please enter the reference number.");
    document.getElementById('gcashReference').focus();
    return;
  }
  
  // Basic GCash number validation (Philippine mobile format)
  const phoneRegex = /^09\d{9}$/;
  if (!phoneRegex.test(gcashUserNumber.replace(/-/g, ''))) {
    showPopup("Please enter a valid GCash number (09XXXXXXXXX).");
    document.getElementById('gcashUserNumber').focus();
    return;
  }
  
  const confirmed = await showCustomConfirm("Confirm GCash payment? Please make sure you have sent the exact amount to our GCash number.");
  if (!confirmed) return;
  
  // Proceed with payment
  document.getElementById("paymentModal").style.display = "none";
  processPayment(gcashUserNumber, gcashReference);
}

function processPayment(gcashUserNumber = "", gcashReference = "") {
  const items = [...cart];
  const username = currentUsername || "guest";
  const payName = document.getElementById("payName").value || username;
  const payContact = document.getElementById("payContact").value || "";
  const payAddress = document.getElementById("payAddress").value || "";

  if (!selectedPayment) {
    showPopup("Please choose a payment method.");
    return;
  }
  if (items.length === 0) {
    showPopup("Your cart is empty!");
    return;
  }

  const subtotal = items.reduce((t, i) => t + i.price * i.qty, 0);
  const shippingFee = 50;
  const total = subtotal + shippingFee;

  // Create order object with GCash details if applicable
  const order = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    items: items,
    user: username,
    customerName: payName,
    contact: payContact,
    address: payAddress,
    paymentMethod: selectedPayment,
    subtotal: subtotal,
    shippingFee: shippingFee,
    total: total,
    date: new Date().toISOString(),
    status: "Pending",
    progress: 0
  };

  // Add GCash details if payment method is GCash
  if (selectedPayment === 'GCash') {
    order.gcashUserNumber = gcashUserNumber;
    order.gcashReference = gcashReference;
  }

  // Add to orders (for staff/admin to process)
  orders.push(order);
  localStorage.setItem("dh_orders", JSON.stringify(orders));

  // Clear cart using the new function
  clearCurrentCart();

  // ✅ Show popup first
  const popup = document.getElementById("paymentPopup");
  popup.classList.add("active");

  // Auto-hide popup after 3 seconds and show receipt
  setTimeout(() => {
    popup.classList.remove("active");
    previousSection = "receiptSection";
    showSection("receiptSection");
  }, 3000);

  // Generate the receipt details
  generateReceipt(order);

  // Reset input fields and payment selection
  resetPaymentForm();
  document.getElementById("payName").value = "";
  document.getElementById("payContact").value = "";
  document.getElementById("payAddress").value = "";
}

// ---------- RECEIPT ----------
function generateReceipt(order) {
  const container = document.getElementById("receiptContent");
  
  const itemsHTML = order.items.map(item => 
    `<li>${item.qty}x ${escapeHtml(item.name)} — ₱${item.price * item.qty}</li>`
  ).join('');

  // Add GCash details if payment was via GCash
  const gcashDetails = order.paymentMethod === 'GCash' ? `
    <div style="margin: 10px 0; padding: 8px; background: #f0f8f0; border-radius: 6px; border-left: 3px solid #28a745;">
      <p><strong>GCash Number:</strong> ${escapeHtml(order.gcashUserNumber)}</p>
      <p><strong>Reference No:</strong> ${escapeHtml(order.gcashReference)}</p>
    </div>
  ` : '';

  container.innerHTML = `
    <h2 style="text-align:center; color:#5C4033; margin-bottom:8px; font-size:1.4rem;">🍩 DONUT HAVEN</h2>
    <p style="text-align:center; font-size:13px; margin-top:-2px; color:#7a5b2b;">Official Receipt</p>
    <hr style="border:1px solid gold; margin:12px 0;">
    
    <div style="margin-bottom:8px;">
      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p>
      <p><strong>Contact:</strong> ${escapeHtml(order.contact)}</p>
      <p><strong>Address:</strong> ${escapeHtml(order.address)}</p>
    </div>
    
    <hr style="border:1px solid gold; margin:12px 0;">
    
    <h4 style="margin:12px 0 8px 0; color:#5C4033;">Order Items:</h4>
    <ul style="margin:0; padding-left:18px;">
      ${itemsHTML}
    </ul>
    
    <hr style="border:1px solid gold; margin:12px 0;">
    
    <div style="margin-bottom:8px;">
      <p><strong>Subtotal:</strong> ₱${order.subtotal}</p>
      <p><strong>Shipping Fee:</strong> ₱${order.shippingFee}</p>
      <p style="font-weight:bold; font-size:15px;"><strong>Total:</strong> ₱${order.total}</p>
    </div>
    
    ${gcashDetails}
    
    <hr style="border:1px solid gold; margin:12px 0;">
    
    <p><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}</p>
    
    <hr style="border:1px solid gold; margin:12px 0;">
    
    <p style="text-align:center; font-weight:bold; color:#5C4033; margin-top:15px;">
      Thank you for ordering at Donut Haven!
    </p>
  `;
}

// Save receipt as image function
function saveReceiptAsImage() {
  const receiptBox = document.getElementById('receiptBox');
  
  // Show loading message
  showPopup("Generating receipt image...");
  
  // Hide buttons temporarily for the screenshot
  const receiptButtons = receiptBox.querySelector('.receipt-buttons');
  const originalDisplay = receiptButtons.style.display;
  receiptButtons.style.display = 'none';
  
  html2canvas(receiptBox, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#fff8e1'
  }).then(canvas => {
    // Restore buttons visibility
    receiptButtons.style.display = originalDisplay;
    
    // Convert canvas to image data URL
    const imageData = canvas.toDataURL('image/png');
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.download = `donut-haven-receipt-${Date.now()}.png`;
    link.href = imageData;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showPopup("Receipt saved as image!");
  }).catch(error => {
    console.error('Error generating receipt image:', error);
    // Restore buttons visibility in case of error
    receiptButtons.style.display = originalDisplay;
    showPopup("Error saving receipt. Please try again.");
  });
}

// ---------- ORDERS (staff/admin) ----------
function showOrders() {
  showSection("ordersSection");
  const container = document.getElementById("orderList");
  container.innerHTML = "";

  // FIXED: Filter orders based on user role
  let ordersToShow = [];
  if (currentUser === "staff" || currentUser === "admin") {
    // Staff and admin can see all orders
    ordersToShow = orders;
  } else if (currentUser === "customer") {
    // Customers can only see their own orders
    ordersToShow = orders.filter(order => order.user === currentUsername);
  } else {
    // Guest users see no orders
    ordersToShow = [];
  }

  if (ordersToShow.length === 0) {
    container.innerHTML = "<p class='empty-message'>No current orders. Place an order to see it here! 🍩</p>";
    return;
  }

  // Create table for desktop
  const tableContainer = document.createElement("div");
  tableContainer.className = "orders-table-container";
  
  let tableHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          ${currentUser === "staff" || currentUser === "admin" ? `<th>Action</th>` : ""}
        </tr>
      </thead>
      <tbody>
  `;

  // Create cards container for mobile
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "orders-cards";

  // Fill both table and cards with orders
  ordersToShow.forEach((order) => {
    const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.qty, 0) : order.qty || 1;
    const itemNames = order.items ? order.items.map(item => `${item.qty}x ${item.name}`).join(', ') : `${order.qty || 1}x ${order.name}`;
    const total = order.total || (order.price * (order.qty || 1));
    
    // Table row
    tableHTML += `
      <tr>
        <td>#${order.id}</td>
        <td>${escapeHtml(order.customerName || order.user)}</td>
        <td>${itemCount} item(s)</td>
        <td>₱${total}</td>
        <td>${escapeHtml(order.status)}</td>
        ${
          currentUser === "staff" || currentUser === "admin"
            ? `<td><button class="next-btn" onclick="updateOrder('${order.id}')">Next Step</button></td>`
            : ""
        }
      </tr>
    `;

    // Card for mobile
    const cardHTML = `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-id">Order #${order.id}</div>
          <div class="order-status">${escapeHtml(order.status)}</div>
        </div>
        <div class="order-card-body">
          <div class="order-info">
            <strong>Customer:</strong> ${escapeHtml(order.customerName || order.user)}
          </div>
          <div class="order-info">
            <strong>Contact:</strong> ${escapeHtml(order.contact || 'N/A')}
          </div>
          <div class="order-info">
            <strong>Address:</strong> ${escapeHtml(order.address || 'N/A')}
          </div>
          <div class="order-items">
            <strong>Items:</strong> ${itemNames}
          </div>
          <div class="order-info">
            <strong>Total:</strong> ₱${total}
          </div>
          <div class="order-info">
            <strong>Payment:</strong> ${escapeHtml(order.paymentMethod || 'N/A')}
          </div>
        </div>
        ${
          currentUser === "staff" || currentUser === "admin"
            ? `<div class="order-actions">
                <button class="next-btn" onclick="updateOrder('${order.id}')">Next Step</button>
               </div>`
            : ""
        }
      </div>
    `;
    
    cardsContainer.innerHTML += cardHTML;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = tableHTML;
  container.appendChild(tableContainer);
  container.appendChild(cardsContainer);
}

function updateOrder(orderId) {
  const orderIndex = orders.findIndex(o => o.id == orderId);
  if (orderIndex === -1) return;
  
  const o = orders[orderIndex];
  if (o.status === "Pending") { 
    o.status = "Preparing"; 
    o.progress = 50; 
  }
  else if (o.status === "Preparing") { 
    o.status = "Out of Delivery"; 
    o.progress = 80; 
  }
  else if (o.status === "Out of Delivery") {
    o.status = "Completed"; 
    o.progress = 100;
    // Move to order history
    orderHistory.push(o);
    orders.splice(orderIndex, 1);
    // Save to localStorage
    localStorage.setItem("dh_orders", JSON.stringify(orders));
    localStorage.setItem("dh_orderHistory", JSON.stringify(orderHistory));
  }
  
  // Save updated orders
  localStorage.setItem("dh_orders", JSON.stringify(orders));
  showOrders();
}

// ---------- ORDER HISTORY ----------
function showHistory() {
  showSection("orderHistorySection");
  const container = document.getElementById("historyList");
  container.innerHTML = "";

  // Get hidden orders for current user
  const hiddenForCurrent = hiddenHistory[currentUsername] || [];
  
  // For customers: show only their orders that are not hidden
  // For staff/admin: show all orders (they don't have personal hidden orders)
  const visibleOrders = currentUser === "customer" 
    ? orderHistory.filter(o => o.user === currentUsername && !hiddenForCurrent.includes(o.id))
    : orderHistory;

  if (visibleOrders.length === 0) {
    container.innerHTML = "<p class='empty-message'>No completed orders yet. Your order history will appear here! 🍩</p>";
    return;
  }

  visibleOrders.forEach(order => {
    const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.qty, 0) : order.qty || 1;
    const briefDescription = order.items ? 
      `${itemCount} item(s) - ₱${order.total}` : 
      `${order.qty || 1}x ${order.name} - ₱${order.price * (order.qty || 1)}`;
    
    container.innerHTML += `
      <div class="history-item">
        <div class="history-info">
          <h4>Order #${order.id}</h4>
          <p>${briefDescription}</p>
          <p><strong>Customer:</strong> ${escapeHtml(order.customerName || order.user)}</p>
          <p><strong>Date:</strong> ${order.date ? new Date(order.date).toLocaleString() : 'N/A'}</p>
          <p><strong>Status:</strong> ${order.status || 'Completed'}</p>
        </div>
        <div class="history-actions">
          <button class="view-btn" onclick="viewOrderDetails(${order.id})">View Details</button>
          ${currentUser === "customer" || currentUser === "admin" || currentUser === "staff"
            ? `<button class="remove-btn" onclick="removeHistory('${order.id}')">Remove</button>` 
            : ''}
        </div>
      </div>`;
  });
}

function viewOrderDetails(orderId) {
  const order = orderHistory.find(o => o.id == orderId);
  if (!order) {
    showPopup("Order not found.");
    return;
  }

  // Generate receipt-like view
  const itemsHTML = order.items ? 
    order.items.map(item => `<li>${item.qty}x ${escapeHtml(item.name)} — ₱${item.price * item.qty}</li>`).join('') :
    `<li>${order.qty || 1}x ${escapeHtml(order.name)} — ₱${order.price * (order.qty || 1)}</li>`;

  const subtotal = order.subtotal || (order.price * (order.qty || 1));
  const shippingFee = order.shippingFee || 50;
  const total = order.total || (subtotal + shippingFee);

  const receiptHTML = `
    <div class="order-details-modal">
      <div class="modal-content">
        <h2>Order Details #${order.id}</h2>
        <div class="order-details-content">
          <p><strong>Date:</strong> ${order.date ? new Date(order.date).toLocaleString() : 'N/A'}</p>
          <p><strong>Customer:</strong> ${escapeHtml(order.customerName || order.user)}</p>
          <p><strong>Contact:</strong> ${escapeHtml(order.contact || 'N/A')}</p>
          <p><strong>Address:</strong> ${escapeHtml(order.address || 'N/A')}</p>
          <hr>
          <h4>Items:</h4>
          <ul>${itemsHTML}</ul>
          <hr>
          <p><strong>Subtotal:</strong> ₱${subtotal}</p>
          <p><strong>Shipping Fee:</strong> ₱${shippingFee}</p>
          <p><strong>Total:</strong> ₱${total}</p>
          <hr>
          <p><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod || 'N/A')}</p>
          <p><strong>Status:</strong> ${order.status || 'Completed'}</p>
        </div>
        <div class="buttons">
          <button onclick="closeOrderDetails()">Close</button>
        </div>
      </div>
    </div>
  `;

  // Create and show modal
  const modal = document.createElement('div');
  modal.id = 'orderDetailsModal';
  modal.innerHTML = receiptHTML;
  document.body.appendChild(modal);
  
  // Add styles for the modal
  const style = document.createElement('style');
  style.textContent = `
    .order-details-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .order-details-modal .modal-content {
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .order-details-content {
      text-align: left;
    }
  `;
  document.head.appendChild(style);
}

function closeOrderDetails() {
  const modal = document.getElementById('orderDetailsModal');
  if (modal) {
    modal.remove();
  }
}

// FIXED: Updated removeHistory function to allow staff to remove orders permanently
async function removeHistory(orderId) {
  if (currentUser !== "customer" && currentUser !== "admin" && currentUser !== "staff") return;
  
  const confirmed = await showCustomConfirm("Are you sure you want to remove this order from history?");
  if (!confirmed) return;

  // Convert orderId to number for comparison
  const orderIdNum = Number(orderId);
  
  // Find the order
  const order = orderHistory.find(o => o.id === orderIdNum);
  
  if (!order) {
    showPopup("Order not found in history.");
    return;
  }
  
  // Check permissions
  if (currentUser === "customer" && order.user !== currentUsername) {
    showPopup("You can only remove your own orders.");
    return;
  }
  
  if (currentUser === "customer") {
    // For customers: add to hidden history (only hides from their view)
    if (!hiddenHistory[currentUsername]) {
      hiddenHistory[currentUsername] = [];
    }
    hiddenHistory[currentUsername].push(orderIdNum);
    localStorage.setItem("dh_hiddenHistory", JSON.stringify(hiddenHistory));
    showPopup("Order removed from your history!");
  } else if (currentUser === "admin" || currentUser === "staff") {
    // For admin and staff: permanently remove from order history (affects everyone)
    const orderIndex = orderHistory.findIndex(o => o.id === orderIdNum);
    if (orderIndex !== -1) {
      orderHistory.splice(orderIndex, 1);
      localStorage.setItem("dh_orderHistory", JSON.stringify(orderHistory));
      showPopup("Order permanently deleted from history!");
    }
  }
  
  showHistory();
}

// ========== ADMIN DASHBOARD FUNCTIONS ==========

// Show admin dashboard
function showAdminDashboard() {
  showSection("adminDashboardSection");
  updateAdminStats();
}

// Update admin dashboard statistics
function updateAdminStats() {
  // Update user statistics
  document.getElementById("totalUsersCount").textContent = users.length;
  document.getElementById("adminUsersCount").textContent = users.filter(u => u.role === "admin").length;
  document.getElementById("staffUsersCount").textContent = users.filter(u => u.role === "staff").length;
  
  // Update login statistics
  const today = new Date().toLocaleDateString();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  document.getElementById("totalLoginsCount").textContent = loginHistory.length;
  document.getElementById("todayLoginsCount").textContent = loginHistory.filter(l => l.date === today).length;
  document.getElementById("weekLoginsCount").textContent = loginHistory.filter(l => {
    const loginDate = new Date(l.timestamp);
    return loginDate >= oneWeekAgo;
  }).length;
  
  // Update product and sales statistics
  document.getElementById("totalProductsCount").textContent = menu.length;
  
  const allOrders = [...orders, ...orderHistory];
  document.getElementById("totalSalesCount").textContent = `₱${allOrders.reduce((total, order) => total + (order.total || 0), 0).toFixed(2)}`;
  document.getElementById("totalOrdersCount").textContent = allOrders.length;
}

// Show manage users dashboard
function showManageUsersDashboard() {
  showSection("manageUsersDashboardSection");
  userFilter = "all";
  renderManageUsers();
  // Hide add user form when opening
  document.getElementById("addUserSection").style.display = "none";
}

// Show login history dashboard
function showLoginHistoryDashboard() {
  showSection("loginHistoryDashboardSection");
  loginHistoryFilter = "all";
  renderLoginHistory();
}

// Show tally product dashboard
function showTallyProductDashboard() {
  showSection("tallyProductDashboardSection");
  updateTallyChart();
  updateReviewsAnalytics();
}

// ---------- MANAGE USERS FUNCTIONS ----------
let userFilter = "all";

function toggleAddUserForm() {
  const addUserSection = document.getElementById("addUserSection");
  const isVisible = addUserSection.style.display === "block";
  
  if (isVisible) {
    addUserSection.style.display = "none";
  } else {
    addUserSection.style.display = "block";
    // Hide user details if visible
    hideUserDetails();
    // Clear form fields
    document.getElementById("newUserName").value = "";
    document.getElementById("newUserEmail").value = "";
    document.getElementById("newUserPass").value = "";
    document.getElementById("newUserContact").value = "";
    document.getElementById("newUserAddress").value = "";
    document.getElementById("newUserRole").value = "customer";
  }
}

function filterUsers(role) {
  userFilter = role;
  renderManageUsers();
}

function renderManageUsers() {
  const list = document.getElementById("manageUsersList");
  list.innerHTML = "";

  users = JSON.parse(localStorage.getItem("dh_users")) || users;
  const filtered = userFilter === "all" ? users : users.filter(u => u.role === userFilter);

  if (filtered.length === 0) {
    list.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No users found in this category.</td></tr>";
    return;
  }

  filtered.forEach((u, i) => {
    const removeBtn = u.username === "admin" ? 
      "" : 
      `<button class="remove-user-btn" onclick="removeUser(${users.indexOf(u)})">Remove</button>`;
    
    list.innerHTML += `
      <tr>
        <td>${escapeHtml(u.username)}</td>
        <td><span class="role-badge role-${u.role}">${escapeHtml(u.role)}</span></td>
        <td>${escapeHtml(u.email)}</td>
        <td>
          <button class="view-user-btn" onclick="viewUserDetails('${u.username}')">View</button>
          ${removeBtn}
        </td>
      </tr>`;
  });
}

function viewUserDetails(username) {
  const user = users.find(u => u.username === username);
  if (!user) return;
  
  const detailsSection = document.getElementById("userDetailsSection");
  const userDetails = document.getElementById("userDetails");
  
  userDetails.innerHTML = `
    <div class="user-detail-item">
      <label>Username:</label>
      <span>${escapeHtml(user.username)}</span>
    </div>
    <div class="user-detail-item">
      <label>Role:</label>
      <span class="role-badge role-${user.role}">${escapeHtml(user.role)}</span>
    </div>
    <div class="user-detail-item">
      <label>Email:</label>
      <span>${escapeHtml(user.email)}</span>
    </div>
    <div class="user-detail-item">
      <label>Contact:</label>
      <span>${escapeHtml(user.contact || 'Not provided')}</span>
    </div>
    <div class="user-detail-item">
      <label>Address:</label>
      <span>${escapeHtml(user.address || 'Not provided')}</span>
    </div>
    <div class="user-detail-actions">
      <button class="remove-user-btn" onclick="removeUser(${users.indexOf(user)})">Remove User</button>
    </div>
  `;
  
  document.querySelector('.users-table-section').style.display = 'none';
  detailsSection.style.display = 'block';
  // Hide add user form if visible
  document.getElementById("addUserSection").style.display = 'none';
}

function hideUserDetails() {
  document.querySelector('.users-table-section').style.display = 'block';
  document.getElementById("userDetailsSection").style.display = 'none';
}

function addUser() {
  const username = document.getElementById("newUserName").value.trim();
  const email = document.getElementById("newUserEmail").value.trim();
  const password = document.getElementById("newUserPass").value.trim();
  const contact = document.getElementById("newUserContact").value.trim();
  const address = document.getElementById("newUserAddress").value.trim();
  const role = document.getElementById("newUserRole").value;

  if (!username || !password || !email) {
    showPopup("Please fill in all required fields.");
    return;
  }
  
  if (!isValidEmail(email)) {
    showPopup("Please enter a valid email address.");
    return;
  }

  users = JSON.parse(localStorage.getItem("dh_users")) || users;
  if (users.find(u => u.username === username)) {
    showPopup("Username already exists.");
    return;
  }
  if (users.find(u => u.email === email)) {
    showPopup("Email already exists.");
    return;
  }

  const newUser = { username, email, password, role, contact, address };
  users.push(newUser);
  localStorage.setItem("dh_users", JSON.stringify(users));
  
  // Clear form fields and hide form
  document.getElementById("newUserName").value = "";
  document.getElementById("newUserEmail").value = "";
  document.getElementById("newUserPass").value = "";
  document.getElementById("newUserContact").value = "";
  document.getElementById("newUserAddress").value = "";
  document.getElementById("newUserRole").value = "customer";
  
  document.getElementById("addUserSection").style.display = "none";

  renderManageUsers();
  showPopup("User added successfully!");
}

async function removeUser(index) {
  const user = users[index];
  if (!user) return showPopup("User not found.");
  if (user.username === "admin") return showPopup("Cannot remove admin account.");
  
  const confirmed = await showCustomConfirm(`Remove user ${user.username}?`);
  if (!confirmed) return;
  
  users.splice(index, 1);
  localStorage.setItem("dh_users", JSON.stringify(users));
  renderManageUsers();
  // If we're viewing this user's details, hide the details section
  hideUserDetails();
}

// ---------- LOGIN HISTORY FUNCTIONS ----------
let loginHistoryFilter = "all";

function filterLoginHistory(role) {
  loginHistoryFilter = role;
  renderLoginHistory();
}

function renderLoginHistory() {
  const list = document.getElementById("loginHistoryList");
  list.innerHTML = "";

  loginHistory = JSON.parse(localStorage.getItem("dh_loginHistory")) || loginHistory;
  const filtered = loginHistoryFilter === "all" ? loginHistory : loginHistory.filter(l => l.role === loginHistoryFilter);

  if (filtered.length === 0) {
    list.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No login history found.</td></tr>";
    document.getElementById("totalLogins").textContent = "0";
    return;
  }

  filtered.forEach((login, index) => {
    list.innerHTML += `
      <tr>
        <td>${escapeHtml(login.username)}</td>
        <td><span class="role-badge role-${login.role}">${escapeHtml(login.role)}</span></td>
        <td>${escapeHtml(login.date)}</td>
        <td>${escapeHtml(login.time)}</td>
        <td>
          <button class="remove-login-btn" onclick="removeLoginHistory(${index})">🗑️ Remove</button>
        </td>
      </tr>`;
  });

  document.getElementById("totalLogins").textContent = filtered.length;
}

async function removeLoginHistory(index) {
  const confirmed = await showCustomConfirm("Are you sure you want to remove this login record?");
  if (!confirmed) return;
  
  loginHistory.splice(index, 1);
  localStorage.setItem("dh_loginHistory", JSON.stringify(loginHistory));
  renderLoginHistory();
  showPopup("Login record removed!");
}

async function clearAllLoginHistory() {
  const confirmed = await showCustomConfirm("Are you sure you want to clear ALL login history? This cannot be undone.");
  if (!confirmed) return;
  
  loginHistory = [];
  localStorage.setItem("dh_loginHistory", JSON.stringify(loginHistory));
  renderLoginHistory();
  showPopup("All login history cleared!");
}

// ---------- TALLY PRODUCT FUNCTIONS ----------
let tallyChart = null;

function updateTallyChart() {
  const categoryFilter = document.getElementById("tallyCategoryFilter").value;
  const timeFilter = document.getElementById("tallyTimeFilter").value;
  const chartType = document.getElementById("tallyChartType").value;
  
  const tallyData = getTallyData(categoryFilter, timeFilter);
  
  // Update summary statistics
  document.getElementById("totalSales").textContent = `₱${tallyData.totalSales}`;
  document.getElementById("totalOrders").textContent = tallyData.totalOrders;
  document.getElementById("bestSeller").textContent = tallyData.bestSeller || "-";
  
  // Update total users count
  document.getElementById("totalUsers").textContent = getTotalUsersCount();
  
  // Update chart
  const ctx = document.getElementById('tallyChart');
  if (!ctx) return;
  
  // Destroy existing chart if it exists
  if (tallyChart) {
    tallyChart.destroy();
  }
  
  const config = {
    type: chartType,
    data: {
      labels: tallyData.labels,
      datasets: [{
        label: 'Quantity Sold',
        data: tallyData.quantities,
        backgroundColor: getChartColors(tallyData.labels.length, chartType),
        borderColor: chartType === 'line' ? '#c47a2c' : undefined,
        borderWidth: chartType === 'line' ? 2 : 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === 'pie',
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Product Sales Tally'
        }
      },
      scales: chartType !== 'pie' ? {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Quantity Sold'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Products'
          }
        }
      } : undefined
    }
  };
  
  tallyChart = new Chart(ctx, config);
}

// Function to get total users count
function getTotalUsersCount() {
  users = JSON.parse(localStorage.getItem("dh_users")) || users;
  return users.length;
}

// Function to update reviews analytics
function updateReviewsAnalytics() {
  const reviewsData = getReviewsAnalytics();
  
  // Update reviews statistics
  document.getElementById("totalReviews").textContent = reviewsData.totalReviews;
  document.getElementById("averageRating").textContent = reviewsData.averageRating.toFixed(1);
  
  // Update rating breakdown
  const breakdownContainer = document.getElementById("ratingBreakdown");
  breakdownContainer.innerHTML = "";
  
  reviewsData.breakdown.forEach(rating => {
    const ratingBar = document.createElement("div");
    ratingBar.className = "rating-bar";
    
    const barWidth = rating.percentage > 0 ? Math.max(rating.percentage, 5) : 0;
    
    ratingBar.innerHTML = `
      <div class="rating-label">
        <span class="stars">${"★".repeat(rating.stars)}${"☆".repeat(5 - rating.stars)}</span>
        <span class="count">(${rating.count})</span>
      </div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${barWidth}%; background-color: ${getRatingColor(rating.stars)};"></div>
        <span class="percentage">${rating.percentage}%</span>
      </div>
    `;
    
    breakdownContainer.appendChild(ratingBar);
  });
}

// Function to get reviews analytics data
function getReviewsAnalytics() {
  reviews = JSON.parse(localStorage.getItem("dh_reviews")) || reviews;
  
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      breakdown: [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 }
      ]
    };
  }
  
  // Calculate total reviews and average rating
  const totalReviews = reviews.length;
  const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
  const averageRating = totalStars / totalReviews;
  
  // Calculate breakdown by star rating
  const breakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(review => review.stars === stars).length;
    const percentage = Math.round((count / totalReviews) * 100);
    
    return { stars, count, percentage };
  });
  
  return {
    totalReviews,
    averageRating,
    breakdown
  };
}

// Helper function to get color based on rating
function getRatingColor(stars) {
  switch(stars) {
    case 5: return '#28a745'; // Green for excellent
    case 4: return '#20c997'; // Teal for very good
    case 3: return '#ffc107'; // Yellow for good
    case 2: return '#fd7e14'; // Orange for fair
    case 1: return '#dc3545'; // Red for poor
    default: return '#6c757d'; // Gray for no rating
  }
}

// FIXED: getTallyData function with corrected sorting
function getTallyData(categoryFilter, timeFilter) {
  // Combine orders and orderHistory for complete sales data
  const allOrders = [...orders, ...orderHistory];
  
  // Filter by time period if needed
  let filteredOrders = allOrders;
  if (timeFilter !== 'all') {
    const now = new Date();
    let startDate;
    
    switch(timeFilter) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }
    
    filteredOrders = allOrders.filter(order => new Date(order.date) >= startDate);
  }
  
  // Initialize productSales object
  const productSales = {};
  let totalSales = 0;
  let totalOrders = filteredOrders.length;
  let bestSeller = { name: '', quantity: 0 };
  
  // Calculate product sales
  filteredOrders.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        // Filter by category if needed
        const menuItem = menu.find(m => m.name === item.name);
        if (categoryFilter === 'all' || (menuItem && menuItem.category === categoryFilter)) {
          if (!productSales[item.name]) {
            productSales[item.name] = {
              quantity: 0,
              revenue: 0,
              category: menuItem ? menuItem.category : 'unknown'
            };
          }
          
          productSales[item.name].quantity += item.qty;
          productSales[item.name].revenue += item.price * item.qty;
          totalSales += item.price * item.qty;
          
          // Update best seller
          if (productSales[item.name].quantity > bestSeller.quantity) {
            bestSeller.name = item.name;
            bestSeller.quantity = productSales[item.name].quantity;
          }
        }
      });
    }
  });
  
  // Sort by quantity sold (descending) - FIXED VERSION
  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => {
      const quantityA = a[1].quantity || 0;
      const quantityB = b[1].quantity || 0;
      return quantityB - quantityA;
    });
  
  const labels = sortedProducts.map(([name]) => name);
  const quantities = sortedProducts.map(([, data]) => data.quantity);
  
  return {
    labels: labels.slice(0, 15), // Show top 15 products
    quantities: quantities.slice(0, 15),
    totalSales: totalSales.toFixed(2),
    totalOrders,
    bestSeller: bestSeller.name
  };
}

function getChartColors(count, chartType) {
  const baseColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
    '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
  ];
  
  if (chartType === 'pie') {
    return baseColors.slice(0, count);
  } else if (chartType === 'bar') {
    return Array(count).fill('#c47a2c');
  } else {
    return Array(count).fill('#36A2EB');
  }
}

// ---------- UTIL ----------
function backToMenu() { showMenu(); }

// escape HTML simple function
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ========== NEWSLETTER SUBSCRIPTION ==========
function subscribeNewsletter() {
  const email = document.getElementById('newsletterEmail').value.trim();
  const messageEl = document.getElementById('newsletterMessage');
  
  if (!email) {
    messageEl.textContent = 'Please enter your email address.';
    messageEl.className = 'newsletter-message error';
    return;
  }
  
  if (!isValidEmail(email)) {
    messageEl.textContent = 'Please enter a valid email address.';
    messageEl.className = 'newsletter-message error';
    return;
  }
  
  // Get existing subscriptions from localStorage
  let subscriptions = JSON.parse(localStorage.getItem('dh_newsletter_subscriptions')) || [];
  
  // Check if already subscribed
  if (subscriptions.includes(email)) {
    messageEl.textContent = 'You are already subscribed!';
    messageEl.className = 'newsletter-message error';
    return;
  }
  
  // Add to subscriptions
  subscriptions.push(email);
  localStorage.setItem('dh_newsletter_subscriptions', JSON.stringify(subscriptions));
  
  // Show success message
  messageEl.textContent = 'Thank you for subscribing to our newsletter!';
  messageEl.className = 'newsletter-message success';
  
  // Clear input
  document.getElementById('newsletterEmail').value = '';
  
  // Auto-hide message after 5 seconds
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

// ========== MODAL FUNCTIONS FOR FOOTER ==========
function openPrivacyModal() {
  document.getElementById('privacyModal').style.display = 'flex';
}

function closePrivacyModal() {
  document.getElementById('privacyModal').style.display = 'none';
}

function openTermsModal() {
  document.getElementById('termsModal').style.display = 'flex';
}

function closeTermsModal() {
  document.getElementById('termsModal').style.display = 'none';
}

// ========== FOOTER NAVIGATION ==========
// Add click handlers for footer navigation
document.addEventListener('DOMContentLoaded', function() {
  // Footer links are already handled by inline onclick events
  // Add modal close handlers
  const modals = ['privacyModal', 'termsModal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', function(event) {
        if (event.target === this) {
          this.style.display = 'none';
        }
      });
    }
  });
  
  // Add enter key support for newsletter
  const newsletterInput = document.getElementById('newsletterEmail');
  if (newsletterInput) {
    newsletterInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        subscribeNewsletter();
      }
    });
  }
});

// ========== UTILITY FUNCTION FOR EMAIL VALIDATION ==========
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========== UPDATE WINDOW ONCLICK FOR NEW MODALS ==========
// Update window.onclick function to include new modals
window.onclick = function(event) {
  const modalIds = [
    "paymentModal", 
    "signupModal", 
    "addMenuModal", 
    "removeMenuModal", 
    "userInfoModal",
    "privacyModal",
    "termsModal"
  ];
  modalIds.forEach(id => {
    const modal = document.getElementById(id);
    if (modal && event.target === modal) modal.style.display = "none";
  });
};

// initialize app - ONLY CALL SPLASH SCREEN
window.onload = () => {
  initializeSplashScreen();
};