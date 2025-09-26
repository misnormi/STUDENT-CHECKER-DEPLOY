// Enhanced Dashboard JavaScript for Student Balance Checker
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced notification system
    function showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            padding: 16px;
            gap: 12px;
        `;

        const icon = notification.querySelector('.notification-icon');
        icon.style.cssText = `
            font-size: 20px;
            flex-shrink: 0;
        `;

        const messageEl = notification.querySelector('.notification-message');
        messageEl.style.cssText = `
            flex: 1;
            font-weight: 500;
            color: #1f2937;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        `;

        closeBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f3f4f6';
        });

        closeBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });

        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }
        
        .pulse-animation {
            animation: pulse 1s infinite;
        }
        
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #f3f4f6;
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);

    // Enhanced inline editing functionality for balance field
    const balanceCells = document.querySelectorAll('.balance-cell');
    
    balanceCells.forEach(cell => {
        const display = cell.querySelector('.balance-display');
        const input = cell.querySelector('.balance-input');
        const actions = cell.querySelector('.balance-actions');
        const saveBtn = cell.querySelector('.save-btn');
        const cancelBtn = cell.querySelector('.cancel-btn');
        const row = cell.closest('tr');
        const studentId = row.dataset.studentId;
        
        if (!display || !input || !actions || !saveBtn || !cancelBtn) return;
        
        // Make balance clickable to edit
        display.addEventListener('click', function() {
            startEdit();
        });
        
        // Save button click
        saveBtn.addEventListener('click', function() {
            saveBalance();
        });
        
        // Cancel button click
        cancelBtn.addEventListener('click', function() {
            cancelEdit();
        });
        
        // Enter key to save
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveBalance();
            }
        });
        
        // Escape key to cancel
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                cancelEdit();
            }
        });
        
        function startEdit() {
            // Hide display, show input and actions
            display.style.display = 'none';
            input.style.display = 'inline-block';
            actions.style.display = 'inline-block';
            
            // Focus and select input
            input.focus();
            input.select();
            
            // Store original value
            input.dataset.originalValue = input.value;
            
            // Add visual feedback
            input.style.borderColor = '#3b82f6';
            input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }
        
        function cancelEdit() {
            // Restore original value
            input.value = input.dataset.originalValue;
            
            // Hide input and actions, show display
            input.style.display = 'none';
            actions.style.display = 'none';
            display.style.display = 'inline';
            
            // Reset styles
            input.style.borderColor = '#3b82f6';
            input.style.boxShadow = 'none';
        }
        
        function saveBalance() {
            const newBalance = parseFloat(input.value);
            
            // Validate input
            if (isNaN(newBalance) || newBalance < 0) {
                showNotification('Please enter a valid positive number', 'error');
                input.focus();
                return;
            }
            
            // Show loading state
            const originalSaveContent = saveBtn.innerHTML;
            saveBtn.innerHTML = '<div class="loading-spinner"></div>';
            saveBtn.disabled = true;
            cancelBtn.disabled = true;
            
            // Send AJAX request
            fetch('/api/update-balance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    student_id: studentId,
                    balance: newBalance
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update display with new value (Peso format with commas)
                    const formattedBalance = data.new_balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    display.textContent = '₱' + formattedBalance;
                    input.value = data.new_balance.toFixed(2);
                    input.dataset.originalValue = data.new_balance.toFixed(2);
                    
                    // Hide input and actions, show display
                    input.style.display = 'none';
                    actions.style.display = 'none';
                    display.style.display = 'inline';
                    
                    // Reset styles
                    input.style.borderColor = '#3b82f6';
                    input.style.boxShadow = 'none';
                    
                    // Show success message
                    showNotification('Balance updated successfully!', 'success');
                } else {
                    showNotification('Error: ' + data.error, 'error');
                    input.focus();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error updating balance. Please try again.', 'error');
                input.focus();
            })
            .finally(() => {
                // Restore button state
                saveBtn.innerHTML = originalSaveContent;
                saveBtn.disabled = false;
                cancelBtn.disabled = false;
            });
        }
    });
    
    // Enhanced delete student functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.studentId;
            const studentName = this.dataset.studentName;
            
            // Show enhanced confirmation dialog
            showConfirmationDialog(
                'Delete Student',
                `Are you sure you want to delete student "${studentName}"?<br><br>This action cannot be undone.`,
                'Delete',
                'Cancel',
                function() {
                    deleteStudent(studentId, studentName, this);
                }
            );
        });
    });
    
    function showConfirmationDialog(title, message, confirmText, cancelText, onConfirm) {
        // Remove existing dialogs
        const existingDialogs = document.querySelectorAll('.confirmation-dialog');
        existingDialogs.forEach(dialog => dialog.remove());
        
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay">
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>${title}</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-body">
                        <div class="dialog-icon">⚠️</div>
                        <p>${message}</p>
                    </div>
                    <div class="dialog-footer">
                        <button class="btn btn-ghost dialog-cancel">${cancelText}</button>
                        <button class="btn btn-error dialog-confirm">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const overlay = dialog.querySelector('.dialog-overlay');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const content = dialog.querySelector('.dialog-content');
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            max-width: 400px;
            width: 100%;
            animation: slideInUp 0.3s ease-out;
        `;
        
        const header = dialog.querySelector('.dialog-header');
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px 0;
        `;
        
        const headerTitle = dialog.querySelector('.dialog-header h3');
        headerTitle.style.cssText = `
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        `;
        
        const closeBtn = dialog.querySelector('.dialog-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        `;
        
        const body = dialog.querySelector('.dialog-body');
        body.style.cssText = `
            padding: 20px 24px;
            text-align: center;
        `;
        
        const icon = dialog.querySelector('.dialog-icon');
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 16px;
        `;
        
        const messageEl = dialog.querySelector('.dialog-body p');
        messageEl.style.cssText = `
            margin: 0;
            color: #6b7280;
            line-height: 1.5;
        `;
        
        const footer = dialog.querySelector('.dialog-footer');
        footer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding: 0 24px 24px;
        `;
        
        const cancelBtn = dialog.querySelector('.dialog-cancel');
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #6b7280;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = dialog.querySelector('.dialog-confirm');
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            background: #ef4444;
            color: white;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        
        // Add hover effects
        cancelBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f9fafb';
        });
        
        cancelBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
        });
        
        confirmBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#dc2626';
        });
        
        confirmBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#ef4444';
        });
        
        // Event listeners
        closeBtn.addEventListener('click', () => dialog.remove());
        cancelBtn.addEventListener('click', () => dialog.remove());
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            dialog.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                dialog.remove();
            }
        });
        
        document.body.appendChild(dialog);
    }
    
    function deleteStudent(studentId, studentName, buttonElement) {
        // Show loading state
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '<div class="loading-spinner"></div>';
        buttonElement.disabled = true;
        
        // Send AJAX request
        fetch('/api/delete-student/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                student_id: studentId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove the row from table with animation
                const row = buttonElement.closest('tr');
                row.style.opacity = '0.5';
                row.style.transition = 'all 0.3s ease';
                row.style.transform = 'translateX(-100%)';
                
                setTimeout(() => {
                    row.remove();
                    showNotification(data.message, 'success');
                    
                    // Check if table is empty
                    const tbody = document.querySelector('.table tbody');
                    if (tbody && tbody.children.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No students found</td></tr>';
                    }
                }, 300);
            } else {
                showNotification('Error: ' + data.error, 'error');
                // Restore button state
                buttonElement.innerHTML = originalContent;
                buttonElement.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error deleting student. Please try again.', 'error');
            // Restore button state
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = false;
        });
    }
    
    // Enhanced search and filter functionality
    const searchInput = document.querySelector('.search-input');
    const filterSelects = document.querySelectorAll('.filter-select');
    const searchForm = document.querySelector('.search-form');
    
    // Auto-submit form when filters change
    if (filterSelects.length > 0) {
        filterSelects.forEach(select => {
            select.addEventListener('change', function() {
                // Add loading state to form
                const submitBtn = searchForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const originalContent = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<div class="loading-spinner"></div>';
                    submitBtn.disabled = true;
                    
                    setTimeout(() => {
                        searchForm.submit();
                    }, 100);
                } else {
                    searchForm.submit();
                }
            });
        });
    }
    
    // Enhanced search with Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForm.submit();
            }
        });
        
        // Clear search on Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                searchForm.submit();
            }
        });
        
        // Real-time search suggestions (if you want to implement this)
        searchInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value.length > 2) {
                // Could implement real-time search here
                this.style.borderColor = '#3b82f6';
                this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            } else {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
            }
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            if (searchInput) {
                searchInput.value = '';
                searchInput.blur();
            }
        }
    });
    
    // Add slideInUp animation
    const additionalStyle = document.createElement('style');
    additionalStyle.textContent = `
        @keyframes slideInUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(additionalStyle);
});

// Enhanced CSRF token helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
