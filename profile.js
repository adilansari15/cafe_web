function getAuthUser(){ try{ return JSON.parse(localStorage.getItem('user')) || null; }catch(e){ return null; } }
function getCartKey(){ const u = getAuthUser(); return u && u._id ? `cart_${u._id}` : 'cart_items_v1'; }

function renderProfile(){
  const u = getAuthUser();
  const infoEl = document.getElementById('profile-info');
  if(!u){ infoEl.textContent = 'Not logged in.'; return; }
  infoEl.innerHTML = `<div><strong>${u.username || u.email}</strong></div><div class="muted">${u.email}${u.name ? ' · ' + u.name : ''}</div>`;

  const cartItems = JSON.parse(localStorage.getItem(getCartKey())||'[]');
  const cartEl = document.getElementById('profile-cart-items');
  const emptyEl = document.getElementById('profile-cart-empty');
  cartEl.innerHTML = '';
  if(!cartItems || cartItems.length===0){ emptyEl.style.display='block'; return; }
  emptyEl.style.display='none';
  let total = 0;
  cartItems.forEach(i=>{
    const row = document.createElement('div'); row.className='cart-item-row';
    row.innerHTML = `<div><strong>${i.name}</strong><div class="muted">${i.qty} × ${'₹'+(i.price||0)}</div></div><div><strong>${'₹'+((i.qty||1)*(i.price||0))}</strong></div>`;
    cartEl.appendChild(row);
    total += (i.qty||1)*(i.price||0);
  });
  const totalRow = document.createElement('div'); totalRow.style.marginTop='1rem'; totalRow.innerHTML = `<strong>Total: ₹${total}</strong>`;
  cartEl.appendChild(totalRow);
}

function logout(){
  const u = getAuthUser();
  if(u && u._id){ localStorage.removeItem(`cart_${u._id}`); }
  localStorage.removeItem('token'); localStorage.removeItem('user');
  window.location.href = 'index.html';
}

document.getElementById('logout-profile').addEventListener('click', logout);

renderProfile();

// If user logs out in another tab, reflect it
window.addEventListener('storage', (e)=>{
  if(e.key==="user") renderProfile();
});
