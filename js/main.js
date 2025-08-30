import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- NEW: Add the Admin User ID here for easy reference ---
    const adminUID = "EPkVflpLTiR1BsM9kstVDAUsUL33";

    // --- UI LOGIC ---
    // Loading spinner
    setTimeout(() => {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.style.display = 'none', 500);
        }
    }, 500);

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if(newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thanks for subscribing!');
            e.target.reset();
        });
    }

    // --- ELEMENT REFERENCES ---
    const productGrid = document.getElementById('product-grid');
    const productCardTemplate = document.getElementById('product-card-template');
    const searchInput = document.getElementById('search-input');

    // Auth Modal & Form Elements
    const authModal = document.getElementById('auth-modal');
    const openModalBtn = document.getElementById('login-modal-btn');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Array to store all products for filtering
    let allProducts = [];
    let userWishlist = new Set();
    let currentUser = null;

    /**
     * Renders a given list of products to the page grid.
     */
    function renderProducts(productsToRender) {
        if (!productGrid || !productCardTemplate) return;
        productGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">No products match your search.</p>';
            return;
        }

        productsToRender.forEach(productData => {
            const cardTemplate = productCardTemplate.content.cloneNode(true);
            const card = cardTemplate.querySelector('.product-card');
            card.dataset.productId = productData.id;
            card.querySelector('.product-image').src = productData.image || 'https://placehold.co/400x400';
            card.querySelector('.product-image').alt = productData.name;
            card.querySelector('.product-name').textContent = productData.name;
            card.querySelector('.product-price').textContent = `₹${productData.price.toLocaleString('en-IN')}`;
            productGrid.appendChild(cardTemplate);
        });
    }

    /**
     * Fetches all products from Firestore once, stores them in the allProducts array, and renders them.
     */
    async function fetchAndStoreProducts() {
        try {
            const productsCollection = collection(db, 'products');
            const productSnapshot = await getDocs(productsCollection);
            allProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderProducts(allProducts);
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    }

    // Live Search Event Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
            renderProducts(filteredProducts);
        });
    }

    // --- CART LOGIC ---
    function addToCart(productId, productData) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, ...productData, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${productData.name} has been added to your cart!`);
    }

    /**
     * Fetches the current user's wishlist from Firestore.
     */
    async function fetchWishlist() {
        userWishlist.clear();
        if (!currentUser) return;
        try {
            const q = query(collection(db, 'wishlists'), where("userId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                userWishlist.add(doc.data().productId);
            });
        } catch (error) {
            console.error("Error fetching wishlist (check Firestore index):", error);
        }
    }

    /**
     * Handles adding or removing an item from the wishlist.
     */
    async function handleWishlistToggle(productId, button) {
        if (!currentUser) {
            alert("Please log in to use the wishlist.");
            return;
        }
        button.disabled = true;
        const isWishlisted = userWishlist.has(productId);
        try {
            if (isWishlisted) {
                const q = query(collection(db, 'wishlists'), where("userId", "==", currentUser.uid), where("productId", "==", productId));
                const querySnapshot = await getDocs(q);
                const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
                userWishlist.delete(productId);
                button.classList.remove('active');
            } else {
                await addDoc(collection(db, 'wishlists'), { userId: currentUser.uid, productId: productId });
                userWishlist.add(productId);
                button.classList.add('active');
            }
        } catch (error) {
            console.error("Error updating wishlist:", error);
        } finally {
            button.disabled = false;
        }
    }

    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const target = e.target.closest('.action-btn');
            if (!target) return;

            const card = target.closest('.product-card');
            const productId = card.dataset.productId;

            if (target.classList.contains('add-to-cart-btn')) {
                const productData = { name: card.querySelector('.product-name').textContent, price: parseFloat(card.querySelector('.product-price').textContent.replace('₹', '').replace(/,/g, '')), image: card.querySelector('.product-image').src };
                addToCart(productId, productData);
            } else if (target.classList.contains('wishlist-btn')) {
                handleWishlistToggle(productId, target);
            }
        });
    }

    // --- AUTH MODAL & FORM LOGIC (Homepage Specific) ---
    if (openModalBtn) openModalBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.add('hidden'); });

    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginForm.classList.add('hidden'); registerForm.classList.remove('hidden'); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); registerForm.classList.add('hidden'); loginForm.classList.remove('hidden'); });

    if (registerForm) registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorEl = document.getElementById('register-error');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            errorEl.textContent = '';
            registerForm.reset();
            authModal.classList.add('hidden');
        } catch (error) { errorEl.textContent = error.message; }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');
            try {
                // --- MODIFICATION START ---
                // Sign in and get the user's credentials
                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                // Check if the logged-in user's UID matches the admin UID
                if (userCredential.user.uid === adminUID) {
                    window.location.href = '/admin.html'; // Redirect admin to dashboard
                    return; // Stop the function here for the admin
                }

                // This code will only run for regular users
                errorEl.textContent = '';
                loginForm.reset();
                authModal.classList.add('hidden');
                // --- MODIFICATION END ---
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }

    // This is the new main entry point for loading all page data
    onAuthStateChanged(auth, user => {
        currentUser = user;
        // Now, we modify fetchAndStoreProducts to also fetch the wishlist
        fetchAndStoreProductsWithWishlist();
    });

    // We create a new master function that calls the other two
    async function fetchAndStoreProductsWithWishlist() {
        await fetchWishlist(); // Fetches the wishlist first

        // This is your existing function to fetch products
        try {
            const productsCollection = collection(db, 'products');
            const productSnapshot = await getDocs(productsCollection);
            allProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderProducts(allProducts); // Then renders them
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    }
});