let menu = document.querySelector('#menu-bar');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{

  menu.classList.toggle('fa-times');
  navbar.classList.toggle('active');

}

window.onscroll = () =>{

  menu.classList.remove('fa-times');
  navbar.classList.remove('active');

  if(window.scrollY > 60){
    document.querySelector('#scroll-top').classList.add('active');
  }else{
    document.querySelector('#scroll-top').classList.remove('active');
  }

}

// Simple cart implementation
const GUEST_CART_KEY = 'cart_items_v1';
let cart = [];

function getAuthUser(){
  try{ return JSON.parse(localStorage.getItem('user')) || null; }catch(e){ return null; }
}

function getCartKey(){
  const user = getAuthUser();
  return user && user._id ? `cart_${user._id}` : GUEST_CART_KEY;
}

function $(sel){ return document.querySelector(sel); }
function $id(id){ return document.getElementById(id); }

function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem(getCartKey())) || []; }catch(e){ cart = []; }
}

function saveCart(){
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  renderCart();
}

// If a user just logged in, merge any guest cart into the user's cart key
function mergeGuestCartIfNeeded(){
  const user = getAuthUser();
  if(!user || !user._id) return;
  try{
    const guest = JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
    if(!guest || guest.length === 0) return;
    // load existing user cart
    const userKey = `cart_${user._id}`;
    const existing = JSON.parse(localStorage.getItem(userKey)) || [];
    // merge by name
    const map = {};
    existing.concat(guest).forEach(i=>{
      const key = i.name;
      if(!map[key]) map[key] = { name: i.name, price: Number(i.price)||0, qty: 0 };
      map[key].qty += Number(i.qty)||0;
    });
    const merged = Object.keys(map).map(k=> map[k]);
    localStorage.setItem(userKey, JSON.stringify(merged));
    // remove guest cart
    localStorage.removeItem(GUEST_CART_KEY);
    // if we are currently using userKey, update in-memory
    if(getCartKey() === userKey){ cart = merged; }
  }catch(e){ console.error('mergeGuestCartIfNeeded error', e); }
}

// Update header auth UI: show profile & logout when logged in
function updateAuthUI(){
  const authLink = document.querySelector('.btn-auth');
  const user = getAuthUser();
  // remove any existing dropdown
  const existingMenu = document.querySelector('.auth-menu');
  if(existingMenu) existingMenu.remove();

  if(!authLink) return;
  if(user && (user.username || user.email)){
    // show username on the auth button
    authLink.textContent = user.username && user.username.length ? user.username : (user.name && user.name.length ? user.name : user.email);
    authLink.classList.add('expanded');
    // ensure it's a button (no navigation)
    authLink.removeAttribute('href');
    // create dropdown menu as child of the auth button for correct positioning
    const menu = document.createElement('div');
    menu.className = 'auth-menu';
    menu.innerHTML = `
      <a class="auth-menu-item" href="profile.html">Profile</a>
      <button class="auth-menu-item" id="logout-btn">Logout</button>
    `;
    authLink.appendChild(menu);

    // remove previous click handlers and attach opening of menu
    authLink.onclick = (e)=>{ e.preventDefault(); menu.classList.toggle('open'); };

    // logout handler
    menu.querySelector('#logout-btn').addEventListener('click', ()=>{
      logoutCurrentUser();
    });
  } else {
    // guest state: show SVG icon and link to auth page
    // if authLink is a button, set click to open auth.html
    authLink.classList.remove('expanded');
    authLink.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" fill="#667eea" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" fill="#667eea" />
      </svg>
    `;
    authLink.onclick = ()=>{ window.location.href = 'auth.html'; };
  }
}

function logoutCurrentUser(){
  const user = getAuthUser();
  if(user && user._id){
    // clear user-specific cart from localStorage (user requested behavior)
    try{ localStorage.removeItem(`cart_${user._id}`); }catch(e){}
  }
  // remove auth tokens
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // reset in-memory cart and load guest cart
  cart = [];
  loadCart();
  renderCart();
  updateAuthUI();
}

function formatPrice(n){ return '₹' + (Number(n)||0); }

function renderCart(){
  const itemsEl = $id('cart-items');
  const totalEl = $id('cart-total');
  const countEl = $id('cart-count');
  if(!itemsEl || !totalEl || !countEl) return;
  itemsEl.innerHTML = '';
  if(cart.length === 0){
    itemsEl.innerHTML = '<p class="empty">Your cart is empty</p>';
    totalEl.textContent = formatPrice(0);
    countEl.textContent = '0';
    return;
  }
  let total = 0;
  let qtySum = 0;
  cart.forEach((it, idx) =>{
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-left">
        <strong>${escapeHtml(it.name)}</strong>
        <div>${formatPrice(it.price)} × ${it.qty}</div>
      </div>
      <div class="cart-item-right">
        <button class="cart-dec" data-idx="${idx}">-</button>
        <button class="cart-inc" data-idx="${idx}">+</button>
        <button class="cart-remove" data-idx="${idx}">Remove</button>
      </div>
    `;
    itemsEl.appendChild(row);
    total += it.price * it.qty;
    qtySum += it.qty;
  });
  totalEl.textContent = formatPrice(total);
  countEl.textContent = qtySum;

  // attach handlers
  itemsEl.querySelectorAll('.cart-inc').forEach(b=> b.addEventListener('click', e=>{
    const i = +e.currentTarget.dataset.idx; cart[i].qty++; saveCart();
  }));
  itemsEl.querySelectorAll('.cart-dec').forEach(b=> b.addEventListener('click', e=>{
    const i = +e.currentTarget.dataset.idx; if(cart[i].qty>1) cart[i].qty--; else cart.splice(i,1); saveCart();
  }));
  itemsEl.querySelectorAll('.cart-remove').forEach(b=> b.addEventListener('click', e=>{
    const i = +e.currentTarget.dataset.idx; cart.splice(i,1); saveCart();
  }));
}

function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function addToCart(name, price){
  const existing = cart.find(i=> i.name === name);
  if(existing) existing.qty++;
  else cart.push({ name, price: Number(price)||0, qty: 1 });
  saveCart();
}

function attachAddButtons(){
  document.querySelectorAll('.popular .box').forEach(box=>{
    const name = (box.querySelector('h3')||{textContent:'Item'}).textContent.trim();
    const priceText = (box.querySelector('.price')||{textContent:'0'}).textContent;
    const nums = priceText.match(/\d+/g);
    const price = nums && nums.length ? parseInt(nums[0],10) : 0;
    const b = document.createElement('button');
    b.className = 'btn add-to-cart';
    b.textContent = 'Add to cart';
    b.addEventListener('click', ()=> addToCart(name, price));
    // append next to existing link/button
    const existing = box.querySelector('.btn');
    if(existing && existing.parentNode) existing.parentNode.appendChild(b);
    else box.appendChild(b);
  });
}

function initCartControls(){
  const icon = $id('cart-icon');
  const panel = $id('cart-panel');
  const closeBtn = $id('cart-close');
  const clearBtn = $id('cart-clear');
  const checkoutBtn = $id('cart-checkout');
  if(icon && panel){
    icon.addEventListener('click', ()=>{
      panel.classList.toggle('cart-open');
      panel.classList.toggle('cart-closed');
      renderCart();
    });
  }
  if(closeBtn) closeBtn.addEventListener('click', ()=>{ panel.classList.add('cart-closed'); panel.classList.remove('cart-open'); });
  if(clearBtn) clearBtn.addEventListener('click', ()=>{ cart = []; saveCart(); });
  if(checkoutBtn) checkoutBtn.addEventListener('click', async ()=>{
    // Prepare order payload
    if(!cart || cart.length === 0){
      alert('Cart is empty');
      return;
    }

    // try to read address from order form if present
    let address = '';
    const addrEl = document.querySelector('.order textarea') || document.querySelector('textarea[placeholder="address"]');
    if(addrEl) address = addrEl.value.trim();

    // Always use localhost:5000 for local development
    const API_BASE = 'http://localhost:5000';
    console.log('Checkout - API_BASE:', API_BASE);
    console.log('Checkout - Payload:', { cart, total: cart.reduce((s,it)=> s + (Number(it.price)||0) * (Number(it.qty)||0), 0) });

    // try to get current user id from our stored user if available
    let userId = null;
    try{
      const au = getAuthUser();
      if(au && au._id) userId = au._id;
    }catch(e){ /* ignore */ }

    const total = cart.reduce((s,it)=> s + (Number(it.price)||0) * (Number(it.qty)||0), 0);

    // Format items with names for better readability
    const formattedItems = cart.map(i=> ({
      name: i.name,
      price: Number(i.price) || 0,
      qty: Number(i.qty) || 1,
      subtotal: (Number(i.price) || 0) * (Number(i.qty) || 1)
    }));

    const payload = {
      userId,
      items: formattedItems,
      total,
      address,
      itemSummary: formattedItems.map(i => `${i.name} (x${i.qty})`).join(', ')
    };

    console.log('Sending order to backend:', payload);

    try{
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if(res.ok && data && data.success){
        // clear cart on success
        cart = [];
        saveCart();
        if(panel){ panel.classList.remove('cart-open'); panel.classList.add('cart-closed'); }
        alert('Order placed successfully!');
      } else {
        console.error('Order error', data);
        alert('Order failed: ' + (data && data.error ? data.error : res.statusText));
      }
    }catch(err){
      console.error('Network / server error:', err);
      alert('Could not place order. Error: ' + err.message + '\n\nMake sure the backend server is running at http://localhost:5000');
    }
  });
}

// initialize
mergeGuestCartIfNeeded();
loadCart();
attachAddButtons();
initCartControls();
updateAuthUI();
renderCart();
