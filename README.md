# 🌐 Subscription DApp (Soroban on Stellar)

## 🚀 Overview

**Subscription DApp** is a decentralized recurring payment system built using **Soroban smart contracts** on the **Stellar network**. It enables users to create, manage, and execute subscription-based payments without relying on centralized platforms.

This project demonstrates how blockchain can power **trustless, automated subscription models** for real-world use cases like SaaS, memberships, and digital services.

---

## 🎯 Problem Statement

Traditional subscription systems:

* Rely on centralized control
* Lack transparency
* Can lock users into unwanted recurring payments
* Require trust in third-party platforms

👉 This DApp solves these issues by giving **full control to users**, ensuring transparency and security via blockchain.

---

## 💡 Solution

A **smart contract-based subscription system** where:

* Users define payment amount and interval
* Payments are enforced based on time conditions
* Users can cancel anytime
* All data is stored and verified on-chain

---

## ⚙️ Core Functionality

### 1. Create Subscription

Users can initialize a subscription by specifying:

* Payment amount
* Time interval (e.g., daily, weekly, monthly)

---

### 2. Execute Payment

* Users trigger payments after the interval has passed
* Contract validates timing before allowing execution
* Updates last payment timestamp

---

### 3. Cancel Subscription

* Users can cancel anytime
* Removes subscription data from blockchain storage

---

### 4. View Subscription

* Fetch subscription details for any user
* Fully transparent and verifiable

---

## ✨ Key Features

* 🔐 **Decentralized Control** — No intermediaries
* ⏱️ **Time-Based Logic** — Enforced recurring payments
* 👤 **User Ownership** — Only users control their subscriptions
* ❌ **Instant Cancellation** — No lock-ins
* 📊 **On-Chain Transparency** — Public, verifiable data
* ⚡ **Efficient & Scalable** — Built with Soroban

---

## 🛠️ Tech Stack

| Layer          | Technology      |
| -------------- | --------------- |
| Blockchain     | Stellar Network |
| Smart Contract | Soroban (Rust)  |
| Language       | Rust            |
| Tools          | Soroban CLI     |

---

## 🔗 Deployed Contract

**Contract Address:**
`CCXUTMNLHOUJKN2PMMXI7KZG77NDN2JXLHPONFAPFJ2GACUWEDVVK42N`

---

## 🧪 Example Interaction

```bash
# Fetch subscription details
soroban contract invoke \
  --id CCXUTMNLHOUJKN2PMMXI7KZG77NDN2JXLHPONFAPFJ2GACUWEDVVK42N \
  --fn get_subscription \
  --arg <subscriber_address>
```

---

## 📦 Project Structure

```
subscription-dapp/
│── contracts/
│   └── subscription/
│       └── src/lib.rs
│── README.md
│── Cargo.toml
```

---

## 🚀 Future Roadmap

* 💰 Token-based payments (USDC / Stellar assets)
* 🔁 Automated recurring payments via bots
* 📱 Frontend dashboard (React + Wallet integration)
* 🔔 Email / Push notifications
* 🧾 Payment history & analytics
* 🔐 Multi-subscription support per user

---

## 🌍 Real-World Use Cases

* SaaS platforms (monthly subscriptions)
* Creator monetization (Patreon-style)
* Membership systems
* Utility billing (electricity, internet)
* Web3 services & APIs

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

* Fork the repo
* Open issues
* Submit pull requests

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🙌 Acknowledgements

* Stellar & Soroban ecosystem
* Open-source contributors
* Hackathon inspiration 🚀

---

## ⭐ Final Note

This project is a **foundation for decentralized subscription infrastructure**.
With further enhancements like token payments and automation, it can evolve into a **production-ready Web3 billing system**.

Contract address - "CBZYEZGNAP6X7KG6ZS7MYUH33N2XW66Z35T46MNXKELROZMIJPSAJMBL"
<img width="1919" height="992" alt="Screenshot 2026-04-10 143956" src="https://github.com/user-attachments/assets/f2504471-febc-40b9-9e14-b52030152dbf" />
Client side ss - 

<img width="1919" height="1141" alt="image" src="https://github.com/user-attachments/assets/bb599c69-e403-4591-8bc0-983f86ee19f8" />
