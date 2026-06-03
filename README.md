# 🎫 CRM Ticketing System

A modern full-stack CRM Ticketing System built with the MERN stack to streamline customer support operations. The platform enables support teams to manage customer tickets, track issue resolution progress, add internal notes, and monitor performance through an interactive analytics dashboard.

## 🚀 Live Demo

Frontend: [Add Frontend URL]

Backend API:
https://crm-backend-2pqs.onrender.com

---

## ✨ Features

### 🔐 Authentication & Security
- User Registration & Login
- JWT-based Authentication
- Password Hashing with bcrypt
- Protected API Routes
- Persistent User Sessions

### 🎫 Ticket Management
- Create Support Tickets
- View Ticket Details
- Update Ticket Status
- Add Internal Notes
- Automatic Ticket ID Generation
- Track Ticket History

### 🔍 Search & Filtering
- Search by:
  - Ticket ID
  - Customer Name
  - Email
  - Subject
  - Description
- Filter by Status
- Paginated Ticket Listing

### 📊 Analytics Dashboard
- Total Tickets
- Open Tickets
- In Progress Tickets
- Closed Tickets
- Ticket Trend Visualization
- Status Distribution Charts
- Recent Activity Timeline

### 🎨 Modern UI
- Responsive Design
- Interactive Charts using Recharts
- Clean CRM-style Dashboard
- Toast Notifications
- Status & Priority Indicators

---

## 🛠 Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Recharts
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs

### Deployment
- Render
- MongoDB Atlas

---

## 📂 Project Structure

```text
CRM-TicketingSystem
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── context
│   │   └── api
│   └── public
│
├── crm-backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── utils
│
└── README.md
```

---

## 📈 Dashboard Insights

The dashboard provides real-time support metrics including:

- Total Ticket Count
- Open Ticket Monitoring
- In Progress Ticket Tracking
- Closed Ticket Statistics
- Weekly Ticket Trends
- Ticket Distribution Charts
- Recent Ticket Activity Feed

---

## 🔗 API Endpoints

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Tickets

```http
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:ticket_id
PUT    /api/tickets/:ticket_id
GET    /api/tickets/stats
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 💻 Installation

### Clone Repository

```bash
git clone https://github.com/Sharvari-21/CRM-TicketingSystem.git
cd CRM-TicketingSystem
```

### Backend Setup

```bash
cd crm-backend

npm install

npm run dev
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 📸 Screenshots

### Login Page
<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/f578d4a2-28e2-46b6-877e-d17dcc9d2aaa" />


### Dashboard
<img width="1701" height="3532" alt="image" src="https://github.com/user-attachments/assets/8f1446f0-7781-4903-923b-885dc479777b" />


### Ticket List
<img width="1701" height="1095" alt="image" src="https://github.com/user-attachments/assets/5cc52817-840b-4766-9409-efd97d083d80" />


### Ticket Details
<img width="1898" height="1148" alt="image" src="https://github.com/user-attachments/assets/a3600e64-80d9-4076-bffa-8d1ceccbeeec" />


---

## 🔒 Security Features

- JWT Authentication
- Password Encryption
- Route Protection Middleware
- Environment Variable Configuration
- Secure MongoDB Connection

---

## 🎯 Future Enhancements

- Ticket Assignment System
- Email Notifications
- Admin Dashboard
- SLA Tracking
- Customer Portal
- File Attachments
- AI-powered Ticket Categorization
- Role-Based Permissions

---

## 👩‍💻 Author

### Sharvari More

B.E. Computer Engineering | CGPA: 9.54

- GitHub: https://github.com/Sharvari-21

---
