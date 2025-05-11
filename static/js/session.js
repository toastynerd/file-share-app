document.addEventListener('DOMContentLoaded', function() {
    const sessionId = document.getElementById('session-id').textContent;
    const connectionStatus = document.getElementById('connection-status');
    const filesContainer = document.getElementById('files-container');
    const fileList = document.getElementById('file-list');
    const noFilesMessage = document.getElementById('no-files-message');
    
    let statusCheckInterval = null;
    let filesCheckInterval = null;
    
    // Start checking connection status
    checkConnectionStatus();
    statusCheckInterval = setInterval(checkConnectionStatus, 3000);
    
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
                data.files.forEach(file => {
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
                        // In a real implementation, this would download the file
                        alert(`Downloading ${file.name}`);
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
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
