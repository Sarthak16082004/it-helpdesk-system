/**
 * ================================================================
 * IT HELPDESK TICKET MANAGEMENT SYSTEM - USER INTERFACE LOGIC
 * ================================================================
 * Handles form submission, validation, and user interactions
 * ================================================================
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTicketForm();
});

/**
 * Initialize ticket submission form
 */
function initializeTicketForm() {
    const form = document.getElementById('ticketForm');
    
    if (!form) return;
    
    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Validate all fields
    if (!validateForm()) {
        showAlert('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Disable submit button and show loader
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    
    // Collect form data
    const formData = {
        user_name: document.getElementById('userName').value.trim(),
        user_email: document.getElementById('userEmail').value.trim(),
        user_phone: document.getElementById('userPhone').value.trim(),
        department: document.getElementById('department').value,
        issue_category: document.getElementById('issueCategory').value,
        priority: document.getElementById('priority').value,
        subject: document.getElementById('subject').value.trim(),
        description: document.getElementById('description').value.trim()
    };
    
    try {
        // Send POST request to backend
        const response = await fetch('/submit-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success - redirect to success page
            window.location.href = `/success?ticket_id=${result.ticket_id}`;
        } else {
            // Error from server
            showAlert(result.error || 'Failed to submit ticket. Please try again.', 'error');
            
            // Re-enable submit button
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error submitting ticket:', error);
        showAlert('Network error. Please check your connection and try again.', 'error');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Validate entire form
 * @returns {boolean} - True if form is valid
 */
function validateForm() {
    const form = document.getElementById('ticketForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual field
 * @param {Event} event - Field blur event
 * @returns {boolean} - True if field is valid
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation (optional but if provided should be valid)
    if (field.type === 'tel' && value) {
        // Allow various phone formats: 1234567890, +91-1234567890, (123) 456-7890, etc.
        const phoneRegex = /^[\d\s\+\-\(\)]{10,20}$/;
        const digitCount = value.replace(/\D/g, '').length;
        
        if (!phoneRegex.test(value) || digitCount < 10) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number (at least 10 digits)';
        }
    }
    
    // Update field styling
    if (!isValid) {
        field.style.borderColor = 'var(--danger-red)';
        showFieldError(field, errorMessage);
    } else {
        field.style.borderColor = 'var(--gray-300)';
        removeFieldError(field);
    }
    
    return isValid;
}

/**
 * Show field-specific error message
 * @param {HTMLElement} field - Input field
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
    // Remove existing error
    removeFieldError(field);
    
    // Create error element
    const errorDiv = document.createElement('small');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--danger-red)';
    errorDiv.style.fontSize = '0.813rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    
    // Insert after field
    field.parentNode.appendChild(errorDiv);
}

/**
 * Remove field error message
 * @param {HTMLElement} field - Input field
 */
function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, error, warning)
 */
function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    
    if (!alertBox) return;
    
    // Set alert content and style
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'flex';
    
    // Scroll to alert
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

/**
 * Reset form to initial state
 */
function resetForm() {
    const form = document.getElementById('ticketForm');
    
    if (!form) return;
    
    // Reset form fields
    form.reset();
    
    // Remove all error styling
    const fields = form.querySelectorAll('.form-control');
    fields.forEach(field => {
        field.style.borderColor = 'var(--gray-300)';
        removeFieldError(field);
    });
    
    // Hide alert
    const alertBox = document.getElementById('alertBox');
    if (alertBox) {
        alertBox.style.display = 'none';
    }
    
    // Show success message
    showAlert('Form cleared successfully', 'success');
}

/**
 * Format phone number as user types (optional enhancement)
 * @param {HTMLElement} phoneInput - Phone input field
 */
function formatPhoneNumber(phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        // Simply allow any input without forced formatting
        let value = e.target.value;
        
        // Remove any non-digit, non-space, non-plus, non-hyphen characters
        value = value.replace(/[^\d\s\+\-\(\)]/g, '');
        
        // Limit to 20 characters
        if (value.length > 20) {
            value = value.slice(0, 20);
        }
        
        e.target.value = value;
    });
}

// Optional: Initialize phone formatting
const phoneInput = document.getElementById('userPhone');
if (phoneInput) {
    formatPhoneNumber(phoneInput);
}