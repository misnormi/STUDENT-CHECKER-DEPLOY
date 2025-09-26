document.addEventListener('DOMContentLoaded', function() {
    const studentIdInput = document.getElementById('studentIdInput');
    const tapCircle = document.getElementById('tapCircle');
    const results = document.getElementById('results');
    const studentName = document.getElementById('studentName');
    const studentId = document.getElementById('studentId');
    const balance = document.getElementById('balance');

    // Function to check balance
    async function checkBalance(studentIdValue) {
        if (!studentIdValue.trim()) {
            alert('Please enter a Student ID');
            return;
        }

        try {
            const response = await fetch('/api/check-balance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    student_id: studentIdValue
                })
            });

            const data = await response.json();

            if (data.success) {
                // Display student information
                studentName.textContent = data.student.name;
                studentId.textContent = `ID: ${data.student.id}`;
                // Format balance with Peso symbol and commas
                const formattedBalance = data.student.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                balance.textContent = `₱${formattedBalance}`;
                results.style.display = 'block';
                
                // Clear input
                studentIdInput.value = '';
                
                // Hide results after 5 seconds
                setTimeout(() => {
                    results.style.display = 'none';
                }, 5000);
            } else {
                alert(data.error || 'Student not found');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error checking balance. Please try again.');
        }
    }

    // Handle Enter key in input field
    studentIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkBalance(this.value);
        }
    });

    // Handle tap circle click
    tapCircle.addEventListener('click', function() {
        const studentIdValue = studentIdInput.value;
        if (studentIdValue) {
            checkBalance(studentIdValue);
        } else {
            // Focus on input if no ID entered
            studentIdInput.focus();
        }
    });

    // Simulate ID card tap (for demonstration)
    tapCircle.addEventListener('dblclick', function() {
        // Simulate a random student ID for demo purposes
        const demoIds = ['STU001', 'STU002', 'STU003', 'STU004', 'STU005'];
        const randomId = demoIds[Math.floor(Math.random() * demoIds.length)];
        studentIdInput.value = randomId;
        checkBalance(randomId);
    });

    // Add visual feedback for tap circle
    tapCircle.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });

    tapCircle.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    tapCircle.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    // Auto-focus on input when page loads
    studentIdInput.focus();

    // Add some visual effects
    studentIdInput.addEventListener('focus', function() {
        this.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
    });

    studentIdInput.addEventListener('blur', function() {
        this.style.boxShadow = 'none';
    });
});

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
