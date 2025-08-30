import { db, auth } from './firebase-config.js';
import { doc, setDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const summaryItemsContainer = document.getElementById('summary-items-container');
    const summaryTotalPriceEl = document.getElementById('summary-total-price');
    const paypalContainer = document.getElementById('paypal-button-container');
    
    // References for COD
    const codButton = document.getElementById('cod-button');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalAmountINR = 0;

    // --- 1. RENDER THE ORDER SUMMARY ---
    function renderOrderSummary() {
        summaryItemsContainer.innerHTML = '';
        if (cart.length > 0) {
            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('summary-item');
                itemEl.innerHTML = `<span>${item.name} (x${item.quantity})</span><span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>`;
                summaryItemsContainer.appendChild(itemEl);
                totalAmountINR += item.price * item.quantity;
            });
            summaryTotalPriceEl.textContent = `₹${totalAmountINR.toLocaleString('en-IN')}`;
        } else {
            summaryItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if(paypalContainer) paypalContainer.innerHTML = ''; 
            if(codButton) codButton.classList.add('hidden');
        }
    }

    // --- 2. HANDLE USER LOGIN ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is verified, clear placeholder message and initialize payment options
            if(paypalContainer) paypalContainer.innerHTML = ''; 
            initializePayPalButtons(user);
        } else {
            // User is not logged in, show a message
            if(paypalContainer) paypalContainer.parentElement.innerHTML = '<p>Please log in to complete your purchase.</p>';
        }
    });

    // --- 3. LOGIC TO TOGGLE PAYMENT OPTIONS ---
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'paypal') {
                paypalContainer.classList.remove('hidden');
                codButton.classList.add('hidden');
            } else if (e.target.value === 'cod') {
                paypalContainer.classList.add('hidden');
                codButton.classList.remove('hidden');
            }
        });
    });

    // --- 4. INITIALIZE PAYPAL LOGIC ---
    function initializePayPalButtons(currentUser) {
        if (cart.length === 0 || !paypalContainer) return;

        // Convert amount to USD for PayPal sandbox
        const conversionRate = 83;
        const totalAmountUSD = (totalAmountINR / conversionRate).toFixed(2);
        if (totalAmountUSD < 0.01) return;

        paypal.Buttons({
            createOrder: (data, actions) => {
                const name = document.getElementById('name').value;
                const address = document.getElementById('address').value;
                const phone = document.getElementById('phone').value;
                if (!name || !address || !phone) {
                    alert('Please fill out all shipping information before proceeding.');
                    return actions.reject();
                }
                return actions.order.create({
                    purchase_units: [{ amount: { value: totalAmountUSD } }]
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(async (details) => {
                    await saveOrderToFirestore(details, currentUser, 'PayPal', 'Paid');
                    alert("Payment successful! Thank you, " + details.payer.name.given_name);
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new Event('cartUpdated'));
                    window.location.href = "/thankyou.html";
                });
            },
            onError: (err) => {
                console.error('PayPal Checkout Error:', err);
                alert('An error occurred during payment. Please try again.');
            }
        }).render('#paypal-button-container');
    }

    // --- 5. EVENT LISTENER FOR COD BUTTON ---
    codButton.addEventListener('click', async () => {
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        if (!name || !address || !phone) {
            alert('Please fill out all shipping information before proceeding.');
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Please log in to place an order.");
            return;
        }

        codButton.disabled = true;
        codButton.textContent = 'Placing Order...';

        // Save order to Firestore with COD details
        const simulatedDetails = { id: `cod_${Date.now()}` };
        await saveOrderToFirestore(simulatedDetails, currentUser, 'Cash on Delivery', 'Pending');
        
        alert("Your order has been placed successfully!");
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        window.location.href = "/thankyou.html";
    });

    // --- 6. SAVE ORDER TO DATABASE (Handles both PayPal and COD) ---
    async function saveOrderToFirestore(paymentDetails, currentUser, paymentGateway, status) {
        try {
            const orderRef = doc(collection(db, "orders"));
            await setDoc(orderRef, {
                userId: currentUser.uid,
                paymentGateway: paymentGateway,
                paymentId: paymentDetails.id,
                items: cart,
                totalAmount: totalAmountINR,
                currency: 'INR',
                shippingInfo: {
                    name: document.getElementById('name')?.value,
                    address: document.getElementById('address')?.value,
                    phone: document.getElementById('phone')?.value
                },
                status: status,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving order to Firestore: ", error);
        }
    }

    // --- INITIAL CALL ---
    renderOrderSummary();
});

