"""
================================================================
IT HELPDESK TICKET MANAGEMENT SYSTEM - FLASK BACKEND
================================================================
Enterprise-grade helpdesk system with RESTful API architecture
Author: Your Name
Purpose: Manage IT support tickets with status tracking
================================================================
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
import hashlib
import os
from functools import wraps

# ================================================================
# APPLICATION CONFIGURATION
# ================================================================
app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production-2024'  # Change this!
CORS(app)

# ================================================================
# DATABASE CONFIGURATION
# ================================================================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',           # Change to your MySQL username
    'password': 'sarthak12',            # Change to your MySQL password
    'database': 'helpdesk_db',
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

# ================================================================
# DATABASE CONNECTION HELPER
# ================================================================
def get_db_connection():
    """
    Establishes connection to MySQL database
    Returns: MySQL connection object or None if failed
    """
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Database connection error: {e}")
        return None

# ================================================================
# AUTHENTICATION DECORATOR
# ================================================================
def login_required(f):
    """
    Decorator to protect admin routes
    Redirects to login if user not authenticated
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

# ================================================================
# USER ROUTES
# ================================================================

@app.route('/')
def index():
    """
    Homepage - User ticket submission form
    """
    return render_template('index.html')

@app.route('/submit-ticket', methods=['POST'])
def submit_ticket():
    """
    API endpoint to create new helpdesk ticket
    Accepts: JSON with ticket details
    Returns: JSON with ticket_id and success status
    """
    try:
        # Get form data
        data = request.get_json()
        print("Received data:", data)  # Debug log
        
        # Validate required fields
        required_fields = ['user_name', 'user_email', 'issue_category', 
                          'priority', 'subject', 'description']
        
        for field in required_fields:
            if not data.get(field):
                print(f"Missing field: {field}")  # Debug log
                return jsonify({
                    'success': False, 
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Connect to database
        connection = get_db_connection()
        if not connection:
            print("Database connection failed")  # Debug log
            return jsonify({
                'success': False, 
                'error': 'Database connection failed'
            }), 500
        
        cursor = connection.cursor()
        
        # Insert ticket into database
        insert_query = """
            INSERT INTO tickets 
            (user_name, user_email, user_phone, department, 
             issue_category, priority, subject, description, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Open')
        """
        
        values = (
            data['user_name'],
            data['user_email'],
            data.get('user_phone', ''),
            data.get('department', ''),
            data['issue_category'],
            data['priority'],
            data['subject'],
            data['description']
        )
        
        print(f"Executing insert with values: {values}")  # Debug log
        
        cursor.execute(insert_query, values)
        connection.commit()
        
        # Get the generated ticket ID
        ticket_id = cursor.lastrowid
        print(f"Ticket created with ID: {ticket_id}")  # Debug log
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'ticket_id': ticket_id,
            'message': 'Ticket created successfully'
        }), 201
        
    except Error as e:
        print(f"Database error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Database error: {str(e)}'
        }), 500
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/success')
def success():
    """
    Success page after ticket submission
    """
    ticket_id = request.args.get('ticket_id', 'N/A')
    return render_template('success.html', ticket_id=ticket_id)

# ================================================================
# ADMIN ROUTES
# ================================================================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """
    Admin login page and authentication
    Default credentials: admin / admin123
    """
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Simple authentication (use proper hashing in production)
        if username == 'admin' and password == 'admin123':
            session['admin_logged_in'] = True
            session['admin_username'] = username
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/admin/logout')
def admin_logout():
    """
    Admin logout - clears session
    """
    session.clear()
    return redirect(url_for('admin_login'))

@app.route('/admin')
@login_required
def admin_dashboard():
    """
    Admin dashboard - displays all tickets
    """
    return render_template('admin.html')

@app.route('/api/tickets', methods=['GET'])
@login_required
def get_tickets():
    """
    API endpoint to fetch all tickets with filters
    Query params: status, priority, search
    Returns: JSON array of tickets
    """
    try:
        # Get filter parameters
        status_filter = request.args.get('status', 'all')
        priority_filter = request.args.get('priority', 'all')
        search_query = request.args.get('search', '')
        
        connection = get_db_connection()
        if not connection:
            print("ERROR: Could not connect to database")
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Build dynamic query
        query = "SELECT * FROM tickets WHERE 1=1"
        params = []
        
        if status_filter != 'all':
            query += " AND status = %s"
            params.append(status_filter)
        
        if priority_filter != 'all':
            query += " AND priority = %s"
            params.append(priority_filter)
        
        if search_query:
            query += " AND (ticket_id LIKE %s OR issue_category LIKE %s OR subject LIKE %s)"
            search_param = f"%{search_query}%"
            params.extend([search_param, search_param, search_param])
        
        query += " ORDER BY created_at DESC"
        
        print(f"Executing query: {query}")
        print(f"With params: {params}")
        
        cursor.execute(query, params)
        tickets = cursor.fetchall()
        
        print(f"Found {len(tickets)} tickets")
        
        # Convert datetime objects to strings
        for ticket in tickets:
            if ticket.get('created_at'):
                ticket['created_at'] = ticket['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if ticket.get('updated_at'):
                ticket['updated_at'] = ticket['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
            if ticket.get('resolved_at') and ticket['resolved_at']:
                ticket['resolved_at'] = ticket['resolved_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'tickets': tickets}), 200
        
    except Error as e:
        print(f"Database Error fetching tickets: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        print(f"Error fetching tickets: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@app.route('/api/tickets/<int:ticket_id>/status', methods=['PUT'])
@login_required
def update_ticket_status(ticket_id):
    """
    API endpoint to update ticket status
    Accepts: JSON with new status and optional notes
    Returns: JSON success response
    """
    try:
        data = request.get_json()
        new_status = data.get('status')
        resolution_notes = data.get('resolution_notes', '')
        
        if not new_status:
            return jsonify({'success': False, 'error': 'Status required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'error': 'Database error'}), 500
        
        cursor = connection.cursor()
        
        # Update ticket status
        update_query = """
            UPDATE tickets 
            SET status = %s, 
                resolution_notes = %s,
                resolved_at = CASE WHEN %s = 'Resolved' THEN NOW() ELSE resolved_at END,
                updated_at = NOW()
            WHERE ticket_id = %s
        """
        
        cursor.execute(update_query, (new_status, resolution_notes, new_status, ticket_id))
        connection.commit()
        
        # Log to history
        history_query = """
            INSERT INTO ticket_history (ticket_id, changed_by, new_status, change_description)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(history_query, (
            ticket_id, 
            session.get('admin_username', 'admin'),
            new_status,
            f"Status updated to {new_status}"
        ))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Status updated'}), 200
        
    except Exception as e:
        print(f"Error updating status: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard-stats', methods=['GET'])
@login_required
def dashboard_stats():
    """
    API endpoint for dashboard statistics
    Returns: JSON with ticket counts by status and priority
    """
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'error': 'Database error'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get status counts with COALESCE to handle NULL values
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END), 0) as open,
                COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) as in_progress,
                COALESCE(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END), 0) as resolved,
                COALESCE(SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END), 0) as `high_priority`
            FROM tickets
        """)
        
        stats = cursor.fetchone()
        
        # Ensure all values are integers, not None
        if stats:
            stats = {
                'total': int(stats['total']) if stats['total'] else 0,
                'open': int(stats['open']) if stats['open'] else 0,
                'in_progress': int(stats['in_progress']) if stats['in_progress'] else 0,
                'resolved': int(stats['resolved']) if stats['resolved'] else 0,
                'high_priority': int(stats['high_priority']) if stats['high_priority'] else 0
            }
        else:
            stats = {
                'total': 0,
                'open': 0,
                'in_progress': 0,
                'resolved': 0,
                'high_priority': 0
            }
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'stats': stats}), 200
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ================================================================
# ERROR HANDLERS
# ================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ================================================================
# RUN APPLICATION
# ================================================================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)