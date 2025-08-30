import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Admin UID and link reference ---
    const adminUID = "EPkVflpLTiR1BsM9kstVDAUsUL33";
    const adminLink = document.getElementById('admin-link');

    // --- ELEMENT REFERENCES ---
    const userProfile = document.getElementById('user-profile');
    const openModalBtn = document.getElementById('login-modal-btn');
    const userEmailEl = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const mobileOrdersLink = document.getElementById('mobile-orders-link');

    // --- SHARED LOGIC FOR ALL PAGES ---
    
    // 1. Authentication State Logic
    onAuthStateChanged(auth, user => {
        if (adminLink) adminLink.classList.add('hidden');

        if (user) {
            // User is logged in
            if (userProfile && openModalBtn) {
                userProfile.classList.remove('hidden');
                openModalBtn.classList.add('hidden');
                
                // Format the user's name to be "Hi, NAME" in uppercase
                const userName = user.email.split('@')[0];
                userEmailEl.textContent = `Hi, ${userName.toUpperCase()}`;

                if(mobileOrdersLink) mobileOrdersLink.classList.remove('hidden');
            }
            
            // If the user is the admin, show the admin link
            if (adminLink && user.uid === adminUID) {
                adminLink.classList.remove('hidden');
            }

        } else {
            // User is logged out
            if (userProfile && openModalBtn) {
                userProfile.classList.add('hidden');
                openModalBtn.classList.remove('hidden');
                if(mobileOrdersLink) mobileOrdersLink.classList.add('hidden');
            }
        }
    });
    
    // 2. Logout Button Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try { await signOut(auth); window.location.href = '/'; } 
            catch (error) { console.error('Logout error:', error); }
        });
    }

    // 3. Cart Count Update Logic
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('#cart-count').forEach(el => el.textContent = totalItems);
    }
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);

    // 4. Mobile Menu Toggle
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            const isClickInside = navMenu.contains(e.target) || mobileMenuBtn.contains(e.target);
            if (!isClickInside && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }

    // 5. Highlight Active Nav Link
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (window.location.pathname.endsWith(link.getAttribute('href'))) {
            link.classList.add('active-link');
        }
    });
});