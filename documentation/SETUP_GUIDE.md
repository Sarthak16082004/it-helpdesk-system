# IT Helpdesk System - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **MySQL 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/)
- **pip** (Python package manager - comes with Python)
- **Git** (optional, for version control)

## Step-by-Step Installation

### Step 1: Download/Clone the Project

```bash
# If using Git
git clone https://github.com/yourusername/helpdesk-system.git
cd helpdesk-system

# OR simply extract the ZIP file to a folder
```

### Step 2: Set Up MySQL Database

1. **Open MySQL Command Line Client** or **MySQL Workbench**

2. **Log in to MySQL:**
   ```bash
   mysql -u root -p
   ```
   Enter your MySQL root password.

3. **Run the database schema:**
   ```sql
   source /path/to/database/schema.sql
   ```
   
   OR copy-paste the contents of `database/schema.sql` into MySQL Workbench and execute.

4. **Verify database creation:**
   ```sql
   SHOW DATABASES;
   USE helpdesk_db;
   SHOW TABLES;
   ```
   
   You should see: `tickets`, `ticket_history`, `admin_users`

### Step 3: Configure Database Connection

1. Open `app.py` in a text editor

2. Find the `DB_CONFIG` section (around line 25):
   ```python
   DB_CONFIG = {
       'host': 'localhost',
       'user': 'root',           # Change to your MySQL username
       'password': '',            # Change to your MySQL password
       'database': 'helpdesk_db',
       'charset': 'utf8mb4',
       'collation': 'utf8mb4_unicode_ci'
   }
   ```

3. **Update the credentials:**
   - `user`: Your MySQL username (default: `root`)
   - `password`: Your MySQL password (if you set one during MySQL installation)

### Step 4: Install Python Dependencies

1. **Open Command Prompt/Terminal** in the project folder

2. **(Recommended) Create a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

   This will install:
   - Flask (Web framework)
   - Flask-CORS (Cross-origin requests)
   - mysql-connector-python (Database connector)
   - Werkzeug (Utilities)

### Step 5: Run the Application

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **You should see:**
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```

3. **Open your web browser and visit:**
   - User Interface: `http://localhost:5000`
   - Admin Login: `http://localhost:5000/admin/login`

### Step 6: Test the System

#### Test User Flow:
1. Go to `http://localhost:5000`
2. Fill out the ticket form with test data
3. Submit the ticket
4. Note the Ticket ID on the success page

#### Test Admin Flow:
1. Go to `http://localhost:5000/admin/login`
2. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. View all tickets in the dashboard
4. Click "View Details" on a ticket
5. Update the ticket status
6. Test filters and search functionality

## Common Issues and Solutions

### Issue 1: "ModuleNotFoundError: No module named 'flask'"
**Solution:** Make sure you've activated your virtual environment and run `pip install -r requirements.txt`

### Issue 2: "Can't connect to MySQL server"
**Solution:** 
- Check if MySQL service is running
- Verify your database credentials in `app.py`
- Ensure `helpdesk_db` database exists

### Issue 3: "Port 5000 is already in use"
**Solution:** 
- Change the port in `app.py` (last line):
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)  # Changed to 5001
  ```

### Issue 4: "Access denied for user 'root'@'localhost'"
**Solution:** 
- Reset your MySQL root password
- Or create a new MySQL user with appropriate privileges

### Issue 5: Static files (CSS/JS) not loading
**Solution:**
- Ensure the folder structure is correct
- Try clearing browser cache (Ctrl+Shift+R)
- Check console for 404 errors

## Production Deployment Considerations

### Security Updates (IMPORTANT for Production):

1. **Change the secret key** in `app.py`:
   ```python
   app.secret_key = 'generate-a-secure-random-key-here'
   ```

2. **Update admin password:**
   - Remove the default admin user from `schema.sql`
   - Use proper password hashing (bcrypt or werkzeug.security)

3. **Database security:**
   - Create a dedicated database user (not root)
   - Use strong passwords
   - Enable SSL for database connections

4. **Set DEBUG to False:**
   ```python
   app.run(debug=False, host='0.0.0.0', port=5000)
   ```

5. **Use environment variables** for sensitive data:
   ```python
   import os
   DB_PASSWORD = os.environ.get('DB_PASSWORD')
   ```

### Hosting Options:

1. **Local Network:**
   - Keep running on localhost:5000
   - Access from other devices on same network

2. **Cloud Hosting:**
   - **Heroku** (Free tier available)
   - **PythonAnywhere** (Free tier available)
   - **AWS EC2**
   - **DigitalOcean**
   - **Google Cloud Platform**

3. **Recommended Stack:**
   - **Web Server:** Nginx or Apache
   - **WSGI Server:** Gunicorn
   - **Database:** MySQL on same server or RDS
   - **HTTPS:** Let's Encrypt SSL certificate

## Testing the System

### Manual Testing Checklist:

**User Side:**
- [ ] Form validation works (required fields)
- [ ] Email validation
- [ ] Ticket submission successful
- [ ] Success page displays correct ticket ID
- [ ] Form reset button works

**Admin Side:**
- [ ] Login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Dashboard loads all tickets
- [ ] Statistics cards show correct counts
- [ ] Status filter works
- [ ] Priority filter works
- [ ] Search functionality works
- [ ] View ticket details modal
- [ ] Update ticket status
- [ ] Logout functionality

## Project Structure Overview

```
helpdesk-system/
├── app.py                      # Main Flask application
├── config.py                   # Configuration settings
├── requirements.txt            # Python dependencies
│
├── database/
│   ├── schema.sql             # Database creation script
│   └── sample_data.sql        # Test data (optional)
│
├── static/
│   ├── css/
│   │   ├── style.css          # User interface styles
│   │   └── admin.css          # Admin dashboard styles
│   └── js/
│       ├── user.js            # User interface logic
│       └── admin.js           # Admin dashboard logic
│
├── templates/
│   ├── base.html              # Base template (if needed)
│   ├── index.html             # User ticket form
│   ├── success.html           # Success confirmation
│   ├── login.html             # Admin login
│   └── admin.html             # Admin dashboard
│
└── documentation/
    ├── SETUP_GUIDE.md         # This file
    ├── ER_DIAGRAM.md          # Database design
    ├── RESUME_DESCRIPTION.md  # Project description for resume
    └── INTERVIEW_PREP.md      # Interview Q&A
```

## Next Steps

1. **Customize the system:**
   - Add your company logo
   - Change color scheme
   - Add more ticket categories

2. **Enhance features:**
   - Email notifications
   - File attachments
   - Ticket assignment to specific agents
   - SLA tracking
   - Reports and analytics

3. **Learn and document:**
   - Study each file to understand the code
   - Add comments
   - Create user manual
   - Document any changes you make

## Support

For issues, questions, or improvements:
- Check the documentation files
- Review the code comments
- Test with sample data
- Debug using Flask's debug mode

## Success Indicators

You'll know the setup is successful when:
- ✅ No errors when running `python app.py`
- ✅ Can access the homepage at localhost:5000
- ✅ Can submit a ticket successfully
- ✅ Can login to admin panel
- ✅ Can view and update tickets in admin dashboard
- ✅ Database tables are populated with ticket data

---

**Congratulations!** Your IT Helpdesk System is now ready to use and showcase to recruiters.