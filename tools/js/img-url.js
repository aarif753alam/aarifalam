// DOM Elements
const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const uploadBtn = document.getElementById('uploadBtn');
const imagePreviews = document.getElementById('imagePreviews');
const resultContainer = document.getElementById('resultContainer');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeModal = document.getElementById('closeModal');
const urlHistory = document.getElementById('urlHistory');
const progressBar = document.getElementById('progressBar');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let CLOUD_NAME, UPLOAD_PRESET, API_KEY;

// Fetch Cloudinary config from your Worker
fetch('https://cloud-config.kumar8948rahul.workers.dev/', {
    mode: 'cors',
    credentials: 'omit' // or 'include' if you need cookies
})
.then(res => {
    if (!res.ok) {
        if (res.status === 403) {
            throw new Error('Access denied: This tool only works on authorized domains please contact - aarifalam0105@gmail.com');
        }
        throw new Error('Failed to fetch config');
    }
    return res.json();
})
.then(data => {
    CLOUD_NAME = data.cloudName;
    UPLOAD_PRESET = data.uploadPreset;
    API_KEY = data.apiKey;
    console.log("Cloudinary config loaded:", CLOUD_NAME, UPLOAD_PRESET, API_KEY);
})
.catch(err => {
    console.error("Failed to load Cloudinary config:", err);
    showToast(err.message || 'Failed to load Cloudinary configuration', 'error');
});

// Store selected files
let selectedFiles = [];

// Initialize from local storage
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    checkScheduledDeletions();
    addPulseAnimation();
    addScrollToTopButton();
    initializeHistoryNotification(); // Added: Initialize notification system
});

// ========== HISTORY NOTIFICATION SYSTEM ==========
function initializeHistoryNotification() {
    // Initial check for history on page load
    updateHistoryNotification();
    
    // Check for history every 2 seconds
    setInterval(updateHistoryNotification, 2000);
}

function updateHistoryNotification() {
    const history = JSON.parse(localStorage.getItem('imageUrls')) || [];
    const hasHistory = history.length > 0;
    
    if (hasHistory) {
        historyBtn.classList.add('has-history');
    } else {
        historyBtn.classList.remove('has-history');
    }
}

// Show notification when new images are uploaded
function showHistoryNotification() {
    historyBtn.classList.add('has-history');
}

// Remove notification when history modal is opened
historyBtn.addEventListener('click', () => {
    historyBtn.classList.remove('has-history');
    historyModal.style.display = 'flex';
    loadHistory();
});

// ========== END HISTORY NOTIFICATION ==========

// File selection handler
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop handlers
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'transparent';
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'transparent';
    dropArea.classList.remove('dragover');
    
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});

// Upload button handler - UPDATED with animation
uploadBtn.addEventListener('click', uploadImagesWithAnimation);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.style.display = 'none';
    }
});

// Handle file selection
function handleFileSelect(e) {
    handleFiles(e.target.files);
}

// Process selected files
function handleFiles(files) {
    selectedFiles = Array.from(files);
    
    // Clear previous previews
    imagePreviews.innerHTML = '';
    
    if (selectedFiles.length === 0) return;
    
    // Create previews for each image
    selectedFiles.forEach((file, index) => {
        if (!file.type.match('image.*')) {
            showToast('Please select only image files', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <button class="remove-btn" onclick="removePreview(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            imagePreviews.appendChild(preview);
        };
        
        reader.readAsDataURL(file);
    });
    
    showToast(`${selectedFiles.length} image(s) selected`, 'success');
}

// Remove preview from selection
function removePreview(index) {
    selectedFiles.splice(index, 1);
    
    // Recreate previews
    imagePreviews.innerHTML = '';
    selectedFiles.forEach((file, newIndex) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${newIndex + 1}">
                <button class="remove-btn" onclick="removePreview(${newIndex})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            imagePreviews.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });
    
    if (selectedFiles.length === 0) {
        showToast('All images removed', 'info');
    } else {
        showToast(`${selectedFiles.length} image(s) remaining`, 'success');
    }
}

// Function to animate progress bar with simulated progress
function animateProgressBar() {
    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 25) {
            progress += 1;
            progressBar.style.width = `${progress}%`;
        } else {
            clearInterval(interval);
        }
    }, 30);
}

// Function to scroll to the Generated URLs section with smooth animation
function scrollToResults() {
    const resultsSection = document.querySelector('.main-content .card:nth-child(2)');
    if (resultsSection) {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
        
        // Add a highlight effect to draw attention
        resultsSection.style.transition = 'all 0.5s ease';
        resultsSection.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.3)';
        
        setTimeout(() => {
            resultsSection.style.boxShadow = '';
        }, 1500);
    }
}

// Function to highlight the copy button with a pulsing animation
function highlightCopyButtons() {
    const copyButtons = document.querySelectorAll('.action-btn, .copy-btn');
    copyButtons.forEach(button => {
        button.style.animation = 'pulse 2s infinite';
    });
    
    // Remove animation after 5 seconds
    setTimeout(() => {
        copyButtons.forEach(button => {
            button.style.animation = '';
        });
    }, 5000);
}

// Add pulse animation to CSS
function addPulseAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
        }
        
        .processing {
            position: relative;
            overflow: hidden;
        }
        
        .processing::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: processing 1.5s infinite;
        }
        
        @keyframes processing {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(style);
}

// Add scroll to top button
function addScrollToTopButton() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.style.position = 'fixed';
    scrollToTopBtn.style.bottom = '100px';
    scrollToTopBtn.style.right = '30px';
    scrollToTopBtn.style.width = '50px';
    scrollToTopBtn.style.height = '50px';
    scrollToTopBtn.style.borderRadius = '50%';
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    scrollToTopBtn.style.color = 'white';
    scrollToTopBtn.style.border = 'none';
    scrollToTopBtn.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.3)';
    scrollToTopBtn.style.cursor = 'pointer';
    scrollToTopBtn.style.zIndex = '99';
    scrollToTopBtn.style.display = 'none';
    scrollToTopBtn.style.alignItems = 'center';
    scrollToTopBtn.style.justifyContent = 'center';
    scrollToTopBtn.style.fontSize = '1.2rem';
    scrollToTopBtn.style.transition = 'all 0.3s ease';
    
    scrollToTopBtn.addEventListener('mouseenter', () => {
        scrollToTopBtn.style.transform = 'translateY(-3px)';
        scrollToTopBtn.style.boxShadow = '0 6px 20px rgba(67, 97, 238, 0.5)';
    });
    
    scrollToTopBtn.addEventListener('mouseleave', () => {
        scrollToTopBtn.style.transform = 'translateY(0)';
        scrollToTopBtn.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.3)';
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll-to-top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
}

// Enhanced upload function with animation and auto-scroll
async function uploadImagesWithAnimation() {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        showToast('Cloudinary configuration not loaded yet. Please wait...', 'error');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showToast('Please select at least one image first', 'error');
        return;
    }
    
    // Add processing class to button
    uploadBtn.classList.add('processing');
    
    // Disable button during processing
    uploadBtn.disabled = true;
    
    // Start progress animation
    animateProgressBar();
    
    // Clear previous results
    resultContainer.innerHTML = '';
    
    // Reset progress bar to 0% initially
    progressBar.style.width = '0%';
    
    const results = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('api_key', API_KEY);
        
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            const url = data.secure_url;
            const publicId = data.public_id;
            results.push({ file: file.name, url, publicId });
            
            // Update progress bar based on actual upload progress
            progressBar.style.width = `${((i + 1) / selectedFiles.length) * 100}%`;
            
        } catch (error) {
            console.error('Error uploading image:', error);
            results.push({ file: file.name, error: error.message });
        }
    }
    
    // Display results
    displayResults(results);
    
    // Save to history
    saveToHistory(results.filter(r => !r.error));
    
    // Show history notification
    if (results.filter(r => !r.error).length > 0) {
        showHistoryNotification();
    }
    
    // Reset selected files
    selectedFiles = [];
    imagePreviews.innerHTML = '';
    
    // Remove processing class and re-enable button
    uploadBtn.classList.remove('processing');
    uploadBtn.disabled = false;
    
    // Scroll to results section
    setTimeout(() => {
        scrollToResults();
        highlightCopyButtons();
    }, 500);
    
    showToast('Images uploaded successfully!', 'success');
}

// Display upload results
function displayResults(results) {
    if (results.length === 0) return;
    
    resultContainer.innerHTML = '';
    
    results.forEach(result => {
        if (result.error) {
            resultContainer.innerHTML += `
                <div class="url-item">
                    <i class="fas fa-exclamation-triangle" style="color: #e63946; font-size: 1.5rem;"></i>
                    <div class="url-details">
                        <strong>${result.file}</strong>
                        <p style="color: #e63946;">Error: ${result.error}</p>
                    </div>
                </div>
            `;
        } else {
            resultContainer.innerHTML += `
                <div class="url-item">
                    <img src="${result.url}" alt="Uploaded image">
                    <div class="url-details">
                        <strong>${result.file}</strong>
                        <p class="url-text">${result.url}</p>
                    </div>
                    <div class="url-actions">
                        <button class="action-btn" onclick="enhancedCopyToClipboard('${result.url}', this)">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="scheduleDeletion('${result.publicId}', '${result.url}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    });
}

// Enhanced copy function with visual feedback
function enhancedCopyToClipboard(text, button = null) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('URL copied to clipboard!', 'success');
        
        if (button) {
            // Add visual feedback to the button
            const originalHtml = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = 'var(--success)';
            button.style.color = 'white';
            
            setTimeout(() => {
                button.innerHTML = originalHtml;
                button.style.background = '';
                button.style.color = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy URL', 'error');
    });
}

// Keep original function for backward compatibility
function copyToClipboard(text) {
    enhancedCopyToClipboard(text);
}

// Schedule image deletion from Cloudinary
function scheduleDeletion(publicId, url) {
    if (confirm("This image will be deleted from your local storage in 1 hour. The URL will stop working after deletion. Do you want to proceed?")) {
        // Calculate deletion time (1 hour from now)
        const deletionTime = new Date();
        deletionTime.setHours(deletionTime.getHours() + 1);
        
        // Save deletion request to localStorage
        const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
        deletionRequests.push({
            publicId: publicId,
            url: url,
            deletionTime: deletionTime.toISOString()
        });
        
        localStorage.setItem('deletionRequests', JSON.stringify(deletionRequests));
        
        // Update UI to show scheduled deletion
        updateDeletionUI(url, deletionTime);
        
        showToast('Image scheduled for deletion in 1 hour', 'success');
        
        // Set timeout for actual deletion
        setTimeout(() => {
            deleteImageFromCloudinary(publicId, url);
        }, 3600000); // 1 hour in milliseconds
    }
}

// Update UI to show scheduled deletion
function updateDeletionUI(url, deletionTime) {
    // Update in result container
    const urlItems = document.querySelectorAll('.url-item');
    urlItems.forEach(item => {
        const urlText = item.querySelector('.url-text');
        if (urlText && urlText.textContent === url) {
            const deleteBtn = item.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.innerHTML = '<i class="fas fa-clock"></i>';
                deleteBtn.title = `Scheduled for deletion at ${deletionTime.toLocaleString()}`;
                deleteBtn.onclick = null;
                deleteBtn.style.cursor = 'default';
                deleteBtn.style.background = 'var(--warning)';
                deleteBtn.style.color = 'white';
            }
            
            // Add deletion info
            const deletionInfo = document.createElement('p');
            deletionInfo.style.color = '#ff9e00';
            deletionInfo.style.fontSize = '0.9rem';
            deletionInfo.style.marginTop = '5px';
            deletionInfo.innerHTML = `<i class="fas fa-clock"></i> Scheduled for deletion at ${deletionTime.toLocaleString()}`;
            item.querySelector('.url-details').appendChild(deletionInfo);
        }
    });
    
    // Update in history modal if open
    const historyItems = document.querySelectorAll('#urlHistory .url-item');
    historyItems.forEach(item => {
        const urlText = item.querySelector('.url-text');
        if (urlText && urlText.textContent === url) {
            const deleteBtn = item.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.innerHTML = '<i class="fas fa-clock"></i>';
                deleteBtn.title = `Scheduled for deletion at ${deletionTime.toLocaleString()}`;
                deleteBtn.onclick = null;
                deleteBtn.style.cursor = 'default';
                deleteBtn.style.background = 'var(--warning)';
                deleteBtn.style.color = 'white';
            }
            
            // Add deletion info if not already present
            if (!item.querySelector('.deletion-info')) {
                const deletionInfo = document.createElement('p');
                deletionInfo.className = 'deletion-info';
                deletionInfo.style.color = '#ff9e00';
                deletionInfo.style.fontSize = '0.9rem';
                deletionInfo.style.marginTop = '5px';
                deletionInfo.innerHTML = `<i class="fas fa-clock"></i> Scheduled for deletion at ${deletionTime.toLocaleString()}`;
                item.querySelector('.url-details').appendChild(deletionInfo);
            }
        }
    });
}

// Delete image from Cloudinary via Worker
async function deleteImageFromCloudinary(publicId, url) {
    try {
        // Call your Worker to handle deletion
        const response = await fetch('https://cloud-config.kumar8948rahul.workers.dev/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                publicId: publicId,
                cloudName: CLOUD_NAME
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remove from deletion requests
            const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
            const updatedRequests = deletionRequests.filter(req => req.publicId !== publicId);
            localStorage.setItem('deletionRequests', JSON.stringify(updatedRequests));
            
            // Remove from history
            let history = JSON.parse(localStorage.getItem('imageUrls')) || [];
            history = history.filter(item => item.url !== url);
            localStorage.setItem('imageUrls', JSON.stringify(history));
            
            // Update UI
            removeImageFromUI(url);
            
            // Update history notification
            updateHistoryNotification();
            
            showToast('Image deleted successfully', 'success');
        } else {
            throw new Error(data.error || 'Failed to delete image');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Failed to delete image', 'error');
    }
}

// Remove image from UI
function removeImageFromUI(url) {
    // Remove from result container
    const urlItems = document.querySelectorAll('.url-item');
    urlItems.forEach(item => {
        const urlText = item.querySelector('.url-text');
        if (urlText && urlText.textContent === url) {
            item.remove();
        }
    });
    
    // Remove from history modal
    const historyItems = document.querySelectorAll('#urlHistory .url-item');
    historyItems.forEach(item => {
        const urlText = item.querySelector('.url-text');
        if (urlText && urlText.textContent === url) {
            item.remove();
        }
    });
    
    // If no items left, show empty state
    if (document.querySelectorAll('.url-item').length === 0) {
        resultContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-link"></i>
                <p>No URLs generated yet. Upload an image to get started!</p>
            </div>
        `;
    }
    
    if (document.querySelectorAll('#urlHistory .url-item').length === 0) {
        urlHistory.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No history yet. Upload some images to get started!</p>
            </div>
        `;
    }
}

// Check for scheduled deletions on page load
function checkScheduledDeletions() {
    const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
    const now = new Date();
    
    deletionRequests.forEach(request => {
        const deletionTime = new Date(request.deletionTime);
        
        if (deletionTime <= now) {
            // Time for deletion
            deleteImageFromCloudinary(request.publicId, request.url);
        } else {
            // Still waiting for deletion, update UI
            updateDeletionUI(request.url, deletionTime);
            
            // Set timeout for remaining time
            const timeRemaining = deletionTime - now;
            setTimeout(() => {
                deleteImageFromCloudinary(request.publicId, request.url);
            }, timeRemaining);
        }
    });
}

// Save URLs to local storage
function saveToHistory(results) {
    if (results.length === 0) return;
    
    let history = JSON.parse(localStorage.getItem('imageUrls')) || [];
    
    results.forEach(result => {
        // Avoid duplicates
        if (!history.some(item => item.url === result.url)) {
            history.unshift({
                url: result.url,
                name: result.file,
                publicId: result.publicId,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Keep only the last 50 items
    history = history.slice(0, 50);
    
    localStorage.setItem('imageUrls', JSON.stringify(history));
}

// Load history from local storage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('imageUrls')) || [];
    urlHistory.innerHTML = '';
    
    if (history.length === 0) {
        urlHistory.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No history yet. Upload some images to get started!</p>
            </div>
        `;
        return;
    }
    
    // Check for any scheduled deletions
    const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
    
    history.forEach(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleString();
        
        // Check if this image is scheduled for deletion
        const scheduledDeletion = deletionRequests.find(req => req.publicId === item.publicId);
        
        urlHistory.innerHTML += `
            <div class="url-item">
                <img src="${item.url}" alt="History image">
                <div class="url-details">
                    <strong>${item.name}</strong>
                    <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
                    ${scheduledDeletion ? 
                        `<p style="color: #ff9e00; font-size: 0.9rem; margin-top: 5px;">
                            <i class="fas fa-clock"></i> Scheduled for deletion at ${new Date(scheduledDeletion.deletionTime).toLocaleString()}
                        </p>` : 
                        ''}
                </div>
                <div class="url-actions">
                    <button class="action-btn" onclick="enhancedCopyToClipboard('${item.url}', this)">
                        <i class="fas fa-copy"></i>
                    </button>
                    ${scheduledDeletion ? 
                        `<button class="action-btn" title="Scheduled for deletion" style="cursor: default; background: var(--warning); color: white;">
                            <i class="fas fa-clock"></i>
                        </button>` : 
                        `<button class="action-btn delete-btn" onclick="scheduleDeletion('${item.publicId}', '${item.url}')">
                            <i class="fas fa-trash"></i>
                        </button>`}
                </div>
            </div>
        `;
    });
}

// Remove item from history
function removeFromHistory(url) {
    let history = JSON.parse(localStorage.getItem('imageUrls')) || [];
    history = history.filter(item => item.url !== url);
    localStorage.setItem('imageUrls', JSON.stringify(history));
    loadHistory();
    updateHistoryNotification();
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #e63946, #d90429)';
        toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span id="toastMessage">${message}</span>`;
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(135deg, #ff9e00, #ff9100)';
        toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span id="toastMessage">${message}</span>`;
    } else if (type === 'info') {
        toast.style.background = 'linear-gradient(135deg, #4cc9f0, #3a86ff)';
        toast.innerHTML = `<i class="fas fa-info-circle"></i> <span id="toastMessage">${message}</span>`;
    } else {
        toast.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span id="toastMessage">${message}</span>`;
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
