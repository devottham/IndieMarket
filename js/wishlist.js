import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const wishlistGrid = document.getElementById('wishlist-grid');
    const productCardTemplate = document.getElementById('product-card-template');
    let currentUser = null;

    onAuthStateChanged(auth, user => {
        currentUser = user;
        if (user) {
            fetchWishlistedProducts(user.uid);
        } else {
            wishlistGrid.innerHTML = '<p>Please <a href="/">log in</a> to view your wishlist.</p>';
        }
    });

    async function fetchWishlistedProducts(userId) {
        if (!wishlistGrid || !productCardTemplate) return;
        
        try {
            // 1. Get the list of product IDs from the user's wishlist
            const wishlistQuery = query(collection(db, 'wishlists'), where("userId", "==", userId));
            const wishlistSnapshot = await getDocs(wishlistQuery);
            
            if (wishlistSnapshot.empty) {
                wishlistGrid.innerHTML = '<p>Your wishlist is empty. <a href="/">Explore products</a>.</p>';
                return;
            }

            const productIds = wishlistSnapshot.docs.map(doc => doc.data().productId);

            // 2. Fetch the details for each product ID
            const productPromises = productIds.map(id => getDoc(doc(db, "products", id)));
            const productDocs = await Promise.all(productPromises);

            wishlistGrid.innerHTML = ''; // Clear loading message
            
            productDocs.forEach(productDoc => {
                if (productDoc.exists()) {
                    const productData = { id: productDoc.id, ...productDoc.data() };
                    const cardTemplate = productCardTemplate.content.cloneNode(true);
                    const card = cardTemplate.querySelector('.product-card');
                    card.dataset.productId = productData.id;
                    card.querySelector('.product-image').src = productData.image || 'https://placehold.co/400x400';
                    card.querySelector('.product-name').textContent = productData.name;
                    card.querySelector('.product-price').textContent = `₹${productData.price.toLocaleString('en-IN')}`;
                    wishlistGrid.appendChild(cardTemplate);
                }
            });

        } catch (error) {
            console.error("Error fetching wishlisted products:", error);
            wishlistGrid.innerHTML = '<p>Sorry, we couldn\'t load your wishlist.</p>';
        }
    }

    // Event listener for removing from wishlist or adding to cart from this page
    wishlistGrid.addEventListener('click', async (e) => {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        const card = target.closest('.product-card');
        const productId = card.dataset.productId;

        if (target.classList.contains('wishlist-btn')) {
            if (!currentUser) return;
            // Remove from wishlist
            try {
                const q = query(collection(db, 'wishlists'), where("userId", "==", currentUser.uid), where("productId", "==", productId));
                const querySnapshot = await getDocs(q);
                const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
                card.remove(); // Remove the card from the view instantly
            } catch (error) {
                console.error("Error removing from wishlist:", error);
            }
        } else if (target.classList.contains('add-to-cart-btn')) {
            // Add to cart logic (copied from main.js)
            const productData = { name: card.querySelector('.product-name').textContent, price: parseFloat(card.querySelector('.product-price').textContent.replace('₹', '').replace(/,/g, '')), image: card.querySelector('.product-image').src };
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) existingItem.quantity++;
            else cart.push({ id: productId, ...productData, quantity: 1 });
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated')); 
            alert(`${productData.name} has been added to your cart!`);
        }
    });
});