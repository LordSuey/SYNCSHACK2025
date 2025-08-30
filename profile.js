// Profile page functionality

// DOM elements
const profileTabs = document.querySelectorAll('.profile-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const modalOverlay = document.getElementById('modal-overlay');
const postTitle = document.getElementById('post-title');
const postImage = document.getElementById('post-image');
const imagePreview = document.getElementById('image-preview');
const postBtn = document.querySelector('.post-btn');

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    initializeProfileTabs();
    initializeImageUpload();
    initializePostValidation();
});

// Profile tabs functionality
function initializeProfileTabs() {
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchProfileTab(targetTab);
        });
    });
}

function switchProfileTab(tabName) {
    // Update active tab
    profileTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active panel
    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabName}-content`).classList.add('active');
}

// Modal functionality
function openAddModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    postTitle.focus();
}

function closeAddModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

function resetForm() {
    postTitle.value = '';
    postImage.value = '';
    imagePreview.innerHTML = '';
    postBtn.disabled = true;
}

// Image upload functionality
function initializeImageUpload() {
    postImage.addEventListener('change', handleImageUpload);
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
            validateForm();
        };
        reader.readAsDataURL(file);
    }
}

// Form validation
function initializePostValidation() {
    postTitle.addEventListener('input', validateForm);
}

function validateForm() {
    const hasTitle = postTitle.value.trim().length > 0;
    const hasImage = postImage.files.length > 0 || imagePreview.innerHTML.includes('img');
    
    postBtn.disabled = !(hasTitle && hasImage);
}

// Navigation
function goBack() {
    window.history.back();
}

// Close modal on outside click
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeAddModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeAddModal();
    }
});

// Toast notification function
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 3000;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Post submission
postBtn.addEventListener('click', function() {
    const title = postTitle.value.trim();
    const imageFile = postImage.files[0];
    
    if (!title || (!imageFile && !imagePreview.innerHTML.includes('img'))) {
        return;
    }
    
    // Simulate post creation
    showToast('Post created successfully!');
    closeAddModal();
});

// Handle enter key in title field
postTitle.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !postBtn.disabled) {
        postBtn.click();
    }
});
