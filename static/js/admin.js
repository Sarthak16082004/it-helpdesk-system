/**
 * ================================================================
 * IT HELPDESK - ADMIN DASHBOARD LOGIC
 * ================================================================
 * Handles ticket management, filtering, and status updates
 * ================================================================
 */

// Global state
let allTickets = [];
let currentFilters = {
    status: 'all',
    priority: 'all',
    search: ''
};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
});

/**
 * Setup event listeners for filters
 */
function setupEventListeners() {
    // Filter change listeners
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('priorityFilter').addEventListener('change', applyFilters);
    
    // Search with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 500);
    });
    
    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('ticketModal');
        if (event.target === modal) {
            closeModal();
        }
    };
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
    try {
        // Load statistics
        await loadStats();
        
        // Load tickets
        await loadTickets();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

/**
 * Load dashboard statistics
 */
async function loadStats() {
    try {
        const response = await fetch('/api/dashboard-stats');
        const data = await response.json();
        
        console.log('Stats response:', data); // Debug log
        
        if (data.success && data.stats) {
            document.getElementById('totalTickets').textContent = data.stats.total || 0;
            document.getElementById('openTickets').textContent = data.stats.open || 0;
            document.getElementById('inProgressTickets').textContent = data.stats.in_progress || 0;
            document.getElementById('resolvedTickets').textContent = data.stats.resolved || 0;
        } else {
            console.error('Stats error:', data.error || 'Unknown error');
            // Set to 0 if there's an error
            document.getElementById('totalTickets').textContent = '0';
            document.getElementById('openTickets').textContent = '0';
            document.getElementById('inProgressTickets').textContent = '0';
            document.getElementById('resolvedTickets').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Set to 0 if there's an error
        document.getElementById('totalTickets').textContent = '0';
        document.getElementById('openTickets').textContent = '0';
        document.getElementById('inProgressTickets').textContent = '0';
        document.getElementById('resolvedTickets').textContent = '0';
    }
}

/**
 * Load all tickets from API
 */
async function loadTickets() {
    try {
        const params = new URLSearchParams({
            status: currentFilters.status,
            priority: currentFilters.priority,
            search: currentFilters.search
        });
        
        console.log('Fetching tickets with params:', params.toString());
        
        const response = await fetch(`/api/tickets?${params}`);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Full API response:', data);
        
        if (data.success) {
            allTickets = data.tickets;
            console.log('Tickets array:', allTickets);
            console.log('Number of tickets:', allTickets.length);
            
            if (allTickets.length > 0) {
                console.log('First ticket:', allTickets[0]);
                console.log('First ticket user_name:', allTickets[0].user_name);
                console.log('First ticket user_email:', allTickets[0].user_email);
            }
            
            renderTicketsTable(allTickets);
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        showToast('Failed to load tickets', 'error');
        
        // Show error in table
        const tbody = document.getElementById('ticketsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center" style="color: var(--danger-red);">
                    Failed to load tickets. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

/**
 * Render tickets in table
 * @param {Array} tickets - Array of ticket objects
 */
function renderTicketsTable(tickets) {
    const tbody = document.getElementById('ticketsTableBody');
    const ticketCount = document.getElementById('ticketCount');
    
    console.log('Rendering tickets:', tickets); // Debug log
    
    if (!tickets || tickets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No tickets found matching your filters.
                </td>
            </tr>
        `;
        ticketCount.textContent = 'No tickets found';
        return;
    }
    
    // Update ticket count
    ticketCount.textContent = `Showing ${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`;
    
    // Generate table rows
    tbody.innerHTML = tickets.map(ticket => {
        // Debug log each ticket
        console.log('Ticket data:', ticket);
        
        return `
        <tr>
            <td><strong>#${ticket.ticket_id || 'N/A'}</strong></td>
            <td>
                <div style="font-weight: 500;">${escapeHtml(ticket.user_name || 'Unknown')}</div>
                <div style="font-size: 0.813rem; color: var(--gray-500);">${escapeHtml(ticket.user_email || 'No email')}</div>
            </td>
            <td>${escapeHtml(ticket.issue_category || 'N/A')}</td>
            <td style="max-width: 250px;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${escapeHtml(ticket.subject || 'No subject')}
                </div>
            </td>
            <td>${getPriorityBadge(ticket.priority || 'Medium')}</td>
            <td>${getStatusBadge(ticket.status || 'Open')}</td>
            <td>
                <div>${formatDate(ticket.created_at || new Date())}</div>
                <div style="font-size: 0.75rem; color: var(--gray-500);">${formatTime(ticket.created_at || new Date())}</div>
            </td>
            <td>
                <button class="action-btn action-btn-view" onclick="viewTicket(${ticket.ticket_id})">
                    View Details
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

/**
 * Apply filters and reload tickets
 */
function applyFilters() {
    currentFilters = {
        status: document.getElementById('statusFilter').value,
        priority: document.getElementById('priorityFilter').value,
        search: document.getElementById('searchInput').value.trim()
    };
    
    loadTickets();
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    
    currentFilters = {
        status: 'all',
        priority: 'all',
        search: ''
    };
    
    loadTickets();
}

/**
 * Refresh entire dashboard
 */
function refreshDashboard() {
    loadDashboard();
    showToast('Dashboard refreshed', 'success');
}

/**
 * View ticket details in modal
 * @param {number} ticketId - Ticket ID
 */
function viewTicket(ticketId) {
    const ticket = allTickets.find(t => t.ticket_id === ticketId);
    
    if (!ticket) {
        showToast('Ticket not found', 'error');
        return;
    }
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="ticket-detail-grid">
            <!-- User Information -->
            <div class="detail-section">
                <h4>User Information</h4>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${escapeHtml(ticket.user_name)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${escapeHtml(ticket.user_email)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${ticket.user_phone || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${ticket.department || 'N/A'}</span>
                </div>
            </div>
            
            <!-- Ticket Details -->
            <div class="detail-section">
                <h4>Ticket Details</h4>
                <div class="detail-row">
                    <span class="detail-label">Ticket ID:</span>
                    <span class="detail-value"><strong>#${ticket.ticket_id}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${escapeHtml(ticket.issue_category)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value">${getPriorityBadge(ticket.priority)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${getStatusBadge(ticket.status)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created:</span>
                    <span class="detail-value">${formatDateTime(ticket.created_at)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Last Updated:</span>
                    <span class="detail-value">${formatDateTime(ticket.updated_at)}</span>
                </div>
            </div>
            
            <!-- Issue Description -->
            <div class="detail-section">
                <h4>Subject</h4>
                <p style="font-weight: 500; color: var(--gray-900);">${escapeHtml(ticket.subject)}</p>
            </div>
            
            <div class="detail-section">
                <h4>Description</h4>
                <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(ticket.description)}</p>
            </div>
            
            ${ticket.resolution_notes ? `
                <div class="detail-section">
                    <h4>Resolution Notes</h4>
                    <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(ticket.resolution_notes)}</p>
                </div>
            ` : ''}
            
            <!-- Status Update -->
            <div class="detail-section">
                <h4>Update Status</h4>
                <div class="status-actions">
                    <select id="statusUpdate" class="status-select">
                        <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button class="btn btn-primary" onclick="updateTicketStatus(${ticket.ticket_id})">
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    document.getElementById('ticketModal').style.display = 'block';
}

/**
 * Update ticket status
 * @param {number} ticketId - Ticket ID
 */
async function updateTicketStatus(ticketId) {
    const newStatus = document.getElementById('statusUpdate').value;
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                resolution_notes: ''
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Status updated successfully', 'success');
            closeModal();
            loadDashboard(); // Refresh data
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status', 'error');
    }
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('ticketModal').style.display = 'none';
}

/**
 * Get priority badge HTML
 * @param {string} priority - Priority level
 * @returns {string} Badge HTML
 */
function getPriorityBadge(priority) {
    const classes = {
        'High': 'badge-priority-high',
        'Medium': 'badge-priority-medium',
        'Low': 'badge-priority-low'
    };
    
    return `<span class="badge ${classes[priority] || ''}">${priority}</span>`;
}

/**
 * Get status badge HTML
 * @param {string} status - Ticket status
 * @returns {string} Badge HTML
 */
function getStatusBadge(status) {
    const classes = {
        'Open': 'badge-status-open',
        'In Progress': 'badge-status-progress',
        'Resolved': 'badge-status-resolved'
    };
    
    return `<span class="badge ${classes[status] || ''}">${status}</span>`;
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Format time string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

/**
 * Format full date and time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
function formatDateTime(dateString) {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error)
 */
function showToast(message, type = 'success') {
    // Simple implementation - you can enhance this
    const bgColor = type === 'success' ? 'var(--success-green)' : 'var(--danger-red)';
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}