# SRATS - Smart Real-Time Attendance Tracking System 🎓📱

**SRATS** is a modern, high-security attendance management system designed for educational institutions. It eliminates proxy attendance by combining **Dynamic QR Code Scanning** with **GPS-based Geofencing**, ensuring students are physically present in the classroom when marking attendance.

---

## 🚀 Key Features

### 👨‍🏫 For Teachers
- **Start Sessions**: Generate dynamic QR codes for specific subjects.
- **Geofencing**: Set a custom radius (e.g., 50m) to restrict attendance marking to the classroom location.
- **Live Tracking**: View attendance marking in real-time as students scan.
- **Reporting**: Export attendance records and "Defaulter Lists" (below 75%) directly to **Excel (XLSX)**.

### 👨‍🎓 For Students
- **Google Login**: One-tap secure authentication using institutional Google accounts.
- **QR Scanner**: Built-in scanner to mark attendance quickly.
- **Attendance Ledger**: View personal attendance history and percentage per subject.

### 🛡️ For Admins
- **User Management**: Manage faculty and student records.
- **Analytics Dashboard**: Visual representation of attendance trends across departments.
- **Audit Logs**: Track session history and system health.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Premium Academic UI)
- **Icons**: Lucide React
- **Visualization**: Recharts
- **Auth**: Google OAuth 2.0 (`@react-oauth/google`)

### Backend
- **Framework**: Spring Boot 2.7.18 (Java 8)
- **Database**: H2 (Development) / MySQL (Production)
- **Security**: Spring Security + JWT
- **Report Engine**: Apache POI (Excel generation)
- **Networking**: Ngrok integration for mobile accessibility

---

## 📂 Project Structure

```text
MajorProject/
├── backend/            # Spring Boot Application
│   ├── src/            # Java source code
│   ├── pom.xml         # Maven dependencies
│   └── data/           # Local H2 database storage
├── frontend/           # React Application
│   ├── src/            # Components & Pages
│   ├── package.json    # React dependencies
│   └── vite.config.js  # Vite configuration
├── start_all.bat       # Automation script to launch full stack
└── README.md           # You are here
