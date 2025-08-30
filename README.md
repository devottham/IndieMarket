# 🛒 IndieMarket – E-commerce MVP


IndieMarket is a **full-featured e-commerce MVP** built as a personal project to simulate a real-world online shopping experience.
This project demonstrates **end-to-end workflows** from product browsing to checkout and order management with real-time database integration.

---

## 🚀 Live Demo

🔗 [Check out IndieMarket here](https://indie-market.netlify.app/)

---

## ✨ Features

* 🔑 **Authentication** – Secure user login & signup with Firebase
* 🛍️ **Cart & Wishlist** – Add, remove, and manage products with smooth shopping flow
* 💳 **Payment Integration** – PayPal Sandbox checkout for real transactions
* 📦 **Order Management** – Orders saved to Firestore with real-time updates
* 📊 **Admin Panel** – Manage products and track activity
* 📱 **Responsive Design** – Optimized for desktop, tablet, and mobile

---

## 🛠️ Tech Stack

* **Frontend**: HTML, CSS, JavaScript
* **Backend/Database**: Firebase Authentication, Firestore
* **Payment Gateway**: PayPal Sandbox
* **Hosting**: (to be added – Firebase Hosting / Vercel / Netlify)

---

## 📂 Project Structure

```
IndieMarket/
│── index.html         # Homepage  
│── cart.html          # Shopping cart page  
│── checkout.html      # Checkout flow with PayPal integration  
│── wishlist.html      # Wishlist page  
│── orders.html        # User order history  
│── admin.html         # Admin panel for product management  
│── thankyou.html      # Post-purchase thank you page  
│── style.css          # Global styling  
│── /js
│    ├── main.js       # Homepage logic  
│    ├── cart.js       # Cart logic  
│    ├── checkout.js   # Checkout + payment integration  
│    ├── orders.js     # Order history management  
│    ├── admin.js      # Admin-side operations  
│    ├── global.js     # Shared utilities  
│    └── firebase-config.js # Firebase setup  
```

---

## ⚡ Setup & Installation

1. Clone the repository

   ```bash
   git clone https://github.com/devottham/indiemarket.git
   cd indiemarket
   ```

2. Open with **Live Server** (VS Code extension) or any local server.

3. Configure Firebase:

   * Create a Firebase project
   * Enable Authentication (Email/Password)
   * Enable Firestore Database
   * Replace your config inside `firebase-config.js`

4. Setup PayPal Sandbox:

   * Create a developer account at [PayPal Developer](https://developer.paypal.com/)
   * Generate a Sandbox Client ID
   * Replace it in `checkout.html` script

---

## 📸 Screenshots
Admin Dashboard

<img width="1897" height="838" alt="image" src="https://github.com/user-attachments/assets/bddba019-a508-4993-8227-f2ca75c447b6" />

<img width="1900" height="867" alt="image" src="https://github.com/user-attachments/assets/336605bd-37f4-4f2f-93de-7b4652d3e633" />

---

## 🎯 Future Enhancements

* 🔄 Order status tracking (Pending → Shipped → Delivered)
* 📊 Admin analytics dashboard (sales, top products, users)
* 📧 Email/SMS notifications for orders
* 📱 Progressive Web App (PWA) support

---


