-- ================================================================
-- IT HELPDESK TICKET MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ================================================================
-- Database: helpdesk_db
-- Purpose: Store ticket information, user details, and ticket history
-- ================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

-- ================================================================
-- TABLE: tickets
-- Purpose: Core table storing all helpdesk tickets
-- ================================================================
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User Information
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    user_phone VARCHAR(15),
    department VARCHAR(100),
    
    -- Ticket Details
    issue_category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Status Tracking
    status VARCHAR(30) NOT NULL DEFAULT 'Open',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Additional Fields
    assigned_to VARCHAR(100) DEFAULT 'Unassigned',
    resolution_notes TEXT,
    
    -- Indexes for faster queries
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (issue_category),
    INDEX idx_created (created_at),
    INDEX idx_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLE: ticket_history
-- Purpose: Track all status changes and updates to tickets
-- ================================================================
CREATE TABLE IF NOT EXISTS ticket_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    
    -- Change Information
    changed_by VARCHAR(100) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    change_description TEXT,
    
    -- Timestamp
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Index
    INDEX idx_ticket (ticket_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLE: admin_users
-- Purpose: Store admin/support agent credentials
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'Support Agent',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- INSERT DEFAULT ADMIN USER
-- Username: admin
-- Password: admin123 (Change this in production!)
-- ================================================================
INSERT INTO admin_users (username, password_hash, full_name, email, role) 
VALUES (
    'admin', 
    'pbkdf2:sha256:600000$8ZR3kF2m$eb33fe831c4a9e9b8c6f4c9bb8c7e2a1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    'System Administrator',
    'admin@helpdesk.com',
    'Administrator'
);

-- ================================================================
-- VIEWS FOR REPORTING
-- ================================================================

-- View: Open tickets summary
CREATE OR REPLACE VIEW v_open_tickets AS
SELECT 
    ticket_id,
    user_name,
    user_email,
    issue_category,
    priority,
    subject,
    status,
    created_at,
    TIMESTAMPDIFF(HOUR, created_at, NOW()) AS hours_open
FROM tickets
WHERE status != 'Resolved';

-- View: Tickets by priority
CREATE OR REPLACE VIEW v_priority_summary AS
SELECT 
    priority,
    COUNT(*) AS ticket_count,
    SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_count,
    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count
FROM tickets
GROUP BY priority;

-- ================================================================
-- STORED PROCEDURES
-- ================================================================

-- Procedure: Update ticket status with history logging
DELIMITER //
CREATE PROCEDURE update_ticket_status(
    IN p_ticket_id INT,
    IN p_new_status VARCHAR(30),
    IN p_changed_by VARCHAR(100),
    IN p_resolution_notes TEXT
)
BEGIN
    DECLARE v_old_status VARCHAR(30);
    
    -- Get current status
    SELECT status INTO v_old_status 
    FROM tickets 
    WHERE ticket_id = p_ticket_id;
    
    -- Update ticket
    UPDATE tickets 
    SET 
        status = p_new_status,
        resolution_notes = COALESCE(p_resolution_notes, resolution_notes),
        resolved_at = CASE WHEN p_new_status = 'Resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
    WHERE ticket_id = p_ticket_id;
    
    -- Log to history
    INSERT INTO ticket_history (ticket_id, changed_by, old_status, new_status, change_description)
    VALUES (p_ticket_id, p_changed_by, v_old_status, p_new_status, 
            CONCAT('Status changed from ', v_old_status, ' to ', p_new_status));
END //
DELIMITER ;

-- ================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ================================================================
-- You can run sample_data.sql separately for test tickets