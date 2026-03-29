<div align="center">

![Smart Campus Banner](./banner.png)

# 🎓 Smart Campus Operations Hub

### **Premium Full-Stack University Operations Ecosystem**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

A sophisticated, full-stack university operations system designed to streamline faculty management, resource bookings, maintenance reporting, and real-time communications. Built with a premium **Professional Glassmorphic** UI and a robust, secure Spring Boot backend to deliver a world-class campus experience.

[**Features**](#-features) • [**Tech Stack**](#-tech-stack) • [**Architecture**](#-system-architecture) • [**API Reference**](#-rest-api-reference) • [**Quick Start**](#-quick-start)

</div>

---

## ✨ Features

### 🎯 Core Operational Modules
| Module | Description |
|:---|:---|
| **🏢 Facilities Catalogue** | Advanced searchable database of halls, labs, and equipment with real-time availability status |
| **📅 Booking Engine** | Intelligent request-approval workflow featuring automated conflict prevention and multi-tier scheduling |
| **🛠️ Incident Ticketing** | High-fidelity maintenance reporting with multi-attachment support, technician assignment, and live commenting |
| **🔐 Role-Based Access** | Precision granular controls (RBAC) specifically tailored for Users, Admins, and Technicians |
| **🛡️ Modern Security** | Enterprise-grade JWT authentication seamlessly integrated with Google OAuth2 for frictionless login |
| **🔔 Real-Time Alerts** | Persistent per-user notification system for immediate booking status updates and ticket progress alerts |

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User/Admin/Tech))
    subgraph "🎨 Frontend (React + Vite)"
        UI[Tailwind UI]
        State[Redux / Hooks]
        API_Call[Axios Interceptors]
    end
    subgraph "⚙️ Backend (Spring Boot)"
        Security[Spring Security / JWT / OAuth2]
        Controller[REST Controllers]
        Service[Business Logic / Services]
        Repo[MongoDB Repositories]
    end
    DB[(MongoDB Atlas)]
    GoogleAuth[Google OAuth2 Provider]

    User <--> UI
    UI <--> State
    State <--> API_Call
    API_Call <--> Security
    Security <--> Controller
    Controller <--> Service
    Service <--> Repo
    Repo <--> DB
    Security <--> GoogleAuth
```

---

## 🛠️ Tech Stack

### Frontend & UI
| Technology | Purpose |
|:---|:---|
| **React 18** | High-Performance SPA & Component-based UI |
| **Vite** | Modern, Ultra-Fast Build Tooling |
| **Tailwind CSS** | Premium Utility-First Responsive Styling |
| **Redux Toolkit** | Centralized Application State Management |

### Backend & Database
| Technology | Purpose |
|:---|:---|
| **Java 21** | Modern, Type-Safe Enterprise Language |
| **Spring Boot 3.4** | Robust Microservice-Ready Core Framework |
| **MongoDB Atlas** | Scalable, Document-Oriented Cloud Database |
| **Spring Security** | JWT & OAuth 2.0 Identity Governance |
| **Swagger / OpenAPI 3.0** | Interactive API Documentation |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| **Resources** | | | |
| `GET` | `/api/v1/resources` | List/Filter all campus resources | ALL |
| `POST` | `/api/v1/resources` | Create a new bookable resource | ADMIN |
| `PUT` | `/api/v1/resources/{id}` | Update resource details | ADMIN |
| **Bookings** | | | |
| `POST` | `/api/v1/bookings` | Request a new resource booking | USER, ADMIN |
| `PATCH` | `/api/v1/bookings/{id}/approve` | Approve a booking request | ADMIN |
| **Tickets** | | | |
| `POST` | `/api/v1/tickets` | Report an incident (with image upload) | USER, ADMIN |
| `PATCH` | `/api/v1/tickets/{id}/status` | Update progress (e.g. RESOLVED) | ADMIN, TECH |
| **Profile** | | | |
| `GET` | `/api/v1/profile/me` | Fetch detailed user profile | ALL |

> [!NOTE]
> For a full list of over 40+ endpoints, see the [Postman Collection](file:///c:/Users/hp/Desktop/PAF/smart-campus-operations-hub/docs/smart_campus_api.postman_collection.json).

---

## 🚀 Quick Start

### 1️⃣ Backend Setup
```bash
# Configure .env from backend/.env.example
cd backend
mvn spring-boot:run
```

### 2️⃣ Frontend Setup
```bash
# Configure .env from frontend/.env.example
cd frontend
npm install
npm run dev
```

---

## 📜 Documentation
- **Technical Blueprint**: [PROJECT_BLUEPRINT.md](https://github.com/Senthazhan/smart-campus-operations-hub-Final-PAF/blob/main/docs/PROJECT_BLUEPRINT.md)
- **Postman Collection**: [Postman JSON](https://github.com/Senthazhan/smart-campus-operations-hub-Final-PAF/blob/main/docs/smart_campus_api.postman_collection.json)

---

<div align="center">

### Revolutionizing Campus Operations 🚀

**Smart Campus Operations Hub — 2026**

Constructed with Java, React, and Open Governance

</div>
