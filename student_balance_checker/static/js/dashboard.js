document.addEventListener('DOMContentLoaded', function() {
    // Inline editing functionality for balance field
    const balanceCells = document.querySelectorAll('.balance-cell');
    
    balanceCells.forEach(cell => {
        const display = cell.querySelector('.balance-display');
        const input = cell.querySelector('.balance-input');
        const actions = cell.querySelector('.balance-actions');
        const saveBtn = cell.querySelector('.save-btn');
        const cancelBtn = cell.querySelector('.cancel-btn');
        const row = cell.closest('tr');
        const studentId = row.dataset.studentId;
        
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
        }
        
        function cancelEdit() {
            // Restore original value
            input.value = input.dataset.originalValue;
            
            // Hide input and actions, show display
            input.style.display = 'none';
            actions.style.display = 'none';
            display.style.display = 'inline';
        }
        
        function saveBalance() {
            const newBalance = parseFloat(input.value);
            
            // Validate input
            if (isNaN(newBalance) || newBalance < 0) {
                alert('Please enter a valid positive number');
                input.focus();
                return;
            }
            
            // Show loading state
            saveBtn.innerHTML = '⏳';
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
                    
                    // Show success message briefly
                    showMessage('Balance updated successfully!', 'success');
                } else {
                    alert('Error: ' + data.error);
                    input.focus();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error updating balance. Please try again.');
                input.focus();
            })
            .finally(() => {
                // Restore button state
                saveBtn.innerHTML = '✓';
                saveBtn.disabled = false;
                cancelBtn.disabled = false;
            });
        }
    });
    
    // Delete student functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentId = this.dataset.studentId;
            const studentName = this.dataset.studentName;
            
            // Show confirmation dialog
            if (confirm(`Are you sure you want to delete student "${studentName}"?\n\nThis action cannot be undone.`)) {
                deleteStudent(studentId, studentName, this);
            }
        });
    });
    
    function deleteStudent(studentId, studentName, buttonElement) {
        // Show loading state
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = '⏳';
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
                // Remove the row from table
                const row = buttonElement.closest('tr');
                row.style.opacity = '0.5';
                row.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    row.remove();
                    showMessage(data.message, 'success');
                }, 300);
                
                // Check if table is empty
                const tbody = document.querySelector('.student-table tbody');
                if (tbody.children.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="no-data">No students found</td></tr>';
                }
            } else {
                alert('Error: ' + data.error);
                // Restore button state
                buttonElement.innerHTML = originalContent;
                buttonElement.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting student. Please try again.');
            // Restore button state
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = false;
        });
    }
    
    // Search and filter functionality
    const searchInput = document.querySelector('.search-input');
    const filterSelects = document.querySelectorAll('.filter-select');
    const searchForm = document.querySelector('.search-form');
    
    // Auto-submit form when filters change
    if (filterSelects.length > 0) {
        filterSelects.forEach(select => {
            select.addEventListener('change', function() {
                searchForm.submit();
            });
        });
    }
    
    // Search with Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
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
    }
    
    // Helper function to get CSRF token
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
    
    // Helper function to show messages
    function showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '9999';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.fontWeight = 'bold';
        
        // Style based on type
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
});
