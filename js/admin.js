import { db, auth } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const adminContent = document.getElementById('admin-content');
    const authGate = document.getElementById('auth-gate');
    const addProductForm = document.getElementById('add-product-form');
    const manageProductsList = document.getElementById('manage-products-list');
    const editModal = document.getElementById('edit-modal');
    const editProductForm = document.getElementById('edit-product-form');
    const closeEditModalBtn = editModal.querySelector('.modal-close-btn');

    // --- NEW: TOAST NOTIFICATION FUNCTION ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return; // Exit if container doesn't exist
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
        toast.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
        
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // --- ADMIN AUTHENTICATION ---
    const adminUID = "EPkVflpLTiR1BsM9kstVDAUsUL33"; // Your Admin UID
    onAuthStateChanged(auth, user => {
        if (user && user.uid === adminUID) {
            authGate.classList.add('hidden');
            adminContent.classList.remove('hidden');
            loadProducts();
        } else {
            authGate.classList.remove('hidden');
            adminContent.classList.add('hidden');
        }
    });

    // --- LOGIC TO ADD A NEW PRODUCT ---
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;
        try {
            await addDoc(collection(db, "products"), { name, price, image });
            showToast("Product added successfully!");
            addProductForm.reset();
            loadProducts();
        } catch (error) {
            console.error("Error adding product: ", error);
            showToast("Error adding product.", "error");
        }
    });

    // --- LOGIC TO LOAD/DISPLAY ALL PRODUCTS ---
    async function loadProducts() {
        manageProductsList.innerHTML = 'Loading products...';
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            let productsHTML = '';
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                productsHTML += `
                    <div class="manage-product-item">
                        <div class="manage-product-details">
                            <img src="${product.image}" alt="${product.name}" class="manage-product-image">
                            <span>${product.name} - ₹${product.price}</span>
                        </div>
                        <div class="manage-product-actions">
                            <button class="btn btn-sm btn-edit" data-id="${doc.id}">Edit</button>
                            <button class="btn btn-sm btn-delete" data-id="${doc.id}">Delete</button>
                        </div>
                    </div>
                `;
            });
            manageProductsList.innerHTML = productsHTML;
        } catch (error) {
            manageProductsList.innerHTML = 'Failed to load products.';
        }
    }

    // --- LOGIC FOR EDIT AND DELETE BUTTONS ---
    manageProductsList.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;
        if (!productId) return;

        if (target.classList.contains('btn-delete')) {
            deleteProduct(productId);
        } else if (target.classList.contains('btn-edit')) {
            openEditModal(productId);
        }
    });
    
    async function deleteProduct(id) {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                showToast("Product deleted successfully!");
                loadProducts();
            } catch (error) {
                console.error("Error deleting product: ", error);
                showToast("Error deleting product.", "error");
            }
        }
    }

    async function openEditModal(id) {
        try {
            const docSnap = await getDoc(doc(db, "products", id));
            if (docSnap.exists()) {
                const product = docSnap.data();
                document.getElementById('edit-product-id').value = id;
                document.getElementById('edit-product-name').value = product.name;
                document.getElementById('edit-product-price').value = product.price;
                document.getElementById('edit-product-image').value = product.image;
                editModal.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error getting product details: ", error);
        }
    }
    
    // --- LOGIC FOR THE EDIT MODAL ---
    closeEditModalBtn.addEventListener('click', () => editModal.classList.add('hidden'));

    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-product-id').value;
        const name = document.getElementById('edit-product-name').value;
        const price = parseFloat(document.getElementById('edit-product-price').value);
        const image = document.getElementById('edit-product-image').value;
        try {
            await updateDoc(doc(db, "products", id), { name, price, image });
            showToast("Product updated successfully!");
            editModal.classList.add('hidden');
            loadProducts();
        } catch (error) {
            console.error("Error updating product: ", error);
            showToast("Error updating product.", "error");
        }
    });
});