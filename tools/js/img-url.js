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

// Store selected files
let selectedFiles = [];

// Daily upload limit
const DAILY_UPLOAD_LIMIT = 20;

// Initialize from local storage
document.addEventListener('DOMContentLoaded', () => {
    loadCloudinaryConfig();
    loadHistory();
    checkScheduledDeletions();
    addPulseAnimation();
    addScrollToTopButton();
    initializeHistoryNotification();
});

// ========== CLOUDINARY CONFIG LOADING ==========
function loadCloudinaryConfig() {
    // Load config from your Worker
    fetch('https://cloud-config.kumar8948rahul.workers.dev/', {
        mode: 'cors',
        credentials: 'omit'
    })
    .then(res => {
        if (!res.ok) {
            if (res.status === 403) {
                throw new Error('Access denied: This tool only works on authorized domains. Please contact aarifalam0105@gmail.com');
            }
            throw new Error('Failed to fetch config from Worker');
        }
        return res.json();
    })
    .then(data => {
        if (data.cloudName && data.uploadPreset && data.apiKey) {
            CLOUD_NAME = data.cloudName;
            UPLOAD_PRESET = data.uploadPreset;
            API_KEY = data.apiKey;
            console.log("Cloudinary config loaded from Worker:", CLOUD_NAME);
        } else {
            throw new Error('Invalid config received from Worker');
        }
    })
    .catch(err => {
        console.error("Failed to load Cloudinary config:", err);
        showToast('Failed to load Cloudinary configuration. Please refresh the page.', 'error');
    });
}

// ========== HISTORY NOTIFICATION SYSTEM ==========
function initializeHistoryNotification() {
    updateHistoryNotification();
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

function showHistoryNotification() {
    historyBtn.classList.add('has-history');
}

historyBtn.addEventListener('click', () => {
    historyBtn.classList.remove('has-history');
    historyModal.style.display = 'flex';
    loadHistory();
});

closeModal.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// ========== FILE HANDLING ==========
fileInput.addEventListener('change', handleFileSelect);

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.03)';
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '#4361ee';
    dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.03)';
    dropArea.classList.remove('dragover');
    
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});

uploadBtn.addEventListener('click', uploadImagesWithAnimation);

window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.style.display = 'none';
    }
});

// ========== UPLOAD LIMIT CHECKING ==========
function checkDailyUploadLimit() {
    const today = new Date().toDateString();
    const uploads = JSON.parse(localStorage.getItem('dailyUploads') || '{}');
    
    if (!uploads[today]) {
        uploads[today] = 0;
        localStorage.setItem('dailyUploads', JSON.stringify(uploads));
    }
    
    return uploads[today];
}

function incrementDailyUploadCount(count) {
    const today = new Date().toDateString();
    const uploads = JSON.parse(localStorage.getItem('dailyUploads') || '{}');
    
    if (!uploads[today]) {
        uploads[today] = 0;
    }
    
    uploads[today] += count;
    localStorage.setItem('dailyUploads', JSON.stringify(uploads));
}

function handleFileSelect(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    const fileList = Array.from(files);
    
    // Check daily upload limit
    const todayUploads = checkDailyUploadLimit();
    const remainingUploads = DAILY_UPLOAD_LIMIT - todayUploads;
    
    if (fileList.length > remainingUploads) {
        showToast(`Daily limit exceeded! You can only upload ${remainingUploads} more image(s) today.`, 'error');
        if (remainingUploads > 0) {
            // Add only allowed number of files
            selectedFiles = [...selectedFiles, ...fileList.slice(0, remainingUploads)];
        }
    } else {
        // Add all files
        selectedFiles = [...selectedFiles, ...fileList];
    }
    
    updatePreviews();
    
    const remainingAfterAdd = DAILY_UPLOAD_LIMIT - (todayUploads + selectedFiles.length);
    if (selectedFiles.length > 0) {
        showToast(`${selectedFiles.length} image(s) selected (${remainingAfterAdd} remaining today)`, 'success');
    }
}

function updatePreviews() {
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
}

function removePreview(index) {
    selectedFiles.splice(index, 1);
    updatePreviews();
    
    if (selectedFiles.length === 0) {
        showToast('All images removed', 'info');
    } else {
        showToast(`${selectedFiles.length} image(s) remaining`, 'success');
    }
}

// ========== ANIMATIONS & UI ==========
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

function scrollToResults() {
    const resultsSection = document.querySelector('.main-content .card:nth-child(2)');
    if (resultsSection) {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
        
        resultsSection.style.transition = 'all 0.5s ease';
        resultsSection.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.3)';
        
        setTimeout(() => {
            resultsSection.style.boxShadow = '';
        }, 1500);
    }
}

function highlightCopyButtons() {
    const copyButtons = document.querySelectorAll('.action-btn, .copy-btn');
    copyButtons.forEach(button => {
        button.style.animation = 'pulse 2s infinite';
    });
    
    setTimeout(() => {
        copyButtons.forEach(button => {
            button.style.animation = '';
        });
    }, 5000);
}

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

function addScrollToTopButton() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.style.position = 'fixed';
    scrollToTopBtn.style.bottom = '100px';
    scrollToTopBtn.style.right = '30px';
    scrollToTopBtn.style.width = '50px';
    scrollToTopBtn.style.height = '50px';
    scrollToTopBtn.style.borderRadius = '50%';
    scrollToTopBtn.style.background = 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)';
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
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
}

// ========== MAIN UPLOAD FUNCTION ==========
async function uploadImagesWithAnimation() {
    // Check daily upload limit
    const todayUploads = checkDailyUploadLimit();
    if (todayUploads >= DAILY_UPLOAD_LIMIT) {
        showToast(`Daily upload limit reached! You can upload ${DAILY_UPLOAD_LIMIT} images per day.`, 'error');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showToast('Please select at least one image first', 'error');
        return;
    }
    
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        showToast('Cloudinary configuration not loaded. Please refresh the page.', 'error');
        return;
    }
    
    // Check if upload would exceed daily limit
    if (todayUploads + selectedFiles.length > DAILY_UPLOAD_LIMIT) {
        const remaining = DAILY_UPLOAD_LIMIT - todayUploads;
        showToast(`You can only upload ${remaining} more image(s) today.`, 'error');
        return;
    }
    
    uploadBtn.classList.add('processing');
    uploadBtn.disabled = true;
    
    animateProgressBar();
    resultContainer.innerHTML = '';
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
            
            progressBar.style.width = `${((i + 1) / selectedFiles.length) * 100}%`;
            
        } catch (error) {
            console.error('Error uploading image:', error);
            results.push({ file: file.name, error: error.message });
        }
    }
    
    displayResults(results);
    
    const successfulUploads = results.filter(r => !r.error);
    if (successfulUploads.length > 0) {
        saveToHistory(successfulUploads);
        showHistoryNotification();
        incrementDailyUploadCount(successfulUploads.length);
    }
    
    selectedFiles = [];
    imagePreviews.innerHTML = '';
    
    uploadBtn.classList.remove('processing');
    uploadBtn.disabled = false;
    
    setTimeout(() => {
        scrollToResults();
        highlightCopyButtons();
    }, 500);
    
    const successfulCount = successfulUploads.length;
    const failedCount = results.length - successfulCount;
    
    let message = 'Upload completed! ';
    if (successfulCount > 0) message += `${successfulCount} image(s) uploaded successfully. `;
    if (failedCount > 0) message += `${failedCount} image(s) failed.`;
    
    showToast(message, successfulCount > 0 ? 'success' : 'error');
}

// ========== RESULTS DISPLAY ==========
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

// ========== CLIPBOARD FUNCTIONS ==========
function enhancedCopyToClipboard(text, button = null) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('URL copied to clipboard!', 'success');
        
        if (button) {
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

function copyToClipboard(text) {
    enhancedCopyToClipboard(text);
}

// ========== DELETION FUNCTIONS ==========
function scheduleDeletion(publicId, url) {
    if (confirm("This image will be deleted from Cloudinary in 1 hour. The URL will stop working after deletion. Do you want to proceed?")) {
        const deletionTime = new Date();
        deletionTime.setHours(deletionTime.getHours() + 1);
        
        const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
        deletionRequests.push({
            publicId: publicId,
            url: url,
            deletionTime: deletionTime.toISOString()
        });
        
        localStorage.setItem('deletionRequests', JSON.stringify(deletionRequests));
        
        updateDeletionUI(url, deletionTime);
        
        showToast('Image scheduled for deletion in 1 hour', 'success');
        
        setTimeout(() => {
            deleteImageFromCloudinary(publicId, url);
        }, 3600000);
    }
}

function updateDeletionUI(url, deletionTime) {
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
            
            const deletionInfo = document.createElement('p');
            deletionInfo.style.color = '#ff9e00';
            deletionInfo.style.fontSize = '0.9rem';
            deletionInfo.style.marginTop = '5px';
            deletionInfo.innerHTML = `<i class="fas fa-clock"></i> Scheduled for deletion at ${deletionTime.toLocaleString()}`;
            item.querySelector('.url-details').appendChild(deletionInfo);
        }
    });
    
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
            
            removeImageFromUI(url);
            updateHistoryNotification();
            
            showToast('Image deleted successfully from Cloudinary', 'success');
        } else {
            throw new Error(data.error || 'Failed to delete image');
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Failed to delete image: ' + error.message, 'error');
    }
}

function removeImageFromUI(url) {
    const urlItems = document.querySelectorAll('.url-item');
    urlItems.forEach(item => {
        const urlText = item.querySelector('.url-text');
        if (urlText && urlText.textContent === url) {
            item.remove();
        }
    });
    
    const historyItems = document.querySelectorAll('#urlHistory .url-item');
    historyItems.forEach(item => {
        const urlText = item.querySelector('.url-text');
        if (urlText && urlText.textContent === url) {
            item.remove();
        }
    });
    
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

function checkScheduledDeletions() {
    const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
    const now = new Date();
    
    deletionRequests.forEach(request => {
        const deletionTime = new Date(request.deletionTime);
        
        if (deletionTime <= now) {
            deleteImageFromCloudinary(request.publicId, request.url);
        } else {
            updateDeletionUI(request.url, deletionTime);
            
            const timeRemaining = deletionTime - now;
            setTimeout(() => {
                deleteImageFromCloudinary(request.publicId, request.url);
            }, timeRemaining);
        }
    });
}

// ========== HISTORY FUNCTIONS ==========
function saveToHistory(results) {
    if (results.length === 0) return;
    
    let history = JSON.parse(localStorage.getItem('imageUrls')) || [];
    
    results.forEach(result => {
        if (!history.some(item => item.url === result.url)) {
            history.unshift({
                url: result.url,
                name: result.file,
                publicId: result.publicId,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    history = history.slice(0, 50);
    localStorage.setItem('imageUrls', JSON.stringify(history));
}

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
    
    const deletionRequests = JSON.parse(localStorage.getItem('deletionRequests')) || [];
    
    history.forEach(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleString();
        
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

function removeFromHistory(url) {
    let history = JSON.parse(localStorage.getItem('imageUrls')) || [];
    history = history.filter(item => item.url !== url);
    localStorage.setItem('imageUrls', JSON.stringify(history));
    loadHistory();
    updateHistoryNotification();
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    switch(type) {
        case 'error':
            toast.style.background = 'linear-gradient(135deg, #e63946, #d90429)';
            toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span id="toastMessage">${message}</span>`;
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(135deg, #ff9e00, #ff9100)';
            toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span id="toastMessage">${message}</span>`;
            break;
        case 'info':
            toast.style.background = 'linear-gradient(135deg, #4cc9f0, #3a86ff)';
            toast.innerHTML = `<i class="fas fa-info-circle"></i> <span id="toastMessage">${message}</span>`;
            break;
        default:
            toast.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
            toast.innerHTML = `<i class="fas fa-check-circle"></i> <span id="toastMessage">${message}</span>`;
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
