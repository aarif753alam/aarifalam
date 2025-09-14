        // Store the images data
        let images = [];
        let dragItem = null;
        let renamedImages = [];
        
        // DOM elements
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');
        const imageList = document.getElementById('imageList');
        const renameInput = document.getElementById('renameInput');
        const renameBtn = document.getElementById('renameBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const imageCount = document.getElementById('imageCount');
        const previewModal = document.getElementById('previewModal');
        const modalImage = document.getElementById('modalImage');
        const downloadModal = document.getElementById('downloadModal');
        const downloadProgress = document.getElementById('downloadProgress');
        const statusText = document.getElementById('statusText');
        
        // Event listeners
        fileInput.addEventListener('change', handleFileSelect);
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        
        // Show notification toast
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = 'fa-info-circle';
            if (type === 'success') icon = 'fa-check-circle';
            if (type === 'error') icon = 'fa-exclamation-circle';
            
            toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
            document.getElementById('toastContainer').appendChild(toast);
            
            // Show toast
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Hide toast after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        // Handle file selection
        function handleFileSelect(e) {
            const files = e.target.files;
            processFiles(files);
        }
        
        // Handle drag over
        function handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        }
        
        // Handle drag leave
        function handleDragLeave(e) {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        }
        
        // Handle drop
        function handleDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            processFiles(files);
        }
        
        // Process selected files
        function processFiles(files) {
            if (files.length === 0) return;
            
            // Remove placeholder if it exists
            if (imageList.querySelector('.placeholder')) {
                imageList.innerHTML = '';
            }
            
            let processedCount = 0;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Only process image files
                if (!file.type.match('image.*')) {
                    showToast(`Skipped non-image file: ${file.name}`, 'error');
                    continue;
                }
                
                const reader = new FileReader();
                
                reader.onload = (function(theFile) {
                    return function(e) {
                        // Add image to our array
                        images.push({
                            name: theFile.name,
                            src: e.target.result,
                            file: theFile,
                            lastModified: theFile.lastModified,
                            type: theFile.type
                        });
                        
                        processedCount++;
                        
                        // If all files processed, update the display
                        if (processedCount === files.length) {
                            renderImages();
                            showToast(`Added ${processedCount} image(s)`, 'success');
                        }
                    };
                })(file);
                
                reader.readAsDataURL(file);
            }
        }
        
        // Render images to the list
        function renderImages() {
            imageList.innerHTML = '';
            imageCount.textContent = `(${images.length})`;
            
            if (images.length === 0) {
                imageList.innerHTML = `
                    <div class="placeholder" style="text-align: center; padding: 30px; color: #777;">
                        <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No images selected yet</p>
                    </div>
                `;
                downloadBtn.disabled = true;
                return;
            }
            
            images.forEach((image, index) => {
                const div = document.createElement('div');
                div.className = 'image-item';
                div.draggable = true;
                div.dataset.index = index;
                
                div.innerHTML = `
                    <img src="${image.src}" alt="${image.name}" onclick="previewImage('${image.src}')">
                    <div class="remove-btn" onclick="removeImage(${index})">×</div>
                    <div class="image-name">${image.name}</div>
                `;
                
                // Drag events for reordering
                div.addEventListener('dragstart', handleDragStart);
                div.addEventListener('dragend', handleDragEnd);
                div.addEventListener('dragover', handleItemDragOver);
                div.addEventListener('drop', handleItemDrop);
                
                imageList.appendChild(div);
            });
            
            downloadBtn.disabled = false;
        }
        
        // Drag and drop functions for reordering
        function handleDragStart(e) {
            this.classList.add('dragging');
            dragItem = this;
            e.dataTransfer.effectAllowed = 'move';
        }
        
        function handleDragEnd(e) {
            this.classList.remove('dragging');
            dragItem = null;
        }
        
        function handleItemDragOver(e) {
            e.preventDefault();
            return false;
        }
        
        function handleItemDrop(e) {
            e.preventDefault();
            if (dragItem !== this) {
                // Get indices of dragged item and drop target
                const fromIndex = parseInt(dragItem.dataset.index);
                const toIndex = parseInt(this.dataset.index);
                
                // Reorder the images array
                const movedItem = images.splice(fromIndex, 1)[0];
                images.splice(toIndex, 0, movedItem);
                
                // Update the display
                renderImages();
                showToast('Image order updated', 'info');
            }
            return false;
        }
        
        // Remove an image
        function removeImage(index) {
            const removedImage = images.splice(index, 1)[0];
            renderImages();
            showToast(`Removed: ${removedImage.name}`, 'info');
        }
        
        // Add more images
        function addMoreImages() {
            fileInput.click();
        }
        
        // Rename images
        function renameImages() {
            if (images.length === 0) {
                showToast('Please select images first!', 'error');
                return;
            }
            
            const baseName = renameInput.value.trim() || 'image';
            renamedImages = [];
            
            // Animate the rename button
            renameBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Processing...';
            renameBtn.disabled = true;
            
            // Simulate processing delay
            setTimeout(() => {
                images.forEach((image, index) => {
                    const extension = image.name.split('.').pop();
                    const newName = `${baseName}${index + 1}.${extension}`;
                    
                    // Store the renamed image data
                    renamedImages.push({
                        originalName: image.name,
                        newName: newName,
                        src: image.src,
                        file: image.file,
                        type: image.type
                    });
                    
                    // Update the display name
                    image.name = newName;
                });
                
                renderImages();
                
                // Reset the rename button
                renameBtn.innerHTML = '<i class="fas fa-tag"></i> Rename All';
                renameBtn.disabled = false;
                
                // Show success message
                showToast(`Successfully renamed ${images.length} images!`, 'success');
                
            }, 1000);
        }
        
        // Sort images by date
        function sortByDate() {
            if (images.length === 0) {
                showToast('No images to sort!', 'error');
                return;
            }
            
            images.sort((a, b) => a.lastModified - b.lastModified);
            renderImages();
            showToast('Sorted images by date', 'info');
        }
        
        // Sort images by name
        function sortByName() {
            if (images.length === 0) {
                showToast('No images to sort!', 'error');
                return;
            }
            
            images.sort((a, b) => a.name.localeCompare(b.name));
            renderImages();
            showToast('Sorted images by name', 'info');
        }
        
        // Process download
        function processDownload() {
            if (images.length === 0) {
                showToast('No images to download!', 'error');
                return;
            }
            
            if (renamedImages.length === 0) {
                showToast('Please rename images before downloading', 'error');
                return;
            }
            
            // Show download modal
            downloadModal.style.display = 'flex';
            downloadProgress.style.width = '0%';
            statusText.textContent = 'Preparing download...';
            
            // Simulate processing
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                downloadProgress.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    statusText.textContent = 'Ready to download!';
                }
            }, 100);
        }
        
        // Download ZIP file
        function downloadZip() {
            if (renamedImages.length === 0) {
                showToast('Please rename images before downloading', 'error');
                closeDownloadModal();
                return;
            }
            
            statusText.textContent = 'Creating ZIP file...';
            
            const zip = new JSZip();
            
            // Add each image to the zip
            renamedImages.forEach((image, index) => {
                // Convert dataURL to blob
                const blob = dataURLToBlob(image.src);
                zip.file(image.newName, blob);
            });
            
            // Generate the zip file
            zip.generateAsync({type: "blob"}, function(metadata) {
                const progress = Math.round(metadata.percent);
                downloadProgress.style.width = `${progress}%`;
                statusText.textContent = `Zipping... ${progress}%`;
            }).then(function(content) {
                downloadProgress.style.width = '100%';
                statusText.textContent = 'Download ready!';
                
                // Save the zip file
                saveAs(content, "renamed_images.zip");
                showToast('Download started!', 'success');
                
                // Close modal after a short delay
                setTimeout(closeDownloadModal, 1000);
            });
        }
        
        // Convert data URL to Blob
        function dataURLToBlob(dataURL) {
            const parts = dataURL.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const uInt8Array = new Uint8Array(raw.length);
            
            for (let i = 0; i < raw.length; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            
            return new Blob([uInt8Array], { type: contentType });
        }
        
        // Close download modal
        function closeDownloadModal() {
            downloadModal.style.display = 'none';
        }
        
        // Preview image
        function previewImage(src) {
            modalImage.src = src;
            previewModal.style.display = 'flex';
        }
        
        // Close preview
        function closePreview() {
            previewModal.style.display = 'none';
        }
        
        // Clear all images
        function clearAll() {
            if (images.length === 0) {
                showToast('No images to clear', 'info');
                return;
            }
            
            if (confirm('Are you sure you want to remove all images?')) {
                const count = images.length;
                images = [];
                renamedImages = [];
                renderImages();
                showToast(`Cleared ${count} images`, 'info');
            }
        }
        
        // Close modal if clicked outside
        window.onclick = function(event) {
            if (event.target == previewModal) {
                closePreview();
            }
            if (event.target == downloadModal) {
                closeDownloadModal();
            }
        };