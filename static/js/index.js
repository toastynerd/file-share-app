document.addEventListener('DOMContentLoaded', function() {
    const createSessionBtn = document.getElementById('create-session-btn');
    const sessionInfo = document.getElementById('session-info');
    const sessionUrl = document.getElementById('session-url');
    const copyUrlBtn = document.getElementById('copy-url-btn');
    const connectionStatus = document.getElementById('connection-status');
    const viewSessionBtn = document.getElementById('view-session-btn');
    const qrcodeContainer = document.getElementById('qrcode');
    
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    let sessionId = null;
    let statusCheckInterval = null;
    
    createSessionBtn.addEventListener('click', createSession);
    copyUrlBtn.addEventListener('click', copySessionUrl);
    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    async function createSession() {
        try {
            const response = await fetch('/create_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            sessionId = data.session_id;
            
            // Show session info
            sessionInfo.classList.remove('hidden');
            
            // Set and display the session URL
            const fullUrl = `${window.location.origin}/connect/${sessionId}`;
            sessionUrl.value = fullUrl;
            
            // Generate QR code
            qrcodeContainer.innerHTML = '';
            new QRCode(qrcodeContainer, {
                text: fullUrl,
                width: 200,
                height: 200
            });
            
            // Start checking connection status
            startStatusCheck();
            
            // Set up view session button
            viewSessionBtn.addEventListener('click', () => {
                window.location.href = `/session/${sessionId}`;
            });
            
        } catch (error) {
            console.error('Error creating session:', error);
            showNotification('Failed to create session. Please try again.', 'error');
        }
    }
    
    function copySessionUrl() {
        sessionUrl.select();
        document.execCommand('copy');
        
        // Visual feedback
        showNotification('URL copied to clipboard!', 'success');
        copyUrlBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyUrlBtn.textContent = 'Copy';
        }, 2000);
    }
    
    function startStatusCheck() {
        // Check immediately
        checkConnectionStatus();
        
        // Then check every 3 seconds
        statusCheckInterval = setInterval(checkConnectionStatus, 3000);
    }
    
    async function checkConnectionStatus() {
        if (!sessionId) return;
        
        try {
            const response = await fetch(`/api/session/${sessionId}/status`);
            const data = await response.json();
            
            if (data.connected) {
                connectionStatus.textContent = 'Connected!';
                connectionStatus.style.color = 'green';
                viewSessionBtn.classList.remove('hidden');
                
                // Stop checking once connected
                clearInterval(statusCheckInterval);
            } else {
                connectionStatus.textContent = 'Waiting for connection...';
            }
        } catch (error) {
            console.error('Error checking status:', error);
            connectionStatus.textContent = 'Error checking status';
            connectionStatus.style.color = 'red';
        }
    }
});
