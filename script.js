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
const CART_KEY = 'cart_items_v1';
let cart = [];

function $(sel){ return document.querySelector(sel); }
function $id(id){ return document.getElementById(id); }

function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ cart = []; }
}

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
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
  if(checkoutBtn) checkoutBtn.addEventListener('click', ()=>{
    // clear cart on checkout
    cart = [];
    saveCart();
    if(panel){ panel.classList.remove('cart-open'); panel.classList.add('cart-closed'); }
    alert('Checkout complete — your cart has been cleared.');
  });
}

// initialize
loadCart();
attachAddButtons();
initCartControls();
renderCart();
