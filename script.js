// App state
let currentPage = 'home';
let currentCategory = 'foryou';
let posts = [];
let map;
let placesService;
let infoWindow;
let isAddingPin = false;
let userPins = [];
let pinModalMode = 'create';  
let editingPinId = null;


// Check if we should enable pin mode (from profile page navigation)
document.addEventListener('DOMContentLoaded', function() {
    const enablePinMode = localStorage.getItem('enablePinMode');
    if (enablePinMode === 'true') {
        localStorage.removeItem('enablePinMode');
        // Wait for the page to fully load, then enable pin mode
        setTimeout(() => {
            togglePinMode();
        }, 1000);
    }
});

// DOM elements
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const tabButtons = document.querySelectorAll('.nav-tab');
const composeNavBtn = document.getElementById('compose-nav');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const postBtn = document.getElementById('post-btn');
const postTitle = document.getElementById('post-title');
const postImage = document.getElementById('post-image');
const imageUploadBtn = document.getElementById('image-upload-btn');
const imagePreview = document.getElementById('image-preview');
const postsFeed = document.getElementById('posts-feed');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeTabs();
    initializeCompose();
    loadSamplePosts();
    addInteractiveFeatures();
});

// Navigation functionality
function initializeNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                switchPage(targetPage);
            }
        });
    });
}

function switchPage(pageId) {
    // Only handle home page since profile is now separate
    if (pageId === 'home') {
        // Update active nav button
        navButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update active page
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Show top navigation for home page
        const topNav = document.querySelector('.top-nav');
        const mainContent = document.querySelector('.main-content');
        topNav.style.display = 'flex';
        mainContent.classList.remove('full-height');
        
        currentPage = pageId;
        
        // Update compose button appearance
        updateComposeButtonState();
    }
}

// Tab functionality
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            switchCategory(category);
        });
    });
}

function switchCategory(category) {
    // Update active tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    currentCategory = category;
    
    // Simulate loading different content
    loadPostsByCategory(category);
}

function loadPostsByCategory(category) {
    // Add loading animation
    postsFeed.classList.add('loading');
    
    setTimeout(() => {
        postsFeed.classList.remove('loading');
        // In a real app, you would fetch posts based on category
        console.log(`Loading posts for category: ${category}`);
    }, 500);
}

// Compose functionality
function initializeCompose() {
    // Open compose modal or toggle pin mode based on current page
    composeNavBtn.addEventListener('click', handleComposeClick);
    
    // Close modal events
    closeModalBtn.addEventListener('click', closeComposeModal);
    cancelBtn.addEventListener('click', closeComposeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeComposeModal();
        }
    });
    
    // Image upload
    imageUploadBtn.addEventListener('click', function() {
        postImage.click();
    });
    
    postImage.addEventListener('change', handleImageUpload);
    
    // Post title validation
    postTitle.addEventListener('input', validatePostForm);
    
    // Submit post
    postBtn.addEventListener('click', submitPost);
    
    // Enter key to submit
    postTitle.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !postBtn.disabled) {
            submitPost();
        }
    });
    
    // Initialize pin modal
    initializePinModal();
}

function getPinById(id) {
  return userPins.find(p => p.id === id);
}

function initializePinModal() {
  console.log('Initializing pin modal...');
  const pinModal = document.getElementById('pin-modal-overlay');
  const closePinModal = document.getElementById('close-pin-modal');
  const cancelPinBtn = document.getElementById('cancel-pin-btn');
  const createPinBtn = document.getElementById('create-pin-btn'); // becomes "Save Changes" in edit mode
  const pinTitle = document.getElementById('pin-title');
  const pinDescription = document.getElementById('pin-description');
  const pinPhotoInput = document.getElementById('pin-photo');
  const pinPhotoBtn = document.getElementById('pin-photo-btn');
  const pinImagePreview = document.getElementById('pin-image-preview');

  console.log('Pin modal elements found:', {
    pinModal: !!pinModal,
    createPinBtn: !!createPinBtn,
    pinTitle: !!pinTitle,
    pinDescription: !!pinDescription
  });

  // --- close/reset handler (now also resets modal to CREATE defaults) ---
  function closePinModalHandler() {
    pinModal.classList.remove('active');
    pendingPinLocation = null;

    // reset to CREATE mode
    pinModalMode = 'create';
    editingPinId = null;
    pinModal.querySelector('.modal-header h3').textContent = 'Add Pin';
    createPinBtn.textContent = 'Create Pin';

    // remove the red delete button if it was added in edit mode
    const deleteInEditBtn = document.getElementById('delete-pin-in-edit-btn');
    if (deleteInEditBtn) deleteInEditBtn.remove();

    // clear fields
    pinTitle.value = '';
    pinDescription.value = '';
    const defaultRadio = document.querySelector('input[name="category"][value="landmark"]');
    if (defaultRadio) defaultRadio.checked = true;
    pinImagePreview.innerHTML = '';
    pinPhotoInput.value = '';
  }

  // expose so edit flow can call it
  window.closePinModalHandler = closePinModalHandler;

  // wire close events
  closePinModal.addEventListener('click', closePinModalHandler);
  cancelPinBtn.addEventListener('click', closePinModalHandler);
  pinModal.addEventListener('click', function(e) {
    if (e.target === pinModal) closePinModalHandler();
  });

  // --- photo upload ---
  pinPhotoBtn.addEventListener('click', () => pinPhotoInput.click());
  pinPhotoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        pinImagePreview.innerHTML = `<img src="${ev.target.result}" alt="Pin photo">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // --- form validation (title required) ---
  function validatePinForm() {
    const title = pinTitle.value.trim();
    createPinBtn.disabled = title.length === 0;
    console.log('Validating pin form - title:', title, 'disabled:', createPinBtn.disabled);
  }
  pinTitle.addEventListener('input', validatePinForm);
  pinDescription.addEventListener('input', validatePinForm);

  // --- create OR save changes (depending on pinModalMode) ---
  if (createPinBtn) {
    console.log('Adding click event listener to create/save button');
    createPinBtn.addEventListener('click', function(e) {
      e.preventDefault();

      const title = pinTitle.value.trim() || (pinModalMode === 'create' ? 'Untitled Pin' : '');
      const description = pinDescription.value.trim();
      const category = document.querySelector('input[name="category"]:checked').value;
      const customPhoto = pinImagePreview.querySelector('img')?.src;

      if (pinModalMode === 'create') {
        console.log('Create pin button clicked!', 'pendingLocation:', pendingPinLocation);
        if (!pendingPinLocation) {
          console.log('Cannot create pin - no pending location');
          showToast('Error: No location selected for pin');
          return;
        }
        try {
          createUserPin(
            pendingPinLocation.lat,
            pendingPinLocation.lng,
            title,
            description,
            category,
            customPhoto
          );
          console.log('Pin created successfully');
        } catch (error) {
          console.error('Error creating pin:', error);
          showToast('Error creating pin: ' + error.message);
          return;
        }

        // turn off pin mode after creating
        isAddingPin = false;
        updateComposeButtonState();
        document.getElementById('google-map').style.cursor = 'default';
        showToast('Pin added successfully!');
      } else {
        // EDIT MODE: update existing pin (no location change here)
        const pin = getPinById(editingPinId);
        if (!pin) {
          showToast('Error: Pin not found');
          return;
        }
        pin.title = title || pin.title;
        pin.description = description;
        pin.category = category;
        pin.customPhoto = customPhoto || pin.customPhoto;

        // update marker presentation
        if (pin.marker) {
          pin.marker.setTitle(pin.title);
          pin.marker.setIcon({
            url: `photo/${pin.category}.webp`,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          });
        }

        savePinsToStorage();
        showToast('Pin updated');
      }

      closePinModalHandler();
    });
  } else {
    console.error('Create pin button not found - cannot add event listener');
  }

  // initize pin details modal
  initializePinDetailsModal();
}

function initializePinDetailsModal() {
    const detailsModal = document.getElementById('pin-details-overlay');
    const closeDetailsBtn = document.getElementById('close-pin-details');
    const closeDetailsBtnFooter = document.getElementById('close-pin-details-btn');
    const editBtn = document.getElementById('edit-pin-btn');
    if (editBtn) {
    editBtn.addEventListener('click', function () {
        const pinId = parseInt(detailsModal.dataset.pinId);
        const pinData = getPinById(pinId);
        if (!pinData) return;
        detailsModal.classList.remove('active');
        openEditPinModal(pinData);
    });
    }
    
    // Close modal events
    closeDetailsBtn.addEventListener('click', () => {
        detailsModal.classList.remove('active');
    });
    
    closeDetailsBtnFooter.addEventListener('click', () => {
        detailsModal.classList.remove('active');
    });
    
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            detailsModal.classList.remove('active');
        }
    });

}

function handleComposeClick() {
    // Always allow pin creation, regardless of current page
    togglePinMode();
}

function togglePinMode() {
    isAddingPin = !isAddingPin;
    updateComposeButtonState();
    
    if (isAddingPin) {
        showToast('Click on the map to add a pin');
        // Change cursor style when adding pins
        document.getElementById('google-map').style.cursor = 'crosshair';
    } else {
        showToast('Pin mode disabled');
        document.getElementById('google-map').style.cursor = 'default';
    }
}

function updateComposeButtonState() {
    const composeIcon = composeNavBtn.querySelector('.compose-icon');
    const navIcon = composeNavBtn.querySelector('.nav-icon');
    
    // Always show pin mode state (no posts functionality)
    if (isAddingPin) {
        composeIcon.textContent = '✓';
        navIcon.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
    } else {
        composeIcon.textContent = '📍';
        navIcon.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
    }
}

function openComposeModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    postTitle.focus();
}

function closeComposeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetComposeForm();
}

function resetComposeForm() {
    postTitle.value = '';
    postImage.value = '';
    imagePreview.innerHTML = '';
    postBtn.disabled = true;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            validatePostForm();
        };
        reader.readAsDataURL(file);
    }
}

function validatePostForm() {
    const hasTitle = postTitle.value.trim().length > 0;
    const hasImage = postImage.files.length > 0 || imagePreview.innerHTML.includes('img');
    
    postBtn.disabled = !(hasTitle && hasImage);
}

function submitPost() {
    const title = postTitle.value.trim();
    const imageFile = postImage.files[0];
    
    if (!title || (!imageFile && !imagePreview.innerHTML.includes('img'))) {
        return;
    }
    
    // Create new post
    const newPost = {
        id: Date.now(),
        title: title,
        image: imagePreview.querySelector('img')?.src || '',
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        user: {
            name: 'You',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
        }
    };
    
    // Add to posts array
    posts.unshift(newPost);
    
    // Add to DOM
    addPostToFeed(newPost);
    
    // Close modal and reset
    closeComposeModal();
    
    // Switch to home page if not already there
    if (currentPage !== 'home') {
        switchPage('home');
    }
    
    // Show success feedback
    showToast('Posted successfully!');
}

function addPostToFeed(post) {
    const postItem = document.createElement('div');
    postItem.className = 'post-item';
    postItem.innerHTML = `
        <div class="post-media">
            <img src="${post.image}" alt="Post content" class="post-image">
        </div>
        <div class="post-overlay">
            <div class="post-info">
                <div class="user-info">
                    <img src="${post.user.avatar}" alt="User" class="user-avatar">
                    <span class="username">${post.user.name}</span>
                </div>
                <p class="post-description">${post.title}</p>
            </div>
            <div class="post-actions">
                <button class="action-btn like-btn" onclick="toggleLike(this, ${post.id})">
                    <span class="action-icon">❤️</span>
                    <span class="action-count">${post.likes}</span>
                </button>
                <button class="action-btn comment-btn">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${post.comments}</span>
                </button>
                <button class="action-btn share-btn">
                    <span class="action-icon">📤</span>
                    <span class="action-count">Share</span>
                </button>
            </div>
        </div>
    `;
    
    // Add animation
    postItem.style.opacity = '0';
    postItem.style.transform = 'scale(0.8)';
    
    // Insert at the beginning
    postsFeed.insertBefore(postItem, postsFeed.firstChild);
    
    // Animate in
    setTimeout(() => {
        postItem.style.transition = 'all 0.3s ease';
        postItem.style.opacity = '1';
        postItem.style.transform = 'scale(1)';
    }, 10);
}

function loadSamplePosts() {
    // This function ensures sample posts are available on page load
    const samplePosts = [
        { 
            id: 1, 
            title: 'The most adventurous thing I\'ve ever done', 
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop&crop=center',
            likes: 38700,
            comments: 1200,
            user: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' }
        },
        { 
            id: 2, 
            title: 'Sydney Marathon + City Tour Complete Guide', 
            image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=500&fit=crop&crop=center',
            likes: 19,
            comments: 5,
            user: { name: 'Alex Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
        },
        { 
            id: 3, 
            title: 'Exposing this person who bought all the collectibles...', 
            image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a4?w=300&h=500&fit=crop&crop=center',
            likes: 29,
            comments: 8,
            user: { name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' }
        },
        { 
            id: 4, 
            title: 'Someone suddenly asked me: "Which country are you studying in?"', 
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=500&fit=crop&crop=center',
            likes: 156,
            comments: 43,
            user: { name: 'Travel Explorer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
        }
    ];
    
    posts = [...samplePosts];
}

// Interactive features
function addInteractiveFeatures() {
    // Add like functionality to existing posts
    document.addEventListener('click', function(e) {
        if (e.target.closest('.like-btn')) {
            const likeBtn = e.target.closest('.like-btn');
            const postId = parseInt(likeBtn.onclick?.toString().match(/\d+/)?.[0] || '0');
            toggleLike(likeBtn, postId);
        }
    });
    
    // Add post click handlers for full screen view
    document.addEventListener('click', function(e) {
        const postItem = e.target.closest('.post-item');
        if (postItem && !e.target.closest('.post-actions')) {
            // In a real app, this would open full screen post view
            console.log('Opening full screen post view');
        }
    });
}

// edit pin function
function openEditPinModal(pinData) {
  const pinModal = document.getElementById('pin-modal-overlay');
  const headerTitle = pinModal.querySelector('.modal-header h3');
  const pinTitle = document.getElementById('pin-title');
  const pinDescription = document.getElementById('pin-description');
  const pinImagePreview = document.getElementById('pin-image-preview');
  const pinPhotoInput = document.getElementById('pin-photo');
  const createBtn = document.getElementById('create-pin-btn'); // will act as Save Changes in edit mode

  // set mode + current editing id
  pinModalMode = 'edit';
  editingPinId = pinData.id;

  // header & fields
  headerTitle.textContent = 'Edit Pin';
  pinTitle.value = pinData.title || '';
  pinDescription.value = pinData.description || '';

  // category
  const radio = document.querySelector(`input[name="category"][value="${pinData.category}"]`);
  if (radio) radio.checked = true;

  // photo preview
  pinImagePreview.innerHTML = '';
  if (pinData.customPhoto) {
    pinImagePreview.innerHTML = `<img src="${pinData.customPhoto}" alt="Pin photo">`;
  }

  // reset file input
  pinPhotoInput.value = '';

  // turn "Create Pin" into "Save Changes"
  createBtn.textContent = 'Save Changes';

  // ensure a red delete button exists in the modal footer (only in edit mode)
  let deleteInEditBtn = document.getElementById('delete-pin-in-edit-btn');
  if (!deleteInEditBtn) {
    deleteInEditBtn = document.createElement('button');
    deleteInEditBtn.id = 'delete-pin-in-edit-btn';
    deleteInEditBtn.className = 'pin-action-btn delete';
    deleteInEditBtn.style.flex = '1';
    deleteInEditBtn.textContent = 'Delete Pin';
    // insert before createBtn so layout is: Cancel | Delete Pin | Save Changes
    const footer = pinModal.querySelector('.modal-footer');
    footer.insertBefore(deleteInEditBtn, createBtn);
  }
  deleteInEditBtn.onclick = () => {
    if (editingPinId) {
      deleteUserPin(editingPinId);
      closePinModalHandler(); // defined inside initializePinModal
    }
  };

  // show modal
  pinModal.classList.add('active');
}

function toggleLike(button, postId) {
    const countSpan = button.querySelector('.action-count');
    const iconSpan = button.querySelector('.action-icon');
    let currentCount = parseInt(countSpan.textContent.replace('K', '').replace('.', '')) || 0;
    
    if (button.classList.contains('liked')) {
        // Unlike
        button.classList.remove('liked');
        currentCount--;
        iconSpan.textContent = '❤️';
    } else {
        // Like
        button.classList.add('liked');
        currentCount++;
        iconSpan.textContent = '❤️';
        
        // Add heart animation
        createHeartAnimation(button);
    }
    
    // Update count display
    if (currentCount >= 1000) {
        countSpan.textContent = (currentCount / 1000).toFixed(1) + 'K';
    } else {
        countSpan.textContent = currentCount.toString();
    }
    
    // Update posts array
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes = currentCount;
    }
}

function createHeartAnimation(button) {
    const heart = document.createElement('span');
    heart.textContent = '❤️';
    heart.style.cssText = `
        position: absolute;
        font-size: 20px;
        color: #ff6b6b;
        pointer-events: none;
        z-index: 1000;
        animation: heartFloat 1s ease-out forwards;
    `;
    
    const rect = button.getBoundingClientRect();
    heart.style.left = rect.left + rect.width/2 + 'px';
    heart.style.top = rect.top + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 1000);
}

function showToast(message) {
    // Create toast element
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
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeComposeModal();
    }
});

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Add heart floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes heartFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px) scale(1.5);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add pull-to-refresh functionality (simplified)
let startY = 0;
let currentY = 0;
let pulling = false;

document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0 && currentPage === 'home') {
        startY = e.touches[0].pageY;
        pulling = true;
    }
});

document.addEventListener('touchmove', function(e) {
    if (pulling) {
        currentY = e.touches[0].pageY;
        const diff = currentY - startY;
        
        if (diff > 50) {
            // Show refresh indicator
            console.log('Pull to refresh triggered');
        }
    }
});

document.addEventListener('touchend', function() {
    if (pulling) {
        const diff = currentY - startY;
        if (diff > 100) {
            // Trigger refresh
            refreshFeed();
        }
        pulling = false;
    }
});

function refreshFeed() {
    // Simulate refresh
    postsFeed.classList.add('loading');
    showToast('Refreshing...');
    
    setTimeout(() => {
        postsFeed.classList.remove('loading');
        showToast('Refresh complete');
    }, 1000);
}

// Google Maps functionality
function initMap() {
    // Check if there's a location redirect from profile page
    const redirectLocation = localStorage.getItem('redirectToLocation');
    let defaultLocation, defaultZoom;
    
    if (redirectLocation) {
        try {
            const locationData = JSON.parse(redirectLocation);
            defaultLocation = { lat: locationData.lat, lng: locationData.lng };
            defaultZoom = locationData.zoom || 15;
            
            // Clear the redirect data after using it
            localStorage.removeItem('redirectToLocation');
            
            // Show a toast notification
            setTimeout(() => {
                if (locationData.type === 'achievement') {
                    showToast(`Showing ${locationData.achievementTitle} location`);
                } else {
                    showToast(`Showing ${locationData.name}`);
                }
            }, 500);
            
            // Add a special marker for the user's location or achievement
            if (locationData.type === 'achievement') {
                // Add achievement marker
                new google.maps.Marker({
                    position: defaultLocation,
                    map: map,
                    title: locationData.achievementTitle,
                    icon: {
                        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjZmZkNzAwIi8+Cjwvc3ZnPg==',
                        scaledSize: new google.maps.Size(50, 50)
                    }
                });
                
                // Add achievement info window
                const achievementInfoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="color: #333; max-width: 250px;">
                            <h3 style="margin: 0 0 8px 0; color: #000; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">🏆</span>
                                ${locationData.achievementTitle}
                            </h3>
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                                <strong>Location:</strong> ${locationData.name}
                            </p>
                            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #ffd700;">
                                <span>⭐</span>
                                <span>Achievement Unlocked!</span>
                            </div>
                        </div>
                    `
                });
                
                // Open info window automatically for achievements
                setTimeout(() => {
                    achievementInfoWindow.open(map, map.getCenter());
                }, 1000);
                
            } else {
                // Add regular location marker
                new google.maps.Marker({
                    position: defaultLocation,
                    map: map,
                    title: locationData.name,
                    icon: {
                        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjZmY2YjZiIi8+Cjwvc3ZnPg==',
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
            }
        } catch (e) {
            console.error('Error parsing location data:', e);
            defaultLocation = window.CONFIG?.DEFAULT_MAP_CENTER || { lat: -33.8688, lng: 151.2093 };
            defaultZoom = window.CONFIG?.DEFAULT_MAP_ZOOM || 15;
        }
    } else {
        // Use config for default location or fallback
        defaultLocation = window.CONFIG?.DEFAULT_MAP_CENTER || { lat: 40.7128, lng: -74.0060 };
        defaultZoom = window.CONFIG?.DEFAULT_MAP_ZOOM || 15;
    }
    
    map = new google.maps.Map(document.getElementById('google-map'), {
        zoom: defaultZoom,
        center: defaultLocation,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{"color": "#212121"}]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#757575"}]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#212121"}]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{"color": "#757575"}]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#9e9e9e"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#2c2c2c"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#8a8a8a"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#000000"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#3d3d3d"}]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    placesService = new google.maps.places.PlacesService(map);
    infoWindow = new google.maps.InfoWindow();

    // Try to get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                
                // Add marker for current location
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'Your Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#ff6b6b',
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2
                    }
                });
                
                // Search for nearby places
                searchNearbyPlaces(pos);
            },
            () => {
                console.log('Location access denied');
                searchNearbyPlaces(defaultLocation);
            }
        );
    } else {
        console.log('Geolocation not supported');
        searchNearbyPlaces(defaultLocation);
    }

    // Setup search functionality
    setupMapSearch();
    
    // Setup map click for adding pins
    setupMapClickHandler();
    
    // Load saved pins from localStorage
    console.log('Map initialized, loading pins...');
    loadPinsFromStorage();
    
    // Center map to show all hard-coded pins
    const hardCodedBounds = new google.maps.LatLngBounds();
    hardCodedBounds.extend({ lat: -33.88036830097366, lng: 151.20427651239518 }); // Haymarket cat
    hardCodedBounds.extend({ lat: -33.89159793495311, lng: 151.1952780812729 }); // Redfern cat
    hardCodedBounds.extend({ lat: -33.863530954674445, lng: 151.01858344807906 }); // Auburn Cherry Blossom
    map.fitBounds(hardCodedBounds);
    map.setZoom(Math.max(map.getZoom(), 11)); // Ensure minimum zoom level
    
    // Setup achievements functionality
    setupAchievements();
}

function searchNearbyPlaces(location) {
    const request = {
        location: location,
        radius: 1000,
        type: ['restaurant', 'tourist_attraction', 'store']
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.slice(0, 10).forEach(place => {
                createMarker(place);
            });
        }
    });
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjZmY2YjZiIi8+Cjwvc3ZnPg==',
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    marker.addListener('click', () => {
        const content = `
            <div style="color: #333; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #000;">${place.name}</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px;">${place.vicinity}</p>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: #ff6b6b;">⭐</span>
                    <span style="font-size: 14px;">${place.rating || 'No rating'}</span>
                </div>
            </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });
}

function setupMapSearch() {
    const searchInput = document.getElementById('map-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) return;

    const autocomplete = new google.maps.places.Autocomplete(searchInput);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
        }

        createMarker(place);
    });

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (!query) return;

        const request = {
            query: query,
            fields: ['name', 'geometry', 'rating', 'formatted_address']
        };

        placesService.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const place = results[0];
                map.setCenter(place.geometry.location);
                map.setZoom(15);
                createMarker(place);
            }
        });
    });
}

// Pin creation variables
let pendingPinLocation = null;

// File-based storage functions for pins
async function savePinsToStorage() {
    try {
        // Filter out hard-coded pins and remove marker references before saving
        const pinsToSave = userPins
            .filter(pin => pin.id !== 1756574202596 && pin.id !== 1756576515738 && pin.id !== 1756576659444) // Exclude hard-coded pins
            .map(pin => {
                const { marker, ...pinData } = pin;
                return pinData;
            });
        
        // Create a downloadable JSON file
        const dataStr = JSON.stringify(pinsToSave, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // For development: log the data that would be saved
        console.log('User pins data to save:', pinsToSave.length, 'pins (excluding hard-coded)');
        console.log('JSON data:', dataStr);
        
        // Save only user-created pins to localStorage
        localStorage.setItem('userPins', JSON.stringify(pinsToSave));
        
        // Auto-download the pins file for local storage
        
        
    } catch (error) {
        console.error('Error saving pins to file:', error);
    }
}

function loadPinsFromStorage() {
    try {
        // Hard-coded pin data
        const hardCodedPins = [
            {
                id: 1756574202596,
                lat: -33.88036830097366,
                lng: 151.20427651239518,
                title: "Haymarket cat",
                description: "Friendly Orange Cat",
                category: "meme",
                timestamp: new Date("2025-08-30T17:16:42.596Z")
            },
            {
                id: 1756576515738,
                lat: -33.89159793495311,
                lng: 151.1952780812729,
                title: "Redfern cat",
                description: "Whisky the chonky, orange & white cat",
                category: "meme",
                timestamp: new Date("2025-08-30T17:55:15.738Z")
            },
            {
                id: 1756576659444,
                lat: -33.863530954674445,
                lng: 151.01858344807906,
                title: "Auburn Cherry Blossom",
                description: "",
                category: "landmark",
                timestamp: new Date("2025-08-30T17:57:39.444Z")
            }
        ];
        
        // Try to load from localStorage first (for user-created pins)
        const savedPins = localStorage.getItem('userPins');
        let userCreatedPins = [];
        if (savedPins) {
            const parsedPins = JSON.parse(savedPins);
            console.log('Loading user pins from localStorage:', parsedPins.length, 'pins');
            
            // Recreate each user pin
            userCreatedPins = parsedPins.map(pinData => {
                // Convert timestamp back to Date object
                pinData.timestamp = new Date(pinData.timestamp);
                return pinData;
            });
        }
        
        // Clear current pins and reload
        userPins = [];
        
        // Add hard-coded pins first
        hardCodedPins.forEach(pinData => {
            userPins.push(pinData);
            console.log('Adding hard-coded pin:', pinData);
            
            // Create marker if Google Maps is available
            if (typeof google !== 'undefined' && google.maps && map) {
                console.log('Creating marker for hard-coded pin');
                createPinMarker(pinData);
            } else {
                console.log('Google Maps not ready yet for hard-coded pin');
            }
        });
        
        // Add user-created pins
        userCreatedPins.forEach(pinData => {
            userPins.push(pinData);
            
            // Create marker if Google Maps is available
            if (typeof google !== 'undefined' && google.maps && map) {
                createPinMarker(pinData);
            }
        });
        
        console.log('Successfully loaded', userPins.length, 'pins (including hard-coded)');
        
    } catch (error) {
        console.error('Error loading pins:', error);
    }
}

function downloadPinsFile() {
    try {
        const pinsToSave = userPins
            .filter(pin => pin.id !== 1756574202596 && pin.id !== 1756576515738 && pin.id !== 1756576659444) // Exclude hard-coded pins
            .map(pin => {
                const { marker, ...pinData } = pin;
                return pinData;
            });
        
        const dataStr = JSON.stringify(pinsToSave, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pins.json';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('User pins file downloaded to your Downloads folder');
    } catch (error) {
        console.error('Error downloading pins file:', error);
    }
}

function clearAllPins() {
    // Remove only user-created markers from map, keep hard-coded pins
    userPins.forEach(pin => {
        if (pin.marker && pin.id !== 1756574202596 && pin.id !== 1756576515738 && pin.id !== 1756576659444) {
            pin.marker.setMap(null);
        }
    });
    
    // Keep hard-coded pins, remove only user-created ones
    userPins = userPins.filter(pin => pin.id === 1756574202596 || pin.id === 1756576515738 || pin.id === 1756576659444);
    localStorage.removeItem('userPins');
    
    // Also clear the file by downloading an empty one
    const emptyData = JSON.stringify([], null, 2);
    const dataBlob = new Blob([emptyData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pins.json';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('User pins cleared from map and storage (hard-coded pins preserved)');
    showToast('User pins cleared - hard-coded pins preserved');
}

function loadPinsFromFile() {
    const fileInput = document.getElementById('pins-file-input');
    fileInput.click();
}

// Initialize file upload handler
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('pins-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const pinsData = JSON.parse(event.target.result);
                        
                        // Clear existing pins
                        userPins.forEach(pin => {
                            if (pin.marker) {
                                pin.marker.setMap(null);
                            }
                        });
                        userPins = [];
                        
                        // Load pins from file
                        pinsData.forEach(pinData => {
                            pinData.timestamp = new Date(pinData.timestamp);
                            userPins.push(pinData);
                            
                            if (typeof google !== 'undefined' && google.maps && map) {
                                createPinMarker(pinData);
                            }
                        });
                        
                        // Save to localStorage as backup
                        localStorage.setItem('userPins', JSON.stringify(pinsData));
                        
                        showToast(`Loaded ${pinsData.length} pins from file`);
                        console.log('Successfully loaded pins from uploaded file');
                        
                    } catch (error) {
                        console.error('Error parsing pins file:', error);
                        showToast('Error: Invalid pins file format');
                    }
                };
                reader.readAsText(file);
            } else {
                showToast('Please select a valid JSON file');
            }
            
            // Reset file input
            e.target.value = '';
        });
    }
});

function setupMapClickHandler() {
    map.addListener('click', (event) => {
        if (isAddingPin) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            openPinModal(lat, lng);
        }
    });
}

function openPinModal(lat, lng) {
    console.log('Opening pin modal with location:', lat, lng);
    pendingPinLocation = { lat, lng };
    const pinModal = document.getElementById('pin-modal-overlay');
    
    if (!pinModal) {
        console.error('Pin modal not found!');
        return;
    }
    
    pinModal.classList.add('active');
    
    // Reset form
    document.getElementById('pin-title').value = '';
    document.getElementById('pin-description').value = '';
    document.querySelector('input[name="category"][value="landmark"]').checked = true;
    document.getElementById('pin-image-preview').innerHTML = '';
    document.getElementById('pin-photo').value = '';
    
    // Enable create button (we'll validate on submit)
    const createBtn = document.getElementById('create-pin-btn');
    if (createBtn) {
        createBtn.disabled = false;
        console.log('Create button enabled');
    } else {
        console.error('Create pin button not found!');
    }
}

// Category icons and colors
const categoryConfig = {
    landmark: {
        icon: 'photo/landmark.webp',
        color: '#4285f4',
        emoji: '🏛️'
    },
    nature: {
        icon: 'photo/nature.webp', 
        color: '#34a853',
        emoji: '🌲'
    },
    meme: {
        icon: 'photo/meme.webp',
        color: '#fbbc04',
        emoji: '😄'
    },
    event: {
        icon: 'photo/event.webp',
        color: '#ea4335',
        emoji: '🎉'
    }
};

function createUserPin(lat, lng, title, description, category, customPhoto) {
    console.log('createUserPin called with:', { lat, lng, title, description, category, customPhoto });
    
    const pinData = {
        id: Date.now(),
        lat: lat,
        lng: lng,
        title: title,
        description: description,
        category: category,
        customPhoto: customPhoto,
        timestamp: new Date()
    };
    
    userPins.push(pinData);
    console.log('Pin data added to userPins array');
    
    // Create marker on map (if Google Maps is available)
    if (typeof google !== 'undefined' && google.maps && map) {
        console.log('Creating Google Maps marker with webp icon');
        createPinMarker(pinData);
        console.log('Google Maps marker created successfully');
    } else {
        console.warn('Google Maps not available, storing pin data only');
    }
    
    // Save to localStorage
    savePinsToStorage();
}

function createPinMarker(pinData) {
    console.log('createPinMarker called with:', pinData);
    
    // Always use the category icon for the pin marker on the map
    const iconUrl = `photo/${pinData.category}.webp`;
    console.log('Using category icon:', iconUrl);
    
    console.log('Creating marker at:', pinData.lat, pinData.lng, 'with icon:', iconUrl);
    
    const marker = new google.maps.Marker({
        position: { lat: pinData.lat, lng: pinData.lng },
        map: map,
        title: pinData.title,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
        }
    });

    console.log('Marker created successfully');

    marker.addListener('click', () => {
        showPinDetails(pinData);
    });
    
    // Store marker reference for deletion
    pinData.marker = marker;
}

function showPinDetails(pinData) {
    console.log('showPinDetails called with pinData:', pinData);
    console.log('Pin ID:', pinData.id, 'Type:', typeof pinData.id);
    
    const modal = document.getElementById('pin-details-overlay');
    const photo = document.getElementById('pin-details-photo');
    const title = document.getElementById('pin-details-title');
    const category = document.getElementById('pin-details-category');
    const description = document.getElementById('pin-details-description');
    
    // Set photo
    if (pinData.customPhoto) {
        console.log('Using custom photo:', pinData.customPhoto);
        photo.src = pinData.customPhoto;
        photo.style.display = 'block';
    } else if (pinData.id === 1756574202596) {
        // Use Haymarket cat image for the specific hard-coded pin
        console.log('Using Haymarket cat image');
        photo.src = 'photo/Haymarket cat.png';
        photo.style.display = 'block';
    } else if (pinData.id === 1756576515738) {
        // Use Redfern cat image for the specific hard-coded pin
        console.log('Using Redfern cat image');
        photo.src = 'photo/redfern cat.png';
        photo.style.display = 'block';
    } else if (pinData.id === 1756576659444) {
        // Use Cherry Blossom image for the specific hard-coded pin
        console.log('Using Cherry Blossom image');
        photo.src = 'photo/cherry blossom.png';
        photo.style.display = 'block';
    } else {
        console.log('Using category icon for category:', pinData.category);
        const categoryData = categoryConfig[pinData.category];
        photo.src = categoryData.icon;
        photo.style.display = 'block';
    }
    
    console.log('Final photo src:', photo.src);
    
    // Set content
    title.textContent = pinData.title;
    category.innerHTML = `${categoryConfig[pinData.category].emoji} ${pinData.category.charAt(0).toUpperCase() + pinData.category.slice(1)}`;
    description.textContent = pinData.description || 'No description provided.';
    
    // Store current pin ID for deletion
    modal.dataset.pinId = pinData.id;
    
    // Show modal
    modal.classList.add('active');
}

function deleteUserPin(pinId) {
    const pinIndex = userPins.findIndex(pin => pin.id === pinId);
    if (pinIndex !== -1) {
        const pin = userPins[pinIndex];
        
        // Remove marker from map
        if (pin.marker) {
            pin.marker.setMap(null);
        }
        
        // Remove from array
        userPins.splice(pinIndex, 1);
        
        // Update localStorage
        savePinsToStorage();
        
        // Close details modal if open
        const detailsModal = document.getElementById('pin-details-overlay');
        detailsModal.classList.remove('active');
        
        showToast('Pin deleted');
    }
}

// Make functions globally available
window.deleteUserPin = deleteUserPin;

function setupAchievements() {
    const achievementsBtn = document.getElementById('show-achievements-btn');
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', showAllAchievements);
    }
}

function showAllAchievements() {
    // Check if achievements are already shown
    if (window.achievementMarkers && window.achievementMarkers.length > 0) {
        // Hide achievements
        window.achievementMarkers.forEach(marker => marker.setMap(null));
        window.achievementMarkers = [];
        
        // Reset map to default view
        map.setCenter({ lat: -33.8688, lng: 151.2093 });
        map.setZoom(12);
        
        // Update button text
        const achievementsBtn = document.getElementById('show-achievements-btn');
        if (achievementsBtn) {
            achievementsBtn.textContent = '🏆 Show Achievements';
        }
        
        showToast('Achievements hidden');
        return;
    }
    
    // Define achievement locations (matching the ones in profile.html)
    const achievements = [
        {
            title: "First Landing",
            location: { lat: 33.875, lng: 151.2057 },
            name: "Sydney Opera House",
            icon: "✈️",
            description: "AuthentiCITY: Complete your first check-in."
        },
        {
            title: "City Explorer",
            location: { lat: -33.8688, lng: 151.2093 },
            name: "Bondi Beach",
            icon: "📚",
            description: "Visited 10 different cities in your region."
        },
        {
            title: "Cultural Pioneer",
            location: { lat: -33.8568, lng: 151.2153 },
            name: "The Rocks",
            icon: "🏛️",
            description: "You discovered a hidden historical landmark."
        },
        {
            title: "Map Architect",
            location: { lat: -33.8688, lng: 151.2093 },
            name: "Darling Harbour",
            icon: "🗺️",
            description: "Created 25 custom location pins."
        },
        {
            title: "Global Citizen",
            location: { lat: -33.9249, lng: 151.2596 },
            name: "Manly Beach",
            icon: "🌏",
            description: "Visited places in 5 different countries."
        },
        {
            title: "Storyteller",
            location: { lat: -33.8688, lng: 151.2093 },
            name: "Circular Quay",
            icon: "💬",
            description: "Shared 50 authentic experiences."
        }
    ];
    
    // Create markers for all achievements
    window.achievementMarkers = [];
    
    achievements.forEach(achievement => {
        const marker = new google.maps.Marker({
            position: achievement.location,
            map: map,
            title: achievement.title,
            icon: {
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjZmZkNzAwIi8+Cjwvc3ZnPg==',
                scaledSize: new google.maps.Size(35, 35)
            }
        });
        
        // Add click listener for achievement info
        marker.addListener('click', () => {
            const content = `
                <div style="color: #333; max-width: 250px;">
                    <h3 style="margin: 0 0 8px 0; color: #000; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">${achievement.icon}</span>
                        ${achievement.title}
                    </h3>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                        <strong>Location:</strong> ${achievement.name}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #888;">
                        ${achievement.description}
                    </p>
                    <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #ffd700;">
                        <span>🏆</span>
                        <span>Achievement Unlocked!</span>
                    </div>
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
        
        window.achievementMarkers.push(marker);
    });
    
    // Fit map to show all achievements
    const bounds = new google.maps.LatLngBounds();
    achievements.forEach(achievement => {
        bounds.extend(achievement.location);
    });
    map.fitBounds(bounds);
    
    // Update button text
    const achievementsBtn = document.getElementById('show-achievements-btn');
    if (achievementsBtn) {
        achievementsBtn.textContent = '🏆 Hide Achievements';
    }
    
    // Show success message
    showToast('Showing all achievement locations!');
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;