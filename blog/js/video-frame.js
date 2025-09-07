 document.addEventListener('DOMContentLoaded', function() {
            const videoWrapper = document.getElementById('videoWrapper');
            const playButton = document.getElementById('playButton');
            const videoIframe = document.getElementById('videoIframe');
            const videoThumbnail = document.querySelector('.video-thumbnail');
            
            let videoPlayed = false;
            
            // Function to play the video
            function playVideo() {
                if (!videoPlayed) {
                    // Load the video with autoplay
                    videoIframe.src = videoIframe.dataset.src;
                    
                    // Add the playing class to show the video and hide thumbnail
                    videoWrapper.classList.add('video-playing');
                    
                    videoPlayed = true;
                    
                    // Remove event listeners after first click
                    playButton.removeEventListener('click', playVideo);
                    videoThumbnail.removeEventListener('click', playVideo);
                }
            }
            
            // Event listeners for playing the video
            playButton.addEventListener('click', playVideo);
            videoThumbnail.addEventListener('click', playVideo);
            
            // Subscribe button functionality
            const subscribeBtn = document.querySelector('.subscribe-btn');
            
            subscribeBtn.addEventListener('click', function(e) {
                // Create a confirmation message
                const confirmation = document.createElement('div');
                confirmation.textContent = 'Redirecting to YouTube...';
                confirmation.style.color = '#c4302b';
                confirmation.style.marginTop = '15px';
                confirmation.style.fontWeight = '600';
                
                // Add the message to the subscribe section
                document.querySelector('.subscribe-section').appendChild(confirmation);
                
                // Remove the message after 3 seconds
                setTimeout(() => {
                    confirmation.remove();
                }, 3000);
            });
        });