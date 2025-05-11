document.addEventListener('DOMContentLoaded', function() {
    const sessionId = document.getElementById('session-id').textContent;
    const connectBtn = document.getElementById('connect-btn');
    const connectionStatus = document.getElementById('connection-status');
    const fileBrowser = document.getElementById('file-browser');
    const fileInput = document.getElementById('file-input');
    const selectedFiles = document.getElementById('selected-files');
    const sendFilesBtn = document.getElementById('send-files-btn');
    
    let files = [];
    
    connectBtn.addEventListener('click', connectToSession);
    fileInput.addEventListener('change', handleFileSelection);
    sendFilesBtn.addEventListener('click', sendFiles);
    
    async function connectToSession() {
        try {
            connectionStatus.textContent = 'Connecting...';
            
            const response = await fetch(`/api/connect/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                connectionStatus.textContent = 'Connected successfully!';
                connectionStatus.style.color = 'green';
                
                // Hide connect button
                connectBtn.style.display = 'none';
                
                // Show file browser
                fileBrowser.classList.remove('hidden');
            } else {
                connectionStatus.textContent = 'Failed to connect: ' + (data.error || 'Unknown error');
                connectionStatus.style.color = 'red';
            }
        } catch (error) {
            console.error('Error connecting to session:', error);
            connectionStatus.textContent = 'Connection error. Please try again.';
            connectionStatus.style.color = 'red';
        }
    }
    
    function handleFileSelection(event) {
        const fileList = event.target.files;
        files = [];
        
        // Clear selected files display
        selectedFiles.innerHTML = '';
        
        if (fileList.length > 0) {
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                files.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                
                // Create file item display
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
                
                fileItem.appendChild(fileInfo);
                selectedFiles.appendChild(fileItem);
            }
            
            // Enable send button
            sendFilesBtn.disabled = false;
        } else {
            // Disable send button if no files selected
            sendFilesBtn.disabled = true;
        }
    }
    
    async function sendFiles() {
        if (files.length === 0) return;
        
        try {
            sendFilesBtn.disabled = true;
            sendFilesBtn.textContent = 'Sending...';
            
            const response = await fetch(`/api/session/${sessionId}/files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ files: files })
            });
            
            const data = await response.json();
            
            if (data.success) {
                sendFilesBtn.textContent = 'Files Sent Successfully!';
                setTimeout(() => {
                    sendFilesBtn.textContent = 'Send Files';
                    sendFilesBtn.disabled = false;
                }, 3000);
            } else {
                sendFilesBtn.textContent = 'Failed to Send';
                sendFilesBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error sending files:', error);
            sendFilesBtn.textContent = 'Error Sending Files';
            sendFilesBtn.disabled = false;
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
