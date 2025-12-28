document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const config = {
        workerUrl: 'https://instagram-downloader.aarifalam.workers.dev',
        allowedDomains: ['aarifalam.life', 'aarifalam.pages.dev'],
        maxUrlLength: 500,
        instagramPatterns: [
            /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv|stories)\/([A-Za-z0-9_-]+)/i,
            /https?:\/\/(?:www\.)?instagram\.com\/stories\/[^\/]+\/(\d+)/i,
            /https?:\/\/instagr\.am\/(?:p|reel|tv|stories)\/([A-Za-z0-9_-]+)/i
        ]
    };

    const state = {
        isProcessing: false,
        currentVideoData: null,
        apiEndpoint: config.workerUrl,
        currentUrl: '',
        errorRetryCount: 0
    };

    const elements = {
        urlInput: document.getElementById('urlInput'),
        downloadBtn: document.getElementById('downloadBtn'),
        pasteBtn: document.getElementById('pasteBtn'),
        resultContainer: document.getElementById('resultContainer'),
        errorContainer: document.getElementById('errorContainer'),
        closeResult: document.getElementById('closeResult'),
        closeError: document.getElementById('closeError'),
        retryBtn: document.getElementById('retryBtn'),
        videoPreview: document.getElementById('videoPreview'),
        qualityLabel: document.getElementById('qualityLabel'),
        durationLabel: document.getElementById('durationLabel'),
        sizeLabel: document.getElementById('sizeLabel'),
        downloadVideoBtn: document.getElementById('downloadVideoBtn'),
        copyLinkBtn: document.getElementById('copyLinkBtn'),
        errorMessage: document.getElementById('errorMessage'),
        notification: document.getElementById('notification'),
        supportedFormats: document.querySelector('.supported-formats'),
        actionButtons: document.querySelector('.action-buttons')
    };

    function init() {
        setupEventListeners();
        validateDomain();
        setupInputValidation();
        setupKeyboardNavigation();
        elements.urlInput.focus();
        
        // Show initial notification
        setTimeout(() => {
            showNotification('✨ Welcome to AarifAlam Instagram Downloader!', 4000);
        }, 500);
    }

    function validateDomain() {
        const currentDomain = window.location.hostname;
        const isAllowed = config.allowedDomains.some(domain => 
            currentDomain === domain || currentDomain.endsWith('.' + domain)
        );
        
        if (!isAllowed) {
            elements.urlInput.disabled = true;
            elements.downloadBtn.disabled = true;
            showError('This tool only works on aarifalam.life and aarifalam.pages.dev');
            return false;
        }
        return true;
    }

    function setupEventListeners() {
        // Main download button
        elements.downloadBtn.addEventListener('click', handleDownloadRequest);
        
        // Paste button
        elements.pasteBtn.addEventListener('click', handlePaste);
        
        // Close buttons
        elements.closeResult.addEventListener('click', () => hideElement(elements.resultContainer));
        elements.closeError.addEventListener('click', () => hideElement(elements.errorContainer));
        
        // Retry button
        elements.retryBtn.addEventListener('click', handleRetry);
        
        // Download video button
        elements.downloadVideoBtn.addEventListener('click', handleVideoDownload);
        
        // Copy link button
        elements.copyLinkBtn.addEventListener('click', handleCopyLink);
        
        // Enter key on input
        elements.urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleDownloadRequest();
        });
        
        // Network status monitoring
        window.addEventListener('online', () => {
            showNotification('✅ You are back online', 2000);
        });
        
        window.addEventListener('offline', () => {
            showError('⚠️ You are offline. Please check your internet connection.');
        });
        
        // Click outside to close modals
        document.addEventListener('click', function(e) {
            if (!elements.resultContainer.classList.contains('hidden') && 
                !e.target.closest('.result-container') && 
                !e.target.closest('#downloadBtn')) {
                hideElement(elements.resultContainer);
            }
            
            if (!elements.errorContainer.classList.contains('hidden') && 
                !e.target.closest('.error-container') && 
                !e.target.closest('#downloadBtn')) {
                hideElement(elements.errorContainer);
            }
        });
    }

    function setupInputValidation() {
        elements.urlInput.addEventListener('input', function() {
            const url = this.value.trim();
            const isValid = validateInstagramUrl(url);
            
            if (url && isValid) {
                this.style.borderColor = '#10b981';
            } else if (url && !isValid) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '';
            }
            
            elements.downloadBtn.disabled = !isValid || state.isProcessing;
            updatePasteButtonState();
        });
        
        elements.urlInput.addEventListener('focus', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        
        elements.urlInput.addEventListener('blur', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    }

    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Escape to close modals
            if (e.key === 'Escape') {
                if (!elements.resultContainer.classList.contains('hidden')) {
                    hideElement(elements.resultContainer);
                    elements.urlInput.focus();
                }
                if (!elements.errorContainer.classList.contains('hidden')) {
                    hideElement(elements.errorContainer);
                    elements.urlInput.focus();
                }
            }
            
            // Ctrl+K to focus input
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                elements.urlInput.focus();
                elements.urlInput.select();
            }
            
            // Ctrl+V with focus check
            if (e.ctrlKey && e.key === 'v') {
                setTimeout(() => {
                    const url = elements.urlInput.value.trim();
                    if (validateInstagramUrl(url)) {
                        handleDownloadRequest();
                    }
                }, 100);
            }
        });
        
        // Accessibility
        elements.urlInput.setAttribute('aria-label', 'Instagram URL input field');
        elements.downloadBtn.setAttribute('aria-label', 'Get Instagram video');
        elements.downloadBtn.setAttribute('role', 'button');
        elements.pasteBtn.setAttribute('aria-label', 'Paste from clipboard');
    }

    function validateInstagramUrl(url) {
        if (!url || url.length > config.maxUrlLength) return false;
        
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
            
            return config.instagramPatterns.some(pattern => pattern.test(url));
        } catch {
            return false;
        }
    }

    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                elements.urlInput.value = text;
                elements.urlInput.dispatchEvent(new Event('input'));
                showNotification('📋 URL pasted from clipboard', 1500);
                elements.urlInput.focus();
                
                // Auto-validate after paste
                setTimeout(() => {
                    if (validateInstagramUrl(text)) {
                        handleDownloadRequest();
                    }
                }, 300);
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            
            // Fallback for older browsers
            if (navigator.userAgent.match(/ipad|iphone/i)) {
                showError('⚠️ Please long-press and paste in the input field');
            } else {
                showError('❌ Unable to access clipboard. Please paste manually.');
            }
        }
    }

    function updatePasteButtonState() {
        const hasText = elements.urlInput.value.trim().length > 0;
        elements.pasteBtn.innerHTML = hasText 
            ? '<i class="fas fa-redo"></i> Clear'
            : '<i class="fas fa-paste"></i> Paste';
        
        if (hasText) {
            elements.pasteBtn.onclick = () => {
                elements.urlInput.value = '';
                elements.urlInput.dispatchEvent(new Event('input'));
                showNotification('✏️ Input cleared', 1000);
                elements.urlInput.focus();
            };
        } else {
            elements.pasteBtn.onclick = handlePaste;
        }
    }

    async function handleDownloadRequest() {
        const url = elements.urlInput.value.trim();
        state.currentUrl = url;
        
        if (!validateInstagramUrl(url)) {
            showError('❌ Please enter a valid Instagram URL\n\nExamples:\n• https://instagram.com/p/ABC123\n• https://instagram.com/reel/XYZ456\n• https://instagram.com/stories/user/789');
            elements.urlInput.focus();
            return;
        }
        
        if (state.isProcessing) return;
        
        state.isProcessing = true;
        state.errorRetryCount = 0;
        updateUIState(true);
        hideElement(elements.errorContainer);
        
        try {
            showNotification('⏳ Fetching video data from Instagram...', 2000);
            
            const videoData = await fetchVideoData(url);
            
            if (videoData.success) {
                displayVideoResult(videoData);
                showNotification('✅ Video ready for download!', 3000);
            } else {
                throw new Error(videoData.error || 'Failed to extract video');
            }
            
        } catch (error) {
            console.error('Download error:', error);
            
            // Check for specific error types
            if (error.message.includes('network') || error.message.includes('fetch')) {
                showError('🌐 Network error. Please check your internet connection and try again.');
            } else if (error.message.includes('private') || error.message.includes('login')) {
                showError('🔒 This video is private or requires login. Only public videos can be downloaded.');
            } else if (error.message.includes('not found') || error.message.includes('404')) {
                showError('🔍 Video not found. The link might be broken or the video was removed.');
            } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
                showError('⏰ Rate limited. Please wait a few minutes before trying again.');
            } else {
                showError(`❌ ${error.message || 'Failed to fetch video. Please try again.'}`);
            }
            
            state.errorRetryCount++;
            
            // Auto-retry logic for network errors
            if (state.errorRetryCount < 2 && navigator.onLine) {
                setTimeout(() => {
                    if (validateInstagramUrl(state.currentUrl)) {
                        handleDownloadRequest();
                    }
                }, 2000);
            }
        } finally {
            state.isProcessing = false;
            updateUIState(false);
        }
    }

    function updateUIState(isLoading) {
        if (isLoading) {
            elements.downloadBtn.classList.add('loading');
            elements.downloadBtn.disabled = true;
            elements.urlInput.disabled = true;
            elements.pasteBtn.disabled = true;
            elements.downloadBtn.setAttribute('aria-busy', 'true');
            elements.downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            elements.downloadBtn.classList.remove('loading');
            elements.urlInput.disabled = false;
            elements.pasteBtn.disabled = false;
            elements.downloadBtn.setAttribute('aria-busy', 'false');
            
            const isValid = validateInstagramUrl(elements.urlInput.value.trim());
            elements.downloadBtn.disabled = !isValid;
            elements.downloadBtn.innerHTML = '<i class="fas fa-download"></i> Get Video';
        }
    }

    async function fetchVideoData(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
            const response = await fetch(state.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({ 
                    url: url,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent.slice(0, 100)
                }),
                signal: controller.signal,
                mode: 'cors',
                credentials: 'omit'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Server error: ${response.status}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. The server is taking too long to respond.');
            }
            throw error;
        }
    }

    function displayVideoResult(videoData) {
        state.currentVideoData = videoData;
        
        // Format quality text
        const dimensions = videoData.dimensions || {};
        const qualityText = dimensions.height && dimensions.width 
            ? `${dimensions.height}p (${dimensions.width}×${dimensions.height})`
            : videoData.quality || 'HD';
        
        // Format duration
        const durationText = videoData.duration 
            ? formatDuration(videoData.duration)
            : 'Loading...';
        
        // Format file size
        const sizeText = videoData.size 
            ? formatFileSize(videoData.size)
            : 'Calculating...';
        
        // Update UI
        elements.qualityLabel.textContent = qualityText;
        elements.durationLabel.textContent = durationText;
        elements.sizeLabel.textContent = sizeText;
        elements.qualityLabel.style.color = '#10b981';
        elements.durationLabel.style.color = '#10b981';
        elements.sizeLabel.style.color = '#10b981';
        
        // Update video preview
        updateVideoPreview(videoData);
        
        // Update download button with filename
        const filename = generateFilename(videoData);
        elements.downloadVideoBtn.setAttribute('download', filename);
        elements.downloadVideoBtn.setAttribute('title', `Download: ${filename}`);
        
        // Show result container with animation
        showElement(elements.resultContainer);
        
        // Smooth scroll to result if needed
        if (window.innerWidth < 768) {
            elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Focus on download button for accessibility
        setTimeout(() => {
            elements.downloadVideoBtn.focus();
        }, 300);
    }

    function updateVideoPreview(videoData) {
        elements.videoPreview.innerHTML = '';
        
        // Create video element for preview
        const video = document.createElement('video');
        video.src = videoData.videoUrl;
        video.controls = true;
        video.preload = 'metadata';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.borderRadius = 'var(--radius-lg)';
        video.style.backgroundColor = '#000';
        video.setAttribute('title', 'Instagram Video Preview');
        video.setAttribute('playsinline', '');
        
        // Add loading state
        video.addEventListener('waiting', () => {
            elements.videoPreview.innerHTML = `
                <div class="preview-placeholder" style="text-align: center; padding: 2rem;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p style="color: #64748b; font-weight: 500;">Loading preview...</p>
                </div>
            `;
        });
        
        video.addEventListener('canplay', () => {
            elements.videoPreview.innerHTML = '';
            elements.videoPreview.appendChild(video);
        });
        
        video.addEventListener('error', () => {
            // Fallback to thumbnail
            if (videoData.thumbnail) {
                const img = document.createElement('img');
                img.src = videoData.thumbnail;
                img.alt = 'Video thumbnail';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = 'var(--radius-lg)';
                elements.videoPreview.appendChild(img);
            } else {
                elements.videoPreview.innerHTML = `
                    <div class="preview-placeholder">
                        <i class="fas fa-film" style="font-size: 3rem; color: #94a3b8;"></i>
                        <p style="margin-top: 1rem; color: #64748b;">Preview not available</p>
                    </div>
                `;
            }
        });
        
        // Try to load video
        video.load();
    }

    async function handleVideoDownload() {
        if (!state.currentVideoData) return;
        
        try {
            // Show loading state on download button
            const originalHTML = elements.downloadVideoBtn.innerHTML;
            elements.downloadVideoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
            elements.downloadVideoBtn.disabled = true;
            elements.copyLinkBtn.disabled = true;
            
            showNotification('⏳ Starting download...', 2000);
            
            // Create a hidden iframe for download
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = state.currentVideoData.videoUrl;
            document.body.appendChild(iframe);
            
            // Also provide direct download link
            const a = document.createElement('a');
            a.href = state.currentVideoData.videoUrl;
            a.download = generateFilename(state.currentVideoData);
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Track download
            trackDownload(state.currentVideoData);
            
            // Success notification
            showNotification('✅ Download started! Check your downloads folder.', 3000);
            
            // Re-enable buttons after delay
            setTimeout(() => {
                elements.downloadVideoBtn.innerHTML = originalHTML;
                elements.downloadVideoBtn.disabled = false;
                elements.copyLinkBtn.disabled = false;
            }, 1500);
            
        } catch (error) {
            console.error('Download failed:', error);
            
            // Fallback: Copy link to clipboard and show instructions
            try {
                await navigator.clipboard.writeText(state.currentVideoData.videoUrl);
                showNotification('📋 Video link copied! Paste in browser to download.', 4000);
            } catch {
                showError('❌ Could not start download. Please try:\n1. Right-click the "Copy Link" button\n2. Select "Save link as..."\n3. Save the video file');
            }
            
            // Reset button state
            elements.downloadVideoBtn.innerHTML = '<i class="fas fa-download"></i> Download Video';
            elements.downloadVideoBtn.disabled = false;
            elements.copyLinkBtn.disabled = false;
        }
    }

    async function handleCopyLink() {
        if (!state.currentVideoData) return;
        
        try {
            await navigator.clipboard.writeText(state.currentVideoData.videoUrl);
            
            // Visual feedback
            const originalHTML = elements.copyLinkBtn.innerHTML;
            elements.copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            elements.copyLinkBtn.style.background = '#10b981';
            elements.copyLinkBtn.style.color = 'white';
            elements.copyLinkBtn.style.borderColor = '#10b981';
            
            showNotification('📋 Video link copied to clipboard!', 2000);
            
            // Reset button after delay
            setTimeout(() => {
                elements.copyLinkBtn.innerHTML = originalHTML;
                elements.copyLinkBtn.style.background = '';
                elements.copyLinkBtn.style.color = '';
                elements.copyLinkBtn.style.borderColor = '';
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy:', err);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = state.currentVideoData.videoUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification('📋 Link copied (fallback method)', 2000);
            } catch {
                showError('❌ Failed to copy link. Please copy manually from below:');
                
                // Show link in error message for manual copy
                elements.errorMessage.innerHTML = `
                    Copy this link manually:<br>
                    <code style="background: #f1f5f9; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem; display: inline-block; max-width: 100%; overflow-x: auto;">
                        ${state.currentVideoData.videoUrl.slice(0, 100)}...
                    </code>
                `;
                showElement(elements.errorContainer);
            }
            document.body.removeChild(textArea);
        }
    }

    function handleRetry() {
        hideElement(elements.errorContainer);
        elements.urlInput.focus();
        elements.urlInput.select();
        
        if (state.currentUrl && validateInstagramUrl(state.currentUrl)) {
            setTimeout(() => {
                handleDownloadRequest();
            }, 500);
        }
    }

    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.whiteSpace = 'pre-line';
        showElement(elements.errorContainer);
        
        // Add retry button if we have a valid URL
        if (state.currentUrl && validateInstagramUrl(state.currentUrl)) {
            elements.retryBtn.style.display = 'inline-flex';
        } else {
            elements.retryBtn.style.display = 'none';
        }
        
        // Focus on retry button or input
        setTimeout(() => {
            if (elements.retryBtn.style.display !== 'none') {
                elements.retryBtn.focus();
            } else {
                elements.urlInput.focus();
            }
        }, 100);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (!elements.errorContainer.classList.contains('hidden')) {
                hideElement(elements.errorContainer);
            }
        }, 10000);
    }

    function showElement(element) {
        element.classList.remove('hidden');
        element.style.display = 'block';
        element.setAttribute('aria-hidden', 'false');
        
        // Add fade-in animation
        element.style.animation = 'fadeInUp 0.3s ease-out';
    }

    function hideElement(element) {
        element.classList.add('hidden');
        element.setAttribute('aria-hidden', 'true');
    }

    function showNotification(message, duration = 3000) {
        // Update notification content with icon if not present
        if (!message.includes('✨') && !message.includes('✅') && !message.includes('⚠️') && 
            !message.includes('❌') && !message.includes('⏳') && !message.includes('📋')) {
            message = '💡 ' + message;
        }
        
        elements.notification.innerHTML = `
            <i class="fas fa-info-circle" style="color: #6366f1; font-size: 1.2rem;"></i>
            <span>${message}</span>
        `;
        elements.notification.classList.add('show');
        
        // Add animation
        elements.notification.style.animation = 'fadeInUp 0.3s ease-out';
        
        // Auto-hide
        const timeoutId = setTimeout(() => {
            elements.notification.classList.remove('show');
        }, duration);
        
        // Keep notification on hover
        elements.notification.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });
        
        elements.notification.addEventListener('mouseleave', () => {
            setTimeout(() => {
                elements.notification.classList.remove('show');
            }, 1000);
        });
    }

    function generateFilename(videoData) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        
        let quality = 'HD';
        if (videoData.dimensions && videoData.dimensions.height) {
            quality = `${videoData.dimensions.height}p`;
        } else if (videoData.quality) {
            quality = videoData.quality.replace(/\s+/g, '-');
        }
        
        return `instagram_${dateStr}_${timeStr}_${quality}.mp4`;
    }

    function formatDuration(seconds) {
        if (!seconds || seconds <= 0) return 'Unknown';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes <= 0) return 'Unknown';
        
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    }

    function trackDownload(videoData) {
        const trackingData = {
            timestamp: new Date().toISOString(),
            quality: videoData.quality,
            dimensions: videoData.dimensions,
            duration: videoData.duration,
            size: videoData.size,
            source: window.location.hostname,
            userAgent: navigator.userAgent.slice(0, 100)
        };
        
        console.log('📊 Download tracked:', trackingData);
        
        // Send beacon if available
        if (navigator.sendBeacon) {
            try {
                navigator.sendBeacon(`${config.workerUrl}/track`, JSON.stringify(trackingData));
            } catch (e) {
                console.log('Beacon sending failed:', e);
            }
        }
    }

    // Add CSS for spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .preview-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #64748b;
        }
        
        code {
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
    `;
    document.head.appendChild(style);

    // Initialize the application
    init();
});
