document.addEventListener('DOMContentLoaded', function() {
    const sessionId = document.getElementById('session-id').textContent;
    const connectionStatus = document.getElementById('connection-status');
    const filesContainer = document.getElementById('files-container');
    const fileList = document.getElementById('file-list');
    const noFilesMessage = document.getElementById('no-files-message');
    
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    let statusCheckInterval = null;
    let filesCheckInterval = null;
    
    // Start checking connection status
    checkConnectionStatus();
    statusCheckInterval = setInterval(checkConnectionStatus, 3000);
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
    
    async function checkConnectionStatus() {
        try {
            const response = await fetch(`/api/session/${sessionId}/status`);
            const data = await response.json();
            
            if (data.connected) {
                connectionStatus.textContent = 'Connected';
                connectionStatus.style.color = 'green';
                
                // Stop checking connection status
                clearInterval(statusCheckInterval);
                
                // Show files container
                filesContainer.classList.remove('hidden');
                
                // Start checking for files
                checkForFiles();
                filesCheckInterval = setInterval(checkForFiles, 3000);
            } else {
                connectionStatus.textContent = 'Waiting for connection...';
            }
        } catch (error) {
            console.error('Error checking status:', error);
            connectionStatus.textContent = 'Error checking status';
            connectionStatus.style.color = 'red';
        }
    }
    
    async function checkForFiles() {
        try {
            const response = await fetch(`/api/session/${sessionId}/files`);
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                // Hide no files message
                noFilesMessage.style.display = 'none';
                
                // Clear existing file list
                const existingFiles = fileList.querySelectorAll('.file-item');
                existingFiles.forEach(file => {
                    if (file !== noFilesMessage) {
                        file.remove();
                    }
                });
                
                // Add files to the list
                // Add files to the list
                data.files.forEach((file, index) => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    
                    const fileInfo = document.createElement('div');
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.name;
                    
                    const fileSize = document.createElement('div');
                    fileSize.className = 'file-size';
                    fileSize.textContent = formatFileSize(file.size);
                    
                    fileInfo.appendChild(fileName);
                    fileInfo.appendChild(fileSize);
                    
                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'btn';
                    downloadBtn.textContent = 'Download';
                    downloadBtn.addEventListener('click', () => {
                        downloadFile(index, file.name);
                    });
                    
                    fileItem.appendChild(fileInfo);
                    fileItem.appendChild(downloadBtn);
                    
                    fileList.appendChild(fileItem);
                });
            } else {
                noFilesMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error checking for files:', error);
        }
    }
    
    async function downloadFile(fileIndex, fileName) {
        try {
            showNotification(`Downloading ${fileName}...`, 'info');
            
            // Create a hidden anchor element
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = `/api/session/${sessionId}/download/${fileIndex}`;
            a.download = fileName;
            
            // Add to the DOM and trigger click
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                showNotification(`${fileName} downloaded successfully!`, 'success');
            }, 1000);
        } catch (error) {
            console.error('Error downloading file:', error);
            showNotification(`Error downloading ${fileName}`, 'error');
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
