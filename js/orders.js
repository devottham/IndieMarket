import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const orderCardTemplate = document.getElementById('order-card-template');

    onAuthStateChanged(auth, user => {
        if (user) {
            fetchUserOrders(user.uid);
        } else {
            ordersContainer.innerHTML = '<p>Please <a href="/">log in</a> to view your orders.</p>';
        }
    });

    async function fetchUserOrders(userId) {
        try {
            const ordersRef = collection(db, 'orders');
            // Create a query to get only the orders for the current user
            const q = query(ordersRef, where("userId", "==", userId));
            
            const querySnapshot = await getDocs(q);

            ordersContainer.innerHTML = ''; // Clear loading message

            if (querySnapshot.empty) {
                ordersContainer.innerHTML = '<p>You have not placed any orders yet.</p>';
                return;
            }

            querySnapshot.forEach(doc => {
                const order = doc.data();
                const card = orderCardTemplate.content.cloneNode(true);

                card.querySelector('.order-id span').textContent = doc.id;
                card.querySelector('.order-date span').textContent = new Date(order.createdAt.seconds * 1000).toLocaleDateString();
                card.querySelector('.order-total span').textContent = `₹${order.totalAmount.toLocaleString('en-IN')}`;

                const itemsContainer = card.querySelector('.order-items');
                order.items.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('order-item');
                    itemEl.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="order-item-image">
                        <div>
                            <p><strong>${item.name}</strong></p>
                            <p>Quantity: ${item.quantity}</p>
                        </div>
                    `;
                    itemsContainer.appendChild(itemEl);
                });

                ordersContainer.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching orders:", error);
            ordersContainer.innerHTML = '<p>Sorry, we couldn\'t load your orders.</p>';
        }
    }
});