# Payment Collection App - Backend

This is the backend REST API for the Payment Collection Application. It handles customer loan data retrieval, payment processing with transaction safety, and payment history tracking.

Built using **Node.js**, **Express**, and **PostgreSQL**.

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Database Driver:** pg (node-postgres)
- **Utilities:** cors, dotenv, body-parser

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/) (running locally or via Docker)

### 2. Installation
Clone the repository and install dependencies:

```bash
# Navigate to the backend folder
cd payment-backend

# Install NPM packages
npm install

### 3. ENV file
# .env
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_app
