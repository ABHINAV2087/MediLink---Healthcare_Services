
# Medilink - Healthcare Services

## Overview

**Medilink** is a cutting-edge Healthcare Management System built on the **MERN stack** to optimize hospital operations and improve patient care. It offers an intuitive and scalable platform to streamline tasks like appointment scheduling, patient record management, real-time doctor-patient communication, seamless integration with Google Calendar for automated scheduling, secure payment processing via Razorpay, and now includes an **AI-powered medical assistant** for instant medical query support.

# DEMO

[![Watch the Demo](https://img.youtube.com/vi/v4q3-HdnE0g/0.jpg)](https://youtu.be/v4q3-HdnE0g)

## 🧠 AI-Powered Chatbot Feature

An intelligent medical assistant built with **Flask**, **LangChain**, **HuggingFace**, and **Pinecone** that provides instant answers to health-related queries by retrieving verified information from trusted **medical PDFs**.

- 📚 Uses **vector similarity search** over authenticated medical documents.
- 🤖 Integrates seamlessly into the patient dashboard.
- 🗣️ Provides conversational responses to patient health-related queries.
- 🔐 Ensures data privacy and secure query handling.

[![Click Here](https://img.shields.io/badge/Watch%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=__IsLxIoxu8)

---

## Deployment

- **[Medilink Patient Panel](https://medilink-healthcareservices.vercel.app)**
- **[Medilink Doctor Panel](https://medilink-doctor-panel.vercel.app)**
- **[Medilink Admin Panel](https://medilink-adminpanel.vercel.app)**

### Test Doctor Panel Credentials:

- **Email:** `suresh.patel@medilink.com`  
- **Password:** `123456789`

---

## Features

### 🔒 Secure & Scalable
- **User Authentication**: Role-based login for **patients, doctors, and admins**.
- **Secure Data Storage**: Encrypted and privacy-compliant record handling.

### 📅 Smart Scheduling
- **Appointment Management**: Book/reschedule/cancel with ease.
- **Google Calendar Sync**: Auto-create **Google Meet links**.

### 💳 Payment Integration
- **Razorpay Support**: Secure transactions and receipt generation.

### 💬 Real-Time Communication
- **Doctor-Patient Messaging**: In-app real-time chat.
- **AI Chatbot Support**: Instant answers to medical queries.

### 🧠 AI Medical Assistant (NEW)
- **Built with Flask + LangChain + Pinecone + HuggingFace**.
- **Retrieves data** from medical PDFs using vector similarity.
- **Secure, accurate, and reliable** responses to health queries.

### 🏥 Admin & Doctor Dashboards
- Full control over appointments, users, earnings, and data.

---

## Tech Stack

- **Frontend**: React.js, Redux
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Chatbot**: Flask, LangChain, HuggingFace Transformers, Pinecone
- **Authentication**: JWT
- **Integrations**: Google Calendar API, Razorpay

---

## Pages & Panels

<details>
  <summary>Click to expand</summary>

### 🏠 Home Page
- Doctor search, featured doctors, and site info.

### 🩺 All Doctors Page
- Filterable doctor listing.

### 📄 About Page
- Project vision, benefits, and footer links.

### 📞 Contact Page
- Office info and job opportunities.

### 📅 Doctor Appointment Page
- Detailed profiles, booking options, and secure payments.

### 👤 User Profile
- Appointment history, personal info editing, and logout.

### 🗄️ Admin Panel
- Add/edit doctors, manage appointments and users.

### 🩺 Doctor Dashboard
- Track appointments, earnings, and update profile.

</details>

---

## 💳 Payment Integration
- 💵 Cash or 💳 Razorpay
- 🔒 Secure checkout and invoicing

---

## Installation & Setup

### Prerequisites
- **Node.js**, **MongoDB**, **Git**
- **Google API Credentials** (Calendar)
- **Razorpay API Keys**
- **Python 3.9+** (for AI assistant)
- **HuggingFace Access Token**, **Pinecone API Key**

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

   # AI Chatbot (Python Backend)
   cd ../chatbot && pip install -r requirements.txt
   ```

3. **Set environment variables**

   - `backend/.env`
     ```ini
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_REDIRECT_URI=your_google_redirect_uri
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     ```

   - `chatbot/.env`
     ```ini
     HF_TOKEN=your_huggingface_token
     PINECONE_API_KEY=your_pinecone_api_key
     PINECONE_ENVIRONMENT=gcp-starter
     PINECONE_INDEX_NAME=medical-chatbot-index
     ```

4. **Run the project**
   ```bash
   # Start Node Backend
   cd backend && npm run server

   # Start Admin Panel
   cd ../admin && npm run dev

   # Start Frontend
   cd ../frontend && npm run dev

   # Start AI Chatbot Flask App
   cd ../chatbot && python app.py
   ```

---

## Contributing

We welcome your contributions!  
Just fork, branch, commit your changes, and open a pull request 🚀

---

## Contact & Support

For queries or collaboration, reach out to **[Abhinav Tirole](mailto:tiroleabhinav@gmail.com)**.

---

## License

Licensed under the **MIT License**.
