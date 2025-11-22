// 🌐 Cloudflare Worker endpoint
const WORKER_URL = "https://friendship-worker.kumar8948rahul.workers.dev"; // No trailing slash

// DOM elements
const form = document.getElementById('friendshipForm');
const responseContainer = document.getElementById('responseContainer');
const responseMessage = document.getElementById('responseMessage');
const submitBtn = document.getElementById('submitBtn');
const customAlert = document.getElementById('customAlert');
const alertConfirm = document.getElementById('alertConfirm');
const alertCancel = document.getElementById('alertCancel');

const genderBtns = document.querySelectorAll('.gender-btn');
const genderInput = document.getElementById('gender');

// Restricted words
const restrictedWords = [
  'dad','father','grandfather','papa','pappa','papa ji',
  'daddy','baba','abbu','pita','pitaji','baap'
];

// Gender selection
let selectedGender = '';
genderBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    genderBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedGender = btn.dataset.gender;
    genderInput.value = selectedGender;
  });
});

// Show custom input for "Other" options
function setupCustomInputs() {
  // Question 1 (now checkboxes)
  const q1Checkboxes = document.querySelectorAll('input[name="q1"]');
  const customQ1 = document.getElementById('customQ1');
  
  q1Checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'Other') {
        customQ1.style.display = this.checked ? 'block' : 'none';
      }
      document.querySelectorAll('.option-card').forEach(card => {
        const q1Checkbox = card.querySelector('input[name="q1"]');
        if (q1Checkbox && q1Checkbox.checked) {
          card.classList.add('selected');
        } else if (q1Checkbox) {
          card.classList.remove('selected');
        }
      });
    });
  });

  // Question 2 (now checkboxes)
  const q2Checkboxes = document.querySelectorAll('input[name="q2"]');
  const customQ2 = document.getElementById('customQ2');
  
  q2Checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'Other') {
        customQ2.style.display = this.checked ? 'block' : 'none';
      }
      document.querySelectorAll('.option-card').forEach(card => {
        const q2Checkbox = card.querySelector('input[name="q2"]');
        if (q2Checkbox && q2Checkbox.checked) {
          card.classList.add('selected');
        } else if (q2Checkbox) {
          card.classList.remove('selected');
        }
      });
    });
  });

  // Question 3 (now checkboxes)
  const q3Checkboxes = document.querySelectorAll('input[name="q3"]');
  const customQ3 = document.getElementById('customQ3');
  
  q3Checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'Other') {
        customQ3.style.display = this.checked ? 'block' : 'none';
      }
      document.querySelectorAll('.option-card').forEach(card => {
        const q3Checkbox = card.querySelector('input[name="q3"]');
        if (q3Checkbox && q3Checkbox.checked) {
          card.classList.add('selected');
        } else if (q3Checkbox) {
          card.classList.remove('selected');
        }
      });
    });
  });

  // Question 4 (now checkboxes)
  const q4Checkboxes = document.querySelectorAll('input[name="q4"]');
  const customQ4 = document.getElementById('customQ4');
  
  q4Checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'Other') {
        customQ4.style.display = this.checked ? 'block' : 'none';
      }
      document.querySelectorAll('.option-card').forEach(card => {
        const q4Checkbox = card.querySelector('input[name="q4"]');
        if (q4Checkbox && q4Checkbox.checked) {
          card.classList.add('selected');
        } else if (q4Checkbox) {
          card.classList.remove('selected');
        }
      });
    });
  });

  // Question 5 (checkbox - already working this way)
  const q5Checkboxes = document.querySelectorAll('input[name="q5"]');
  const customQ5 = document.getElementById('customQ5');
  
  q5Checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'Other') {
        customQ5.style.display = this.checked ? 'block' : 'none';
      }
      document.querySelectorAll('.option-card').forEach(card => {
        const q5Checkbox = card.querySelector('input[name="q5"]');
        if (q5Checkbox && q5Checkbox.checked) {
          card.classList.add('selected');
        } else if (q5Checkbox) {
          card.classList.remove('selected');
        }
      });
    });
  });
}

// Validate restricted words
function containsRestrictedWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return restrictedWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
}

function validateForm() {
  const fields = [
    document.getElementById('name').value,
    document.getElementById('contact').value,
    document.getElementById('message').value,
    document.getElementById('customQ1Input').value,
    document.getElementById('customQ2Input').value,
    document.getElementById('customQ3Input').value,
    document.getElementById('customQ4Input').value,
    document.getElementById('customQ5Input').value
  ];
  if (fields.some(f => containsRestrictedWords(f))) {
    alert('Please remove restricted words from your input.');
    return false;
  }
  return true;
}

// NEW: 6-digit unique ID system based on name
function generateNameBasedId(name) {
  // Get first 2 characters from name (uppercase)
  let namePart = name.substring(0, 2).toUpperCase();
  
  // If name is too short, pad with random characters
  if (namePart.length < 2) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    while (namePart.length < 2) {
      namePart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  // Generate 4 random characters (letters, numbers, symbols)
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!*';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  
  return namePart + randomPart;
}

// ✅ SECURE: Check if ID is unique using Worker (NO Firebase URL exposed)
async function isIdUnique(userId) {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(WORKER_URL + '/check-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('ID check failed, assuming unique');
      return true; // Assume unique if check fails
    }
    
    const result = await response.json();
    return result.isUnique;
  } catch (error) {
    console.error('Error checking ID uniqueness:', error);
    return true; // Assume unique if we can't check
  }
}

// Generate unique ID based on name
async function generateUniqueUserId(name) {
  // First try a simple ID without checking for uniqueness
  // This will be fast in most cases
  let userId = generateNameBasedId(name);
  
  // Only check for uniqueness if we have time
  try {
    // Use Promise.race to timeout the uniqueness check quickly
    const uniqueCheck = isIdUnique(userId);
    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(true), 500));
    
    const isUnique = await Promise.race([uniqueCheck, timeoutPromise]);
    
    if (!isUnique) {
      // If not unique, try one more time with a different ID
      userId = generateNameBasedId(name + Date.now().toString());
    }
  } catch (error) {
    console.log('ID uniqueness check timed out, using generated ID');
  }
  
  return userId;
}

function getUserId() {
  // Only return ID if user has already submitted
  if (hasUserSubmitted()) {
    const userId = localStorage.getItem('friendshipFormUserId');
    
    if (userId) {
      return userId;
    }
  }
  
  // Return null if user hasn't submitted yet
  return null;
}

async function assignNewUserId(name) {
  // Generate unique ID based on name
  const userId = await generateUniqueUserId(name);
  
  localStorage.setItem('friendshipFormUserId', userId);
  
  return userId;
}

function displayUserId() {
  // Only show ID if user has submitted
  if (hasUserSubmitted()) {
    const userId = getUserId();
    if (userId) {
      const userIdElement = document.getElementById('userIdDisplay');
      
      if (userIdElement) {
        userIdElement.textContent = `Your ID: ${userId}`;
      } else {
        // Create and display the user ID element
        const userIdDiv = document.createElement('div');
        userIdDiv.id = 'userIdDisplay';
        userIdDiv.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.4);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
          z-index: 1000;
          pointer-events: none;
          user-select: none;
          font-weight: normal;
        `;
        userIdDiv.textContent = `Your ID: ${userId}`;
        document.body.appendChild(userIdDiv);
      }
    }
  }
}

function hasUserSubmitted() {
  return localStorage.getItem('friendshipFormSubmitted') === 'true';
}

// Confirm before submit
submitBtn.addEventListener('click', () => {
  if (!selectedGender) return alert('Please select your gender.');
  const name = document.getElementById('name').value;
  if (!name) return alert('Please enter your name.');
  
  // Check if all required questions have at least one answer selected
  if (!document.querySelector('input[name="q1"]:checked')) return alert('Please answer question 1.');
  if (!document.querySelector('input[name="q2"]:checked')) return alert('Please answer question 2.');
  if (!document.querySelector('input[name="q3"]:checked')) return alert('Please answer question 3.');
  if (!document.querySelector('input[name="q4"]:checked')) return alert('Please answer question 4.');
  
  if (!validateForm()) return;
  customAlert.style.display = 'flex';
});

alertCancel.addEventListener('click', () => (customAlert.style.display = 'none'));
alertConfirm.addEventListener('click', () => {
  customAlert.style.display = 'none';
  submitForm();
});

// 📨 Submit function (via Cloudflare Worker) - OPTIMIZED VERSION
async function submitForm() {
  if (hasUserSubmitted()) {
    alert('You have already submitted. Thank you!');
    return;
  }

  const name = document.getElementById('name').value;
  const contact = document.getElementById('contact').value;
  const message = document.getElementById('message').value;
  
  // Get answers for all questions (now all are checkboxes)
  const q1Checkboxes = document.querySelectorAll('input[name="q1"]:checked');
  let q1Values = Array.from(q1Checkboxes).map(cb => {
    return cb.value === 'Other' ? document.getElementById('customQ1Input').value : cb.value;
  });
  
  const q2Checkboxes = document.querySelectorAll('input[name="q2"]:checked');
  let q2Values = Array.from(q2Checkboxes).map(cb => {
    return cb.value === 'Other' ? document.getElementById('customQ2Input').value : cb.value;
  });
  
  const q3Checkboxes = document.querySelectorAll('input[name="q3"]:checked');
  let q3Values = Array.from(q3Checkboxes).map(cb => {
    return cb.value === 'Other' ? document.getElementById('customQ3Input').value : cb.value;
  });
  
  const q4Checkboxes = document.querySelectorAll('input[name="q4"]:checked');
  let q4Values = Array.from(q4Checkboxes).map(cb => {
    return cb.value === 'Other' ? document.getElementById('customQ4Input').value : cb.value;
  });
  
  const q5Checkboxes = document.querySelectorAll('input[name="q5"]:checked');
  let q5Values = Array.from(q5Checkboxes).map(cb => {
    return cb.value === 'Other' ? document.getElementById('customQ5Input').value : cb.value;
  });

  // Show loading state immediately for better UX
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  // Assign ID only at submission time based on name
  const userId = await generateUniqueUserId(name);

  const formData = {
    name,
    gender: selectedGender,
    contact: contact || 'Not provided',
    q1: q1Values,
    q2: q2Values,
    q3: q3Values,
    q4: q4Values,
    q5: q5Values,
    message: message || 'No message',
    timestamp: new Date().toISOString(),
    userId: userId,
  };

  // ✅ OPTIMIZED: Show response immediately and submit in background
  localStorage.setItem('friendshipFormSubmitted', 'true');
  localStorage.setItem('friendshipFormUserId', userId);
  showResponse(formData);

  // Submit to worker in background without waiting for response
  submitToWorker(formData);
}

// Separate function for worker submission that doesn't block UI
async function submitToWorker(formData) {
  try {
    console.log('Sending form data to worker in background...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Worker response:', result);
    
    if (!result.success) {
      console.error('Submission failed:', result.error);
      // Optionally show a subtle notification that submission failed
      // but don't disrupt the user experience
    }
  } catch (err) {
    console.error('Worker Error:', err);
    // Log error but don't show to user since we've already shown success
  }
}

// Response UI
function showResponse(data) {
  form.style.display = 'none';
  responseContainer.style.display = 'block';
  
  const userId = getUserId();
  let msg = "Thank you so much ❤️";
  
  // Check if any of the selected options in q3 include 'Brother' or 'Best friend'
  if (Array.isArray(data.q3) && data.q3.some(option => option.includes('Brother')) && data.gender === 'Female')
    msg = "Thank you so much my dear sister ❤️";
  else if (Array.isArray(data.q3) && data.q3.some(option => option.includes('Best friend')))
    msg = "Thank you so much my best friend ❤️";
    
  responseMessage.innerHTML = `
    <p><b>${msg}</b></p>
    <p class="contact-soon">I will contact you soon</p>
    ${userId ? `<p><small>Your Friendship ID: <strong style="font-family: monospace; font-size: 1.2rem;">${userId}</strong></small></p>` : ''}
    ${data.message && data.message !== 'No message' ? `<p><strong>Note:</strong> I loved your message!</p>` : ''}
  `;
  
  // Display the user ID after submission
  displayUserId();
}

// Restore submission state and setup custom inputs
window.addEventListener('load', () => {
  setupCustomInputs();
  
  if (hasUserSubmitted()) {
    form.style.display = 'none';
    responseContainer.style.display = 'block';
    const userId = getUserId();
    responseMessage.innerHTML = `
      <p><b>You have already submitted. Thank you! ❤️</b></p>
      ${userId ? `<p><small>Your Friendship ID: <strong style="font-family: monospace; font-size: 1.2rem;">${userId}</strong></small></p>` : ''}
    `;
    displayUserId(); // Show ID for returning users
  }
});