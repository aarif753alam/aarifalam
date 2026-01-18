// insta-download.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const pasteBtn = document.getElementById('pasteBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const closeResult = document.getElementById('closeResult');
    const closeError = document.getElementById('closeError');
    const retryBtn = document.getElementById('retryBtn');
    const videoPreview = document.getElementById('videoPreview');
    const qualityLabel = document.getElementById('qualityLabel');
    const durationLabel = document.getElementById('durationLabel');
    const sizeLabel = document.getElementById('sizeLabel');
    const downloadVideoBtn = document.getElementById('downloadVideoBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const notification = document.getElementById('notification');
    const errorMessage = document.getElementById('errorMessage');
    
    // Worker URLs (fallback options)
    const WORKER_URLS = [
        'https://instagram-downloader.aarifalam0105.workers.dev/',
        'https://your-backup-worker.workers.dev/' // Add backup worker if needed
    ];
    
    // State
    let currentVideoData = null;
    let isProcessing = false;
    let retryCount = 0;
    const MAX_RETRIES = 2;
    const CACHE_KEY = 'insta_video_cache';
    const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

    // Initialize
    init();

    function init() {
        setupEventListeners();
        checkClipboardPermission();
        loadFromLocalStorage();
        setupServiceWorker();
    }

    function setupEventListeners() {
        // Paste button
        pasteBtn.addEventListener('click', handlePaste);
        
        // Download button
        downloadBtn.addEventListener('click', handleDownload);
        
        // Enter key in input
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleDownload();
            }
        });
        
        // Input validation on change
        urlInput.addEventListener('input', validateUrlInput);
        
        // Close buttons
        closeResult.addEventListener('click', () => {
            resultContainer.classList.add('hidden');
        });
        
        closeError.addEventListener('click', () => {
            errorContainer.classList.add('hidden');
        });
        
        // Retry button
        retryBtn.addEventListener('click', () => {
            errorContainer.classList.add('hidden');
            handleDownload();
        });
        
        // Copy link button
        copyLinkBtn.addEventListener('click', handleCopyLink);
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                resultContainer.classList.add('hidden');
                errorContainer.classList.add('hidden');
            }
        });
        
        // Auto-focus input on page load
        setTimeout(() => urlInput.focus(), 100);
        
        // Check URL in input field on page load
        if (urlInput.value.trim()) {
            validateUrlInput();
        }
    }

    function checkClipboardPermission() {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({name: 'clipboard-read'}).then(result => {
                if (result.state === 'granted' || result.state === 'prompt') {
                    pasteBtn.disabled = false;
                }
            });
        }
    }

    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text.trim();
                urlInput.focus();
                showNotification('URL pasted from clipboard', 'success');
                validateUrlInput();
                
                // Auto-detect Instagram URL and trigger download
                if (isValidInstagramUrl(text.trim())) {
                    setTimeout(() => {
                        if (confirm('Instagram URL detected! Do you want to download the video?')) {
                            handleDownload();
                        }
                    }, 500);
                }
            }
        } catch (err) {
            console.log('Clipboard API not available, using fallback');
            urlInput.focus();
            document.execCommand('paste');
            showNotification('URL pasted', 'success');
            validateUrlInput();
        }
    }

    function validateUrlInput() {
        const url = urlInput.value.trim();
        const isValid = isValidInstagramUrl(url);
        
        if (url && isValid) {
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('disabled');
            urlInput.classList.remove('error');
        } else if (url && !isValid) {
            urlInput.classList.add('error');
            downloadBtn.disabled = true;
            downloadBtn.classList.add('disabled');
        } else {
            urlInput.classList.remove('error');
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('disabled');
        }
        
        return isValid;
    }

    function isValidInstagramUrl(url) {
        if (!url) return false;
        
        const cleanedUrl = cleanInstagramUrl(url.trim());
        
        const patterns = [
            /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/i,
            /^https?:\/\/(www\.)?instagram\.com\/stories\/[^/]+\/\d+\/?/i,
            /^https?:\/\/(www\.)?instagram\.com\/[^/]+\/reel\/[A-Za-z0-9_-]+\/?/i,
            /^https?:\/\/instagr\.am\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?/i
        ];
        
        return patterns.some(pattern => pattern.test(cleanedUrl));
    }

    function cleanInstagramUrl(url) {
        try {
            // Remove tracking parameters
            const urlObj = new URL(url);
            const paramsToRemove = [
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'igsh', 'igs', 'igshid', '__tn__', 'e', 'share_sheet',
                'fbclid', 'd', 'm', 's', 't', 'hl', 'app'
            ];
            
            paramsToRemove.forEach(param => {
                urlObj.searchParams.delete(param);
            });
            
            // Keep only pathname for Instagram posts
            if (urlObj.pathname.includes('/p/') || urlObj.pathname.includes('/reel/') || urlObj.pathname.includes('/tv/')) {
                return `${urlObj.origin}${urlObj.pathname}`;
            }
            
            return urlObj.toString();
        } catch {
            return url;
        }
    }

    async function handleDownload() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter an Instagram URL');
            urlInput.focus();
            return;
        }
        
        if (!isValidInstagramUrl(url)) {
            showError('Please enter a valid Instagram URL. Supported formats:\n• Posts: instagram.com/p/...\n• Reels: instagram.com/reel/...\n• Stories: instagram.com/stories/...\n• IGTV: instagram.com/tv/...');
            urlInput.classList.add('error');
            urlInput.focus();
            return;
        }
        
        if (isProcessing) return;
        
        // Clean URL
        const cleanUrl = cleanInstagramUrl(url);
        urlInput.value = cleanUrl;
        
        // Save to local storage
        saveToLocalStorage(cleanUrl);
        
        // Check cache first
        const cachedData = getFromCache(cleanUrl);
        if (cachedData) {
            currentVideoData = cachedData;
            displayResult(cachedData);
            showNotification('Loaded from cache', 'info');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        // Hide previous results/errors
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        
        try {
            // Call worker API with retry logic
            const videoData = await fetchVideoDataWithRetry(cleanUrl);
            
            if (videoData.success) {
                currentVideoData = videoData;
                saveToCache(cleanUrl, videoData);
                displayResult(videoData);
                trackSuccess(cleanUrl);
            } else {
                throw new Error(videoData.error || 'Instagram video not found or private');
            }
        } catch (error) {
            console.error('Download error:', error);
            
            // User-friendly error messages
            let errorMsg = error.message;
            
            if (error.message.includes('Network error') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                errorMsg = 'Please check your internet connection and try again.';
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                errorMsg = 'Video not found. It may have been removed or is private.';
            } else if (error.message.includes('timeout')) {
                errorMsg = 'Request timeout. Instagram might be slow. Please try again.';
            } else if (error.message.includes('403') || error.message.includes('blocked')) {
                errorMsg = 'Access blocked. Try again in a few minutes.';
            } else if (error.message.includes('500') || error.message.includes('Internal server')) {
                errorMsg = 'Server error. Please try again later.';
            } else if (error.message.includes('Invalid Instagram URL')) {
                errorMsg = 'Invalid Instagram URL. Please check the link and try again.';
            }
            
            showError(errorMsg);
        } finally {
            setLoadingState(false);
            retryCount = 0;
        }
    }

    async function fetchVideoDataWithRetry(url, retryIndex = 0) {
        try {
            const workerUrl = WORKER_URLS[retryIndex % WORKER_URLS.length];
            return await fetchVideoData(url, workerUrl);
        } catch (error) {
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                showNotification(`Retrying... (${retryCount}/${MAX_RETRIES})`, 'info');
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                return fetchVideoDataWithRetry(url, retryIndex + 1);
            }
            throw error;
        }
    }

    async function fetchVideoData(url, workerUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
        
        try {
            const response = await fetch(workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ url: url }),
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const statusText = response.statusText || 'Unknown error';
                throw new Error(`Server returned ${response.status}: ${statusText}`);
            }
            
            const data = await response.json();
            
            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response from server');
            }
            
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Enhanced error handling
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Instagram might be slow or the video is too large.');
            }
            
            if (error.name === 'TypeError') {
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    throw new Error('Network error. Please check your internet connection.');
                }
                if (error.message.includes('Failed to parse')) {
                    throw new Error('Failed to process Instagram response.');
                }
            }
            
            throw error;
        }
    }

    function displayResult(videoData) {
        // Update video info with fallbacks
        qualityLabel.textContent = videoData.quality || 'HD';
        durationLabel.textContent = formatDuration(videoData.duration || 0);
        sizeLabel.textContent = formatFileSize(videoData.size || 0);
        
        // Set download link
        if (videoData.videoUrl) {
            const filename = generateFilename(videoData);
            downloadVideoBtn.href = videoData.videoUrl;
            downloadVideoBtn.download = filename;
            downloadVideoBtn.setAttribute('download', filename);
            
            // Create video preview
            createVideoPreview(videoData);
        }
        
        // Show alternative URLs if available
        if (videoData.alternativeUrls && videoData.alternativeUrls.length > 0) {
            createAlternativeDownloads(videoData.alternativeUrls);
        }
        
        // Show result container
        resultContainer.classList.remove('hidden');
        
        // Scroll to result smoothly
        setTimeout(() => {
            resultContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);
        
        // Auto-focus download button for accessibility
        setTimeout(() => {
            downloadVideoBtn.focus();
        }, 350);
    }

    function createVideoPreview(videoData) {
        videoPreview.innerHTML = '';
        
        if (videoData.thumbnail) {
            // Create thumbnail with play button
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'thumbnail-container';
            thumbnailContainer.style.cursor = 'pointer';
            thumbnailContainer.title = 'Click to preview video';
            
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = videoData.thumbnail;
            thumbnailImg.alt = 'Video thumbnail';
            thumbnailImg.className = 'thumbnail-image';
            thumbnailImg.loading = 'lazy';
            thumbnailImg.style.width = '100%';
            thumbnailImg.style.borderRadius = '8px';
            
            const playButton = document.createElement('div');
            playButton.className = 'play-button';
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.style.position = 'absolute';
            playButton.style.top = '50%';
            playButton.style.left = '50%';
            playButton.style.transform = 'translate(-50%, -50%)';
            playButton.style.width = '60px';
            playButton.style.height = '60px';
            playButton.style.background = 'rgba(225, 48, 108, 0.9)';
            playButton.style.borderRadius = '50%';
            playButton.style.display = 'flex';
            playButton.style.alignItems = 'center';
            playButton.style.justifyContent = 'center';
            playButton.style.color = 'white';
            playButton.style.fontSize = '24px';
            
            thumbnailContainer.appendChild(thumbnailImg);
            thumbnailContainer.appendChild(playButton);
            videoPreview.appendChild(thumbnailContainer);
            
            // Add click event to show video player
            thumbnailContainer.addEventListener('click', () => {
                showVideoPlayer(videoData.videoUrl);
            });
            
            // Preload video for better UX
            preloadVideo(videoData.videoUrl);
            
        } else {
            // Fallback to simple preview
            videoPreview.innerHTML = `
                <div class="preview-placeholder" style="text-align: center; padding: 40px 20px; color: #666;">
                    <i class="fas fa-film" style="font-size: 48px; margin-bottom: 10px; color: #ddd;"></i>
                    <p style="margin-bottom: 15px;">Video preview available after download</p>
                    <button class="view-video-btn" style="background: #E1306C; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        View Video
                    </button>
                </div>
            `;
            
            const viewBtn = videoPreview.querySelector('.view-video-btn');
            viewBtn.addEventListener('click', () => {
                showVideoPlayer(videoData.videoUrl);
            });
        }
    }

    function createAlternativeDownloads(urls) {
        const altContainer = document.createElement('div');
        altContainer.className = 'alternative-downloads';
        altContainer.style.marginTop = '15px';
        altContainer.style.padding = '15px';
        altContainer.style.background = '#f8f9fa';
        altContainer.style.borderRadius = '8px';
        
        const title = document.createElement('p');
        title.textContent = 'Alternative Qualities:';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.style.color = '#333';
        
        altContainer.appendChild(title);
        
        urls.forEach((url, index) => {
            const btn = document.createElement('a');
            btn.href = url;
            btn.download = `instagram_video_alt${index + 1}.mp4`;
            btn.className = 'alt-download-btn';
            btn.textContent = `Quality ${index + 1}`;
            btn.style.display = 'inline-block';
            btn.style.margin = '5px';
            btn.style.padding = '8px 15px';
            btn.style.background = '#6c757d';
            btn.style.color = 'white';
            btn.style.textDecoration = 'none';
            btn.style.borderRadius = '6px';
            btn.style.fontSize = '14px';
            
            altContainer.appendChild(btn);
        });
        
        videoPreview.parentNode.insertBefore(altContainer, videoPreview.nextSibling);
    }

    function showVideoPlayer(videoUrl) {
        const playerModal = document.createElement('div');
        playerModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        playerModal.innerHTML = `
            <div style="max-width: 900px; width: 100%; background: white; border-radius: 12px; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                    <h4 style="margin: 0; color: #333;">Video Preview</h4>
                    <button class="close-player-btn" style="background: none; border: none; font-size: 20px; color: #666; cursor: pointer; padding: 5px; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 20px;">
                    <video controls autoplay playsinline style="width: 100%; border-radius: 8px; background: #000;">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div style="padding: 15px 20px; background: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center;">
                    <a href="${videoUrl}" class="download-btn" download="${generateFilename(currentVideoData)}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fas fa-download"></i> Download Video
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(playerModal);
        document.body.style.overflow = 'hidden';
        
        // Focus the video for keyboard navigation
        setTimeout(() => {
            const video = playerModal.querySelector('video');
            if (video) video.focus();
        }, 100);
        
        // Close functionality
        const closeBtn = playerModal.querySelector('.close-player-btn');
        const closePlayer = () => {
            const video = playerModal.querySelector('video');
            if (video) {
                video.pause();
                video.src = '';
            }
            playerModal.remove();
            document.body.style.overflow = '';
        };
        
        closeBtn.addEventListener('click', closePlayer);
        playerModal.addEventListener('click', (e) => {
            if (e.target === playerModal) closePlayer();
        });
        
        // Close on ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') closePlayer();
        };
        document.addEventListener('keydown', handleEsc);
    }

    function preloadVideo(videoUrl) {
        // Use link preload for better performance
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = videoUrl;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        // Also create video element for cache
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = videoUrl;
        video.style.display = 'none';
        document.body.appendChild(video);
        
        // Remove after a while
        setTimeout(() => {
            if (link.parentNode) link.remove();
            if (video.parentNode) video.remove();
        }, 5000);
    }

    function handleCopyLink() {
        if (!currentVideoData || !currentVideoData.videoUrl) return;
        
        const videoUrl = currentVideoData.videoUrl;
        
        navigator.clipboard.writeText(videoUrl).then(() => {
            showNotification('Video link copied to clipboard!', 'success');
            
            // Visual feedback
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyLinkBtn.style.background = '#28a745';
            
            setTimeout(() => {
                copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
                copyLinkBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = videoUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Link copied!', 'success');
        });
    }

    function formatDuration(seconds) {
        if (!seconds || seconds <= 0) return 'Unknown';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${secs} seconds`;
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

    function generateFilename(videoData) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const quality = (videoData.quality || 'HD').replace('p', '');
        const dimensions = videoData.dimensions ? 
            `${videoData.dimensions.width}x${videoData.dimensions.height}` : '';
        
        let baseName = 'instagram_video';
        if (videoData.originalUrl) {
            const match = videoData.originalUrl.match(/\/(p|reel|tv|stories)\/([^\/?]+)/);
            if (match && match[2]) {
                baseName = `instagram_${match[1]}_${match[2]}`;
            }
        }
        
        return `${baseName}_${quality}_${dimensions}_${timestamp}.mp4`.replace(/_{2,}/g, '_');
    }

    function setLoadingState(loading) {
        isProcessing = loading;
        downloadBtn.disabled = loading;
        
        if (loading) {
            downloadBtn.classList.add('loading');
            urlInput.disabled = true;
            pasteBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            downloadBtn.classList.remove('loading');
            urlInput.disabled = false;
            pasteBtn.disabled = false;
            downloadBtn.innerHTML = '<span class="btn-text">Get Video</span>';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        
        // Auto-hide error after 10 seconds
        setTimeout(() => {
            if (!errorContainer.classList.contains('hidden')) {
                errorContainer.classList.add('hidden');
            }
        }, 10000);
        
        // Scroll to error
        setTimeout(() => {
            errorContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    }

    function showNotification(message, type = 'info') {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 350px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            transform: translateY(100px);
            opacity: 0;
        `;
        
        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#17a2b8';
        }
        
        notification.classList.add('show');
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.classList.remove('show');
            }, 300);
        }, 3000);
    }

    // Cache functions
    function getFromCache(url) {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            const cachedItem = cache[url];
            
            if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
                return cachedItem.data;
            } else if (cachedItem) {
                // Remove expired cache
                delete cache[url];
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            }
        } catch (e) {
            // Clear corrupt cache
            localStorage.removeItem(CACHE_KEY);
        }
        return null;
    }

    function saveToCache(url, data) {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            cache[url] = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
            // Ignore cache errors
        }
    }

    function saveToLocalStorage(url) {
        try {
            localStorage.setItem('lastInstaUrl', url);
            localStorage.setItem('lastInstaTimestamp', Date.now().toString());
        } catch (e) {
            // Ignore storage errors
        }
    }

    function loadFromLocalStorage() {
        try {
            const lastUrl = localStorage.getItem('lastInstaUrl');
            const lastTimestamp = parseInt(localStorage.getItem('lastInstaTimestamp') || '0');
            
            // Only load if within 24 hours
            if (lastUrl && Date.now() - lastTimestamp < 24 * 60 * 60 * 1000) {
                urlInput.value = lastUrl;
                validateUrlInput();
            }
        } catch (e) {
            // Ignore storage errors
        }
    }

    function setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.log('ServiceWorker registration failed:', err);
                });
            });
        }
    }

    function trackSuccess(url) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'video_download_success', {
                event_category: 'instagram',
                event_label: 'download_success',
                value: 1
            });
        }
        
        // Log success
        console.log('Video downloaded successfully:', {
            url: url,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + V to paste
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && document.activeElement !== urlInput) {
            urlInput.focus();
            setTimeout(handlePaste, 10);
        }
        
        // Ctrl/Cmd + D to download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            handleDownload();
        }
    });

    // Add URL parameter support
    const urlParams = new URLSearchParams(window.location.search);
    const urlFromParam = urlParams.get('url');
    if (urlFromParam && isValidInstagramUrl(urlFromParam)) {
        urlInput.value = decodeURIComponent(urlFromParam);
        validateUrlInput();
        
        // Auto-download if auto parameter is present
        if (urlParams.get('auto') === 'true') {
            setTimeout(() => {
                if (confirm('Auto-download Instagram video?')) {
                    handleDownload();
                }
            }, 500);
        }
    }

    // Add share functionality
    if (navigator.share) {
        const shareBtn = document.createElement('button');
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
        shareBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #E1306C;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(225, 48, 108, 0.3);
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        shareBtn.addEventListener('click', () => {
            navigator.share({
                title: 'Instagram Video Downloader',
                text: 'Download Instagram videos for free!',
                url: window.location.href
            });
        });
        
        document.body.appendChild(shareBtn);
    }

    // Performance monitoring
    let performanceData = {
        startTime: Date.now(),
        requests: 0,
        successes: 0,
        failures: 0
    };

    window.addEventListener('beforeunload', () => {
        if (performanceData.requests > 0) {
            const successRate = (performanceData.successes / performanceData.requests * 100).toFixed(1);
            console.log(`Performance: ${performanceData.requests} requests, ${successRate}% success rate`);
        }
    });
});
