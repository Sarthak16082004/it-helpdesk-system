# Database Design - Entity Relationship Diagram

## Overview

The IT Helpdesk Ticket Management System uses a relational database design with three core tables that work together to manage ticket lifecycle, track changes, and handle admin authentication.

## Database Schema: `helpdesk_db`

### Visual ER Representation

```
┌──────────────────────────────────────────────────────────────────────┐
│                            TICKETS (Main Entity)                      │
├──────────────────────────────────────────────────────────────────────┤
│ PK: ticket_id (INT, AUTO_INCREMENT)                                  │
│                                                                        │
│ User Information:                                                      │
│   - user_name (VARCHAR 100)                                           │
│   - user_email (VARCHAR 150)                                          │
│   - user_phone (VARCHAR 15)                                           │
│   - department (VARCHAR 100)                                          │
│                                                                        │
│ Ticket Details:                                                        │
│   - issue_category (VARCHAR 50)                                       │
│   - priority (VARCHAR 20) [High/Medium/Low]                           │
│   - subject (VARCHAR 200)                                             │
│   - description (TEXT)                                                │
│   - status (VARCHAR 30) [Open/In Progress/Resolved]                   │
│                                                                        │
│ Metadata:                                                              │
│   - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)                 │
│   - updated_at (TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP)               │
│   - resolved_at (TIMESTAMP, NULL)                                     │
│   - assigned_to (VARCHAR 100, DEFAULT 'Unassigned')                   │
│   - resolution_notes (TEXT)                                           │
│                                                                        │
│ Indexes: status, priority, category, created_at, email                │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N (One ticket → Many history entries)
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       TICKET_HISTORY (Child Entity)                   │
├──────────────────────────────────────────────────────────────────────┤
│ PK: history_id (INT, AUTO_INCREMENT)                                 │
│ FK: ticket_id (INT) → TICKETS.ticket_id                              │
│                                                                        │
│ Change Tracking:                                                       │
│   - changed_by (VARCHAR 100)                                          │
│   - old_status (VARCHAR 30)                                           │
│   - new_status (VARCHAR 30)                                           │
│   - change_description (TEXT)                                         │
│   - changed_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)                 │
│                                                                        │
│ Foreign Key Constraint:                                                │
│   ON DELETE CASCADE (Delete history when ticket is deleted)           │
│   ON UPDATE CASCADE (Update history when ticket_id changes)           │
│                                                                        │
│ Indexes: ticket_id, changed_at                                        │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                      ADMIN_USERS (Independent Entity)                 │
├──────────────────────────────────────────────────────────────────────┤
│ PK: admin_id (INT, AUTO_INCREMENT)                                   │
│                                                                        │
│ Authentication:                                                        │
│   - username (VARCHAR 50, UNIQUE)                                     │
│   - password_hash (VARCHAR 255)                                       │
│                                                                        │
│ Profile:                                                               │
│   - full_name (VARCHAR 100)                                           │
│   - email (VARCHAR 150)                                               │
│   - role (VARCHAR 50, DEFAULT 'Support Agent')                        │
│                                                                        │
│ Status:                                                                │
│   - is_active (BOOLEAN, DEFAULT TRUE)                                 │
│   - created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)                 │
│   - last_login (TIMESTAMP, NULL)                                      │
│                                                                        │
│ Index: username                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Relationships Explained

### 1. TICKETS ↔ TICKET_HISTORY (One-to-Many)

**Relationship Type:** One-to-Many (1:N)

**Description:** Each ticket can have multiple history entries tracking all status changes.

**Cardinality:**
- One TICKETS record → Zero or Many TICKET_HISTORY records
- One TICKET_HISTORY record → Exactly One TICKETS record

**Foreign Key:** 
- `ticket_history.ticket_id` references `tickets.ticket_id`
- Cascade delete: When a ticket is deleted, all its history is also deleted
- Cascade update: When ticket_id changes, history records are updated

**Use Case:**
- Track complete audit trail of ticket status changes
- Know who changed status and when
- Maintain accountability and transparency

**Example:**
```
Ticket #1001 → History Entry #1: "Open" → "In Progress" by admin (2024-01-15)
            → History Entry #2: "In Progress" → "Resolved" by admin (2024-01-16)
```

### 2. ADMIN_USERS (Independent)

**Relationship Type:** Independent entity

**Description:** Admin users table is independent and doesn't have direct foreign key relationships with tickets. The relationship is implicit through the `changed_by` field in TICKET_HISTORY and `assigned_to` in TICKETS.

**Indirect Relationships:**
- `tickets.assigned_to` can contain admin username (loose coupling)
- `ticket_history.changed_by` stores admin username who made changes

**Design Rationale:**
- Loose coupling allows flexibility
- Can delete admin users without affecting historical data
- Username stored as string for audit trail preservation

## Field-Level Details

### TICKETS Table

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| ticket_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_name | VARCHAR(100) | NOT NULL | Name of person reporting issue |
| user_email | VARCHAR(150) | NOT NULL, INDEXED | Contact email for updates |
| user_phone | VARCHAR(15) | NULL | Optional contact number |
| department | VARCHAR(100) | NULL | User's department |
| issue_category | VARCHAR(50) | NOT NULL, INDEXED | Type of issue (Hardware/Software/etc) |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'Medium', INDEXED | Urgency level |
| subject | VARCHAR(200) | NOT NULL | Brief description |
| description | TEXT | NOT NULL | Detailed problem description |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'Open', INDEXED | Current ticket status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ticket creation time |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last modification time |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |
| assigned_to | VARCHAR(100) | DEFAULT 'Unassigned' | Assigned support agent |
| resolution_notes | TEXT | NULL | Solution/notes from admin |

### TICKET_HISTORY Table

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| history_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique history entry ID |
| ticket_id | INT | FOREIGN KEY, NOT NULL, INDEXED | References parent ticket |
| changed_by | VARCHAR(100) | NOT NULL | Username who made change |
| old_status | VARCHAR(30) | NULL | Previous status value |
| new_status | VARCHAR(30) | NULL | New status value |
| change_description | TEXT | NULL | Description of change made |
| changed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, INDEXED | When change occurred |

### ADMIN_USERS Table

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| admin_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique admin identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL, INDEXED | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| full_name | VARCHAR(100) | NOT NULL | Admin's full name |
| email | VARCHAR(150) | NOT NULL | Admin contact email |
| role | VARCHAR(50) | DEFAULT 'Support Agent' | Admin role/designation |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| last_login | TIMESTAMP | NULL | Last successful login |

## Database Views

### v_open_tickets
**Purpose:** Quick access to unresolved tickets with calculated aging

```sql
SELECT ticket_id, user_name, user_email, issue_category, 
       priority, subject, status, created_at,
       TIMESTAMPDIFF(HOUR, created_at, NOW()) AS hours_open
FROM tickets
WHERE status != 'Resolved'
```

### v_priority_summary
**Purpose:** Dashboard statistics by priority level

```sql
SELECT priority,
       COUNT(*) AS ticket_count,
       SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_count,
       SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
       SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count
FROM tickets
GROUP BY priority
```

## Stored Procedures

### update_ticket_status
**Purpose:** Atomically update ticket status and log to history

**Parameters:**
- `p_ticket_id` (INT): Ticket to update
- `p_new_status` (VARCHAR): New status value
- `p_changed_by` (VARCHAR): Admin username
- `p_resolution_notes` (TEXT): Optional resolution notes

**Logic:**
1. Fetch current status from TICKETS
2. Update TICKETS table with new status
3. Set resolved_at if status is 'Resolved'
4. Insert audit entry into TICKET_HISTORY
5. All operations wrapped in single transaction

## Normalization & Design Principles

### Normalization Level: 3NF (Third Normal Form)

**1NF Compliance:**
- All tables have primary keys
- All columns contain atomic values
- No repeating groups

**2NF Compliance:**
- No partial dependencies (all non-key columns depend on entire primary key)

**3NF Compliance:**
- No transitive dependencies
- All non-key columns depend only on primary key

### Design Decisions:

**Denormalization for Performance:**
- User information (name, email) stored in TICKETS table rather than separate USER table
- Reason: Most users are external, one-time reporters; no need for user management
- Benefit: Faster queries, simpler joins

**History as Separate Table:**
- Maintains clean audit trail
- Prevents TICKETS table from growing too large
- Allows efficient querying of change history

**Status as String (not enum):**
- More flexible for future status additions
- Easier to extend without schema changes
- Trade-off: Slightly less storage efficient

## Indexes Strategy

**Purpose of Indexes:**
- Speed up frequently queried columns
- Optimize filtering and sorting operations

**Indexed Columns:**
1. `tickets.status` - Frequently filtered in dashboard
2. `tickets.priority` - Used in priority-based queries
3. `tickets.issue_category` - Category filtering
4. `tickets.created_at` - Date range queries
5. `tickets.user_email` - Email lookup
6. `ticket_history.ticket_id` - JOIN operations
7. `ticket_history.changed_at` - Chronological queries
8. `admin_users.username` - Login authentication

## Scalability Considerations

**Current Design:** Supports up to 100,000+ tickets efficiently

**Future Enhancements:**
1. **Partitioning:** Partition TICKETS table by year/month
2. **Archiving:** Move resolved tickets older than 1 year to archive table
3. **Read Replicas:** Use MySQL replication for dashboard queries
4. **Caching:** Implement Redis for frequently accessed data

---

## Interview Talking Points

When explaining this database design in interviews:

1. **Start with business requirements:** "The system needs to track support tickets from creation to resolution"

2. **Explain core entities:** "We have three main entities: Tickets (the core data), History (audit trail), and Admin Users (access control)"

3. **Justify relationships:** "The one-to-many relationship between Tickets and History allows complete audit transparency"

4. **Discuss normalization:** "I normalized to 3NF but chose to denormalize user information for performance"

5. **Highlight scalability:** "The indexing strategy ensures fast queries even with thousands of tickets"

6. **Mention constraints:** "Foreign key constraints with CASCADE ensure data integrity when tickets are deleted"