# Medilink - Healthcare Services

## Overview

**Medilink** is a cutting-edge Healthcare Management System built on the **MERN stack** to optimize hospital operations and improve patient care. It offers an intuitive and scalable platform to streamline tasks like appointment scheduling, patient record management, real-time doctor-patient communication, seamless integration with Google Calendar for automated scheduling, and secure payment processing via Razorpay.

## Features

### 🔒 Secure & Scalable
- **User Authentication**: Role-based secure login for **patients, doctors, and administrators**.
- **Secure Data Storage**: Compliant with healthcare privacy standards, ensuring encrypted and protected patient records.

### 📅 Smart Scheduling
- **Appointment Management**: Patients can **book, reschedule, or cancel** appointments effortlessly.
- **Google Calendar Sync**: Sync appointments in real-time and auto-generate **Google Meet links** for online consultations.

### 💳 Payment Integration
- **Razorpay Payment Gateway**: Secure online payments for appointment bookings.
- **Automated Invoicing**: Generate invoices and payment receipts for patient records.

### 🏥 Enhanced Hospital Workflow
- **Patient Record Management**: Store and manage patient history, diagnoses, and prescriptions securely.
- **Doctor-Patient Communication**: Real-time **chat and messaging** for consultations and follow-ups.
- **Admin Dashboard**: Centralized control for **user, appointment, and data management**.

## Tech Stack

- **Frontend**: React.js (with Redux for state management)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **APIs**: Google Calendar API for scheduling & Google Meet integration
- **Payment Gateway**: Razorpay

## Installation & Setup

### Prerequisites
- **Node.js** installed
- **MongoDB** (local or cloud instance)
- **Git** installed
- **Google API credentials** for Calendar integration
- **Razorpay API credentials** for payment processing

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Medilink-Hospital_Management_System.git
   cd Medilink-Hospital_Management_System
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   
   # Admin Panel
   cd ../admin && npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the `backend` directory and add:
     ```ini
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_REDIRECT_URI=your_google_redirect_uri
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     ```
   - Replace placeholders with actual credentials.

4. **Run the application**
   ```bash
   # Start Backend Server
   cd backend && npm run server

   # Start Admin Panel
   cd ../admin && npm run dev

   # Start Frontend Panel
   cd ../frontend && npm run dev
   ```

## Deployment

- **[Medilink Patient Panel](https://medilink-healthcareservices.vercel.app)**
- **[Medilink Admin/Doctor Panel](https://medilink-healthcareservices-admin.vercel.app/)**

## Contributing

We welcome contributions! To get started:
1. **Fork** the repository
2. **Create a new branch** (`feature-xyz`)
3. **Commit your changes** and push to GitHub
4. **Submit a pull request** 🚀

## Contact & Support
For inquiries, feature requests, or support, contact **[Abhinav Tirole](mailto:tiroleabhinav@gmail.com)**.

## License

This project is **licensed under the MIT License**.
