// Modal functionality
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const modalOverlay = document.getElementById('modalOverlay');
const campaignTypeForm = document.getElementById('campaignTypeForm');

// Step navigation
let currentStep = 1;
const totalSteps = 4;

// Open modal
openModalBtn.addEventListener('click', () => {
    resetForm();
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close modal
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

function resetForm() {
    currentStep = 1;
    showStep(1);
    updateStepIndicator();
    // Reset form data
    document.getElementById('campaignTypeForm').reset();
    document.getElementById('campaignDetailsForm').reset();
    document.getElementById('step2CampaignTitle').value = '';
    document.getElementById('step2TitleDefault').textContent = 'False Ceiling';
    document.getElementById('uploadedFiles').innerHTML = '';
    document.querySelector('input[name="campaignType"][value="residential"]').checked = true;
}

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Step navigation functions
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    
    // Show current step
    const stepElement = document.getElementById(`step${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
    }
}

function updateStepIndicator() {
    document.querySelectorAll('.step-item').forEach((item, index) => {
        const stepNum = index + 1;
        item.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            item.classList.add('active');
        } else if (stepNum < currentStep) {
            item.classList.add('completed');
        }
    });
}

// Step 1 to Step 2
document.getElementById('nextToStep2').addEventListener('click', () => {
    const selectedType = document.querySelector('input[name="campaignType"]:checked').value;
    
    // Update step 2 title block: label + editable title + default subtitle
    const step2TitleInput = document.getElementById('step2CampaignTitle');
    const step2TitleDefault = document.getElementById('step2TitleDefault');
    if (selectedType === 'residential') {
        step2TitleInput.placeholder = 'e.g. Bedroom renovation';
        step2TitleInput.value = '';
        step2TitleDefault.textContent = 'False Ceiling';
        step2TitleDefault.style.display = '';
    } else {
        step2TitleInput.placeholder = 'e.g. Office renovation';
        step2TitleInput.value = '';
        step2TitleDefault.textContent = 'Office Renovation';
        step2TitleDefault.style.display = '';
    }
    
    // Pre-fill example text
    const campaignGoal = document.getElementById('campaignGoal');
    if (selectedType === 'residential') {
        campaignGoal.value = 'I want to set a false ceiling in my bedroom';
    } else {
        campaignGoal.value = 'I want to renovate the office space with modern fixtures';
    }
    
    currentStep = 2;
    showStep(2);
    updateStepIndicator();
});

// Step 2 to Step 1 (Back)
document.getElementById('backToStep1').addEventListener('click', () => {
    currentStep = 1;
    showStep(1);
    updateStepIndicator();
});

// Step 2 to Step 3 (Continue)
document.getElementById('nextToStep3').addEventListener('click', () => {
    const goal = document.getElementById('campaignGoal').value.trim();
    if (!goal) {
        alert('Please describe what you want to achieve');
        return;
    }
    currentStep = 3;
    showStep(3);
    updateStepIndicator();
    setTimeout(() => {
        initCanvas();
    }, 100);
});

// Step 3 to Step 2 (Back)
document.getElementById('backToStep2').addEventListener('click', () => {
    currentStep = 2;
    showStep(2);
    updateStepIndicator();
});

// Step 3 to Step 4
document.getElementById('nextToStep4').addEventListener('click', () => {
    currentStep = 4;
    showStep(4);
    updateStepIndicator();
});

// Step 4 to Step 3 (Back)
document.getElementById('backToStep3').addEventListener('click', () => {
    currentStep = 3;
    showStep(3);
    updateStepIndicator();
    setTimeout(() => {
        initCanvas();
    }, 100);
});

// Submit campaign
document.getElementById('submitCampaign').addEventListener('click', () => {
    alert('Campaign created successfully!');
    closeModal();
});

// File upload functionality
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadedFiles = document.getElementById('uploadedFiles');
let uploadedFilesList = [];

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            uploadedFilesList.push(file);
            displayUploadedFile(file);
        }
    });
}

function displayUploadedFile(file) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'uploaded-file';
    fileDiv.innerHTML = `
        <span>${file.name}</span>
        <button type="button" class="uploaded-file-remove" data-filename="${file.name}">&times;</button>
    `;
    
    uploadedFiles.appendChild(fileDiv);
    
    // Remove file functionality
    fileDiv.querySelector('.uploaded-file-remove').addEventListener('click', () => {
        uploadedFilesList = uploadedFilesList.filter(f => f.name !== file.name);
        fileDiv.remove();
    });
}

// Drawing functionality for Step 3
let isDrawingMode = false;
let isDrawing = false;
let startX = 0;
let startY = 0;
let rectangles = [];
let rectangleIdCounter = 0;

const drawModeBtn = document.getElementById('drawModeBtn');
const clearDrawingsBtn = document.getElementById('clearDrawingsBtn');
const designWrapper = document.getElementById('designWrapper');
const drawingCanvas = document.getElementById('drawingCanvas');
const rectanglesContainer = document.getElementById('rectanglesContainer');
const approveRerenderBtn = document.getElementById('approveRerenderBtn');

// Initialize canvas
function initCanvas() {
    const img = document.getElementById('designImageAnnotated');
    const wrapper = designWrapper;
    
    function resizeCanvas() {
        const rect = wrapper.getBoundingClientRect();
        drawingCanvas.width = rect.width;
        drawingCanvas.height = rect.height;
        redrawRectangles();
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Redraw when image loads
    if (img.complete) {
        resizeCanvas();
    } else {
        img.addEventListener('load', resizeCanvas);
    }
}

// Toggle drawing mode
drawModeBtn.addEventListener('click', () => {
    isDrawingMode = !isDrawingMode;
    if (isDrawingMode) {
        designWrapper.classList.add('drawing-mode');
        drawModeBtn.classList.add('active');
        drawModeBtn.querySelector('span:last-child').textContent = 'Stop Drawing';
    } else {
        designWrapper.classList.remove('drawing-mode');
        drawModeBtn.classList.remove('active');
        drawModeBtn.querySelector('span:last-child').textContent = 'Draw Rectangle';
    }
});

// Clear all drawings
clearDrawingsBtn.addEventListener('click', () => {
    if (confirm('Clear all rectangles?')) {
        rectangles = [];
        rectanglesContainer.innerHTML = '<p class="no-rectangles">No rectangles drawn yet. Click "Draw Rectangle" to start.</p>';
        redrawRectangles();
    }
});

// Drawing event handlers
drawingCanvas.addEventListener('mousedown', (e) => {
    if (!isDrawingMode) return;
    
    isDrawing = true;
    const rect = drawingCanvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
});

drawingCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawingMode || !isDrawing) return;
    
    const rect = drawingCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const ctx = drawingCanvas.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    redrawRectangles();
    
    // Draw current rectangle being drawn
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
        Math.min(startX, currentX),
        Math.min(startY, currentY),
        Math.abs(currentX - startX),
        Math.abs(currentY - startY)
    );
});

drawingCanvas.addEventListener('mouseup', (e) => {
    if (!isDrawingMode || !isDrawing) return;
    
    isDrawing = false;
    const rect = drawingCanvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    // Only create rectangle if it has minimum size
    if (width > 10 && height > 10) {
        const rectangle = {
            id: rectangleIdCounter++,
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: width,
            height: height,
            prompt: ''
        };
        
        rectangles.push(rectangle);
        addRectangleToList(rectangle);
        redrawRectangles();
    } else {
        // Redraw without the temporary rectangle
        redrawRectangles();
    }
});

// Redraw all rectangles on canvas
function redrawRectangles() {
    const ctx = drawingCanvas.getContext('2d');
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
    rectangles.forEach(rect => {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        
        // Add number label
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`#${rect.id + 1}`, rect.x + 4, rect.y + 18);
    });
}

// Add rectangle to list
function addRectangleToList(rectangle) {
    if (rectanglesContainer.querySelector('.no-rectangles')) {
        rectanglesContainer.innerHTML = '';
    }
    
    const rectangleItem = document.createElement('div');
    rectangleItem.className = 'rectangle-item';
    rectangleItem.dataset.id = rectangle.id;
    
    rectangleItem.innerHTML = `
        <div class="rectangle-preview">#${rectangle.id + 1}</div>
        <div class="rectangle-info">
            <textarea 
                class="rectangle-prompt-input" 
                placeholder="Add prompt for this area (e.g., Change ceiling color to white, Increase drop height...)"
                rows="2"
            >${rectangle.prompt}</textarea>
        </div>
        <button type="button" class="rectangle-remove" data-id="${rectangle.id}">&times;</button>
    `;
    
    rectanglesContainer.appendChild(rectangleItem);
    
    // Handle prompt input
    const promptInput = rectangleItem.querySelector('.rectangle-prompt-input');
    promptInput.addEventListener('input', (e) => {
        rectangle.prompt = e.target.value;
    });
    
    // Handle remove
    const removeBtn = rectangleItem.querySelector('.rectangle-remove');
    removeBtn.addEventListener('click', () => {
        rectangles = rectangles.filter(r => r.id !== rectangle.id);
        rectangleItem.remove();
        redrawRectangles();
        
        if (rectangles.length === 0) {
            rectanglesContainer.innerHTML = '<p class="no-rectangles">No rectangles drawn yet. Click "Draw Rectangle" to start.</p>';
        }
    });
}

// Approve rerender
approveRerenderBtn.addEventListener('click', () => {
    if (rectangles.length === 0) {
        alert('Please draw at least one rectangle to mark areas for changes.');
        return;
    }
    
    const rectanglesWithPrompts = rectangles.filter(r => r.prompt.trim() !== '');
    if (rectanglesWithPrompts.length === 0) {
        alert('Please add prompts to at least one rectangle.');
        return;
    }
    
    // Show confirmation
    const changes = rectanglesWithPrompts.map((r, i) => 
        `${i + 1}. ${r.prompt}`
    ).join('\n');
    
    if (confirm(`Submit these changes for rerender?\n\n${changes}`)) {
        alert('Design changes submitted! The design will be rerendered with your requested modifications.');
        // Here you would typically send the data to the backend
        console.log('Rectangles for rerender:', rectanglesWithPrompts);
    }
});


// Initialize
updateStepIndicator();
