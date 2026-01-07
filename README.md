# 🎫 IT Helpdesk Ticket Management System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A professional, production-ready IT helpdesk ticketing system for managing support requests from submission to resolution.

![Project Banner](screenshots/banner.png)

## 🌟 Overview

An enterprise-grade helpdesk ticket management system that streamlines IT support operations. Built with modern web technologies, this full-stack application demonstrates professional software development practices including RESTful API design, database normalization, secure authentication, and responsive UI/UX.

**Live Demo:** [View Demo](your-demo-link) | **Video Walkthrough:** [Watch on YouTube](your-video-link)

---

## ✨ Features

### 👥 User Portal
- ✅ Clean, intuitive ticket submission form
- ✅ Real-time form validation
- ✅ Multiple issue categories (Hardware, Software, Network, etc.)
- ✅ Priority level selection (High, Medium, Low)
- ✅ Instant ticket ID generation
- ✅ Email confirmation display
- ✅ Fully responsive design

### 🛠️ Admin Dashboard
- ✅ Comprehensive ticket management interface
- ✅ Real-time statistics dashboard (Total, Open, In Progress, Resolved)
- ✅ Advanced filtering by status and priority
- ✅ Global search across tickets
- ✅ One-click status updates
- ✅ Detailed ticket view modal
- ✅ Complete audit trail
- ✅ Secure session-based authentication

### 🔧 Technical Features
- ✅ RESTful API architecture with 8+ endpoints
- ✅ Normalized MySQL database (3NF)
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS attack prevention
- ✅ Session-based authentication
- ✅ Optimized database queries with strategic indexing
- ✅ Comprehensive error handling
- ✅ Responsive design (mobile-friendly)

---

## 🖼️ Screenshots

### User Ticket Submission
![Ticket Form](screenshots/ticket-form.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Ticket Details
![Ticket Details](screenshots/ticket-modal.png)

---

## 🛠️ Tech Stack

### Backend
- **Python 3.8+** - Core programming language
- **Flask 3.0** - Lightweight web framework
- **MySQL 8.0+** - Relational database
- **mysql-connector-python** - Database driver

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid/Flexbox
- **JavaScript (ES6+)** - Dynamic interactions
- **AJAX** - Asynchronous data fetching

### Architecture
- **RESTful API** - Standardized endpoints
- **MVC Pattern** - Clean separation of concerns
- **3-Tier Architecture** - Presentation, Application, Data layers

---

## 🚀 Quick Start

### Prerequisites
```bash
- Python 3.8 or higher
- MySQL 8.0 or higher
- pip (Python package manager)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/helpdesk-ticket-system.git
cd helpdesk-ticket-system
```

2. **Create virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up MySQL database**
```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source database/schema.sql
```

5. **Configure database connection**

Edit `app.py` (lines 25-32):
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_mysql_password',  # Change this
    'database': 'helpdesk_new',
    'charset': 'utf8mb4'
}
```

6. **Run the application**
```bash
python app.py
```

7. **Access the application**
- User Portal: http://localhost:5000
- Admin Dashboard: http://localhost:5000/admin/login
  - Username: `admin`
  - Password: `admin123`

---

## 📊 Database Schema

### Tables

**tickets** - Main ticket storage
- Primary Key: `ticket_id`
- User info, ticket details, status tracking
- Timestamps: created_at, updated_at, resolved_at

**ticket_history** - Audit trail
- Tracks all status changes
- Foreign Key to tickets (CASCADE)

**admin_users** - Authentication
- Secure password storage
- Role-based access

### Entity Relationship
```
tickets (1) ─────< (N) ticket_history
admin_users (independent)
```

For detailed ER diagram, see [ER_DIAGRAM.md](documentation/ER_DIAGRAM.md)

---

## 🔌 API Endpoints

### User Endpoints

**Submit Ticket**
```http
POST /submit-ticket
Content-Type: application/json

Body: {
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "issue_category": "Hardware",
  "priority": "High",
  "subject": "Laptop issue",
  "description": "Detailed description..."
}

Response: 201 Created
{
  "success": true,
  "ticket_id": 123
}
```

### Admin Endpoints (Authentication Required)

**Get All Tickets**
```http
GET /api/tickets?status=Open&priority=High
Response: 200 OK
{
  "success": true,
  "tickets": [...]
}
```

**Update Ticket Status**
```http
PUT /api/tickets/:id/status
Body: {
  "status": "In Progress",
  "resolution_notes": "Working on it..."
}
```

**Get Dashboard Stats**
```http
GET /api/dashboard-stats
Response: {
  "success": true,
  "stats": {
    "total": 150,
    "open": 45,
    "in_progress": 23,
    "resolved": 82
  }
}
```

---

## 🗂️ Project Structure
```
helpdesk-ticket-system/
├── app.py                      # Flask backend
├── config.py                   # Configuration
├── requirements.txt            # Dependencies
├── database/
│   └── schema.sql             # Database schema
├── static/
│   ├── css/
│   │   ├── style.css          # Main styles
│   │   └── admin.css          # Admin styles
│   └── js/
│       ├── user.js            # User logic
│       └── admin.js           # Admin logic
├── templates/
│   ├── index.html             # User form
│   ├── success.html           # Success page
│   ├── login.html             # Admin login
│   └── admin.html             # Admin dashboard
└── documentation/
    ├── SETUP_GUIDE.md
    ├── ER_DIAGRAM.md
    └── API_DOCS.md
```

---

## 🔒 Security Features

- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **XSS Prevention** - HTML escaping
- ✅ **Session Security** - HTTP-only cookies, CSRF protection
- ✅ **Input Validation** - Frontend and backend validation
- ✅ **Authentication** - Secure session management
- ✅ **Error Handling** - No sensitive data in error messages

---

## 🎯 Key Learnings & Highlights

### Database Design
- Normalized to 3NF for data integrity
- Strategic indexing on frequently queried columns
- Foreign keys with CASCADE operations
- Stored procedures for complex operations

### Backend Development
- RESTful API design principles
- Error handling and logging
- Database connection management
- Session-based authentication

### Frontend Development
- Responsive design without frameworks
- AJAX for asynchronous operations
- Real-time form validation
- Dynamic DOM manipulation

### Software Engineering
- MVC architecture pattern
- Separation of concerns
- Code documentation
- Version control best practices

---

## 🧪 Testing

### Manual Testing Checklist

**User Flow:**
- [ ] Submit ticket with valid data
- [ ] Form validation works
- [ ] Success page displays ticket ID
- [ ] Email validation catches errors

**Admin Flow:**
- [ ] Login with credentials
- [ ] Dashboard loads statistics
- [ ] Tickets display correctly
- [ ] Filters work properly
- [ ] Search functions correctly
- [ ] Status updates work
- [ ] Logout works

---

## 🚀 Future Enhancements

- [ ] Email notifications (SMTP integration)
- [ ] File attachments for tickets
- [ ] Advanced reporting and analytics
- [ ] SLA tracking and alerts
- [ ] Multi-agent assignment
- [ ] Real-time updates (WebSockets)
- [ ] Export tickets to PDF/CSV
- [ ] Dark mode support
- [ ] Mobile app (React Native)

---

## 📈 Performance Optimizations

- Database indexing on frequently queried columns
- Efficient SQL queries with JOINs instead of N+1 queries
- Frontend form validation to reduce server load
- Prepared statements for query optimization
- Connection pooling for database efficiency

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style conventions
- All tests pass
- Documentation is updated
- Commit messages are clear

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Flask documentation and community
- MySQL documentation
- Modern web design inspiration from enterprise SaaS platforms
- Stack Overflow community for troubleshooting help

---

## 📞 Support

If you have questions or need help with setup:
- Open an [Issue](https://github.com/yourusername/helpdesk-ticket-system/issues)
- Check the [Setup Guide](documentation/SETUP_GUIDE.md)
- Review [API Documentation](documentation/API_DOCS.md)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you learn full-stack development!

---

**Built with ❤️ for learning and professional development**

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/helpdesk-ticket-system?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/helpdesk-ticket-system?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/helpdesk-ticket-system)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/helpdesk-ticket-system)
```

---

## 🏷️ GitHub Topics/Tags to Add

Add these topics to your GitHub repository for better discoverability:
```
python
flask
mysql
javascript
html5
css3
rest-api
full-stack
web-development
helpdesk
ticket-management
crud-application
database-design
responsive-design
authentication
session-management
portfolio-project
beginner-friendly
```

---

## 📱 Social Media Description (LinkedIn/Twitter)
```
🎫 Just built an IT Helpdesk Ticket Management System!

✨ Features:
- Flask REST API backend
- MySQL database with normalization
- Admin dashboard with real-time stats
- Secure authentication
- Responsive UI

Perfect project for learning full-stack development!

🔗 GitHub: [link]
💻 Tech: Python, Flask, MySQL, JavaScript

#Python #Flask #MySQL #WebDevelopment #FullStack #Portfolio
