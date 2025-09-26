// Enhanced Main JavaScript for Student Balance Checker
document.addEventListener('DOMContentLoaded', function() {
    const studentIdInput = document.getElementById('studentIdInput');
    const rfidInput = document.getElementById('rfidInput');
    const studentIdTab = document.getElementById('studentIdTab');
    const rfidTab = document.getElementById('rfidTab');
    const tapCircle = document.getElementById('tapCircle');
    const results = document.getElementById('results');
    const studentName = document.getElementById('studentName');
    const studentId = document.getElementById('studentId');
    const studentRfid = document.getElementById('studentRfid');
    const balance = document.getElementById('balance');
    const balanceDate = document.getElementById('balanceDate');
    
    console.log('Elements found:');
    console.log('studentName:', studentName);
    console.log('studentId:', studentId);
    console.log('studentRfid:', studentRfid);
    console.log('balance:', balance);
    console.log('balanceDate:', balanceDate);
    
    let currentInputType = 'student_id';
    let currentInput = studentIdInput;

    // Tab switching functionality
    function switchTab(type) {
        currentInputType = type;
        
        // Update tab buttons
        if (studentIdTab && rfidTab) {
            studentIdTab.classList.toggle('active', type === 'student_id');
            rfidTab.classList.toggle('active', type === 'rfid_number');
        }
        
        // Show/hide appropriate input
        if (type === 'student_id') {
            if (studentIdInput) studentIdInput.style.display = 'block';
            if (rfidInput) rfidInput.style.display = 'none';
            currentInput = studentIdInput;
        } else {
            if (studentIdInput) studentIdInput.style.display = 'none';
            if (rfidInput) rfidInput.style.display = 'block';
            currentInput = rfidInput;
        }
        
        // Clear both inputs
        if (studentIdInput) studentIdInput.value = '';
        if (rfidInput) rfidInput.value = '';
        
        // Focus on current input
        if (currentInput) {
            setTimeout(() => currentInput.focus(), 100);
        }
    }

    // Tab button event listeners
    if (studentIdTab) {
        studentIdTab.addEventListener('click', () => switchTab('student_id'));
    }
    
    if (rfidTab) {
        rfidTab.addEventListener('click', () => switchTab('rfid_number'));
    }

    // Enhanced visual feedback
    function showLoadingState() {
        if (tapCircle) {
            tapCircle.style.transform = 'scale(0.95)';
            tapCircle.style.opacity = '0.7';
            const icon = tapCircle.querySelector('.tap-icon');
            if (icon) {
                const logo = icon.querySelector('.normi-logo');
                if (logo) {
                    logo.style.filter = 'grayscale(100%) brightness(0.5)';
                }
            }
        }
    }

    function hideLoadingState() {
        if (tapCircle) {
            tapCircle.style.transform = 'scale(1)';
            tapCircle.style.opacity = '1';
            const icon = tapCircle.querySelector('.tap-icon');
            if (icon) {
                const logo = icon.querySelector('.normi-logo');
                if (logo) {
                    logo.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))';
                }
            }
        }
    }

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
    `;
    document.head.appendChild(style);

    // Enhanced balance checking function
    async function checkBalance(inputValue) {
        if (!inputValue.trim()) {
            const inputType = currentInputType === 'student_id' ? 'Student ID' : 'RFID Number';
            showNotification(`Please enter a ${inputType}`, 'warning');
            return;
        }

        showLoadingState();

        try {
            // Always send both fields and let the API auto-detect
            const requestData = {
                student_id: inputValue,
                rfid_number: inputValue
            };

            const response = await fetch('/api/check-balance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.success) {
                // Display student information with enhanced animation
                studentName.textContent = data.student.name;
                studentId.textContent = `ID: ${data.student.id}`;
                studentRfid.textContent = `RFID: ${data.student.rfid_number}`;
                
                // Format balance with Peso symbol and commas
                const formattedBalance = data.student.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                balance.textContent = `₱${formattedBalance}`;
                
                // Format and display balance date
                const balanceDateEl = document.getElementById('balanceDate');
                console.log('balanceDate element:', balanceDateEl);
                console.log('balance_updated_at:', data.student.balance_updated_at);
                
                if (data.student.balance_updated_at) {
                    const balanceUpdateDate = new Date(data.student.balance_updated_at);
                    const formattedDate = balanceUpdateDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    console.log('Formatted date:', formattedDate);
                    if (balanceDateEl) {
                        balanceDateEl.textContent = `Balance as of: ${formattedDate}`;
                        console.log('Balance date set to:', balanceDateEl.textContent);
                    } else {
                        console.error('balanceDate element not found!');
                    }
                } else {
                    console.log('No balance_updated_at data');
                    if (balanceDateEl) {
                        balanceDateEl.textContent = 'Balance as of: Unknown';
                    }
                }
                
                // Show results with animation
                results.style.display = 'block';
                results.style.animation = 'fadeIn 0.5s ease-out';
                
                // Clear current input
                if (currentInput) {
                    currentInput.value = '';
                }
                
                // Show success notification
                showNotification('Balance retrieved successfully!', 'success');
                
                // Hide results after 8 seconds
                setTimeout(() => {
                    if (results.style.display !== 'none') {
                        results.style.animation = 'fadeOut 0.3s ease-in';
                        setTimeout(() => {
                            results.style.display = 'none';
                        }, 300);
                    }
                }, 8000);
            } else {
                showNotification(data.error || 'Student not found', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error checking balance. Please try again.', 'error');
        } finally {
            hideLoadingState();
        }
    }

    // Enhanced input handling for both inputs
    function setupInputHandlers(input) {
        if (!input) return;
        
        // Real-time input validation and automatic balance check
        input.addEventListener('input', function() {
            const value = this.value.trim();
            if (value.length > 0) {
                this.style.borderColor = '#3b82f6';
                this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                
                // Clear previous timeout
                if (this.inputTimeout) {
                    clearTimeout(this.inputTimeout);
                }
                
                // Auto-check balance after user stops typing for 500ms
                this.inputTimeout = setTimeout(() => {
                    if (value.trim().length > 0) {
                        checkBalance(value);
                    }
                }, 500);
            } else {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
                
                // Clear timeout if input is empty
                if (this.inputTimeout) {
                    clearTimeout(this.inputTimeout);
                }
                
                // Hide results if input is empty
                if (results) {
                    results.style.display = 'none';
                }
            }
        });

        // Enhanced Enter key handling
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Clear timeout and check immediately
                if (this.inputTimeout) {
                    clearTimeout(this.inputTimeout);
                }
                checkBalance(this.value);
            }
        });

        // Clear on Escape
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
                
                // Clear timeout
                if (this.inputTimeout) {
                    clearTimeout(this.inputTimeout);
                }
                
                if (results) {
                    results.style.display = 'none';
                }
            }
        });

        // Focus effects
        input.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
        });

        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
            if (this.value.trim() === '') {
                this.style.boxShadow = 'none';
            }
        });
    }

    // Setup handlers for both inputs
    setupInputHandlers(studentIdInput);
    setupInputHandlers(rfidInput);

    // Enhanced tap circle interactions
    if (tapCircle) {
        tapCircle.addEventListener('click', function() {
            const inputValue = currentInput ? currentInput.value : '';
            if (inputValue) {
                // Clear any pending timeout and check immediately
                if (currentInput && currentInput.inputTimeout) {
                    clearTimeout(currentInput.inputTimeout);
                }
                checkBalance(inputValue);
            } else {
                // Focus on current input if no value entered
                if (currentInput) {
                    currentInput.focus();
                    const inputType = currentInputType === 'student_id' ? 'Student ID' : 'RFID Number';
                    showNotification(`Please enter a ${inputType} first`, 'info');
                }
            }
        });

        // Enhanced double-click for demo
        tapCircle.addEventListener('dblclick', function() {
            if (currentInputType === 'student_id') {
                const demoIds = ['STU001', 'STU002', 'STU003', 'STU004', 'STU005'];
                const randomId = demoIds[Math.floor(Math.random() * demoIds.length)];
                if (currentInput) {
                    currentInput.value = randomId;
                    currentInput.style.borderColor = '#3b82f6';
                    currentInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    checkBalance(randomId);
                }
            } else {
                const demoRfids = ['RFID001', 'RFID002', 'RFID003', 'RFID004', 'RFID005'];
                const randomRfid = demoRfids[Math.floor(Math.random() * demoRfids.length)];
                if (currentInput) {
                    currentInput.value = randomRfid;
                    currentInput.style.borderColor = '#3b82f6';
                    currentInput.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    checkBalance(randomRfid);
                }
            }
        });

        // Enhanced visual feedback
        tapCircle.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });

        tapCircle.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });

        tapCircle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        // Hover effects
        tapCircle.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.05)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });

        tapCircle.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    }

    // Auto-focus on current input when page loads
    if (currentInput) {
        setTimeout(() => {
            currentInput.focus();
        }, 500);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (currentInput) {
                currentInput.focus();
                currentInput.select();
            }
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            if (currentInput) {
                currentInput.value = '';
                currentInput.blur();
            }
            if (results) {
                results.style.display = 'none';
            }
        }
    });

    // Add loading animation to results
    if (results) {
        results.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    }
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

// Add fadeIn and fadeOut animations
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(additionalStyle);
