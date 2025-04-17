// CV Builder JavaScript

// Initialize variables
let currentSection = 0;
const sections = document.querySelectorAll('.form-section');
let cvStrength = 0;
const maxStrength = 100;

// AI-powered suggestions
const suggestions = {
    profession: [
        "Fafanua zaidi taaluma yako (e.g., 'Mhandisi wa Programu Mwandamizi' badala ya 'Mhandisi')",
        "Ongeza umahususi wa sekta yako",
        "Tumia maneno yanayoonyesha utaalam wako"
    ],
    education: [
        "Ongeza GPA yako ikiwa ni nzuri",
        "Taja masomo muhimu uliyofanya",
        "Ongeza tuzo zozote ulizopata"
    ],
    experience: [
        "Tumia vitenzi vyenye nguvu (e.g., 'Niliongoza' badala ya 'Nilifanya')",
        "Ongeza takwimu na matokeo halisi",
        "Eleza jinsi ulivyotatua changamoto"
    ]
};

// Spell check dictionaries
const swahiliDictionary = new Set([
    "kazi", "elimu", "ujuzi", "uzoefu", "chuo", "shule", "shahada",
    "diploma", "cheti", "mwaka", "kampuni", "simu", "barua", "pepe"
    // Add more Swahili words
]);

const englishDictionary = new Set([
    "the", "and", "experience", "education", "skills", "university",
    "college", "degree", "diploma", "certificate", "year", "company"
    // Add more English words
]);

// Accessibility Enhancements
const a11y = {
    // ARIA labels and descriptions
    labels: {
        cvBuilder: 'CV Builder Application',
        templateSelector: 'CV Template Selection',
        previewSection: 'CV Preview',
        printControls: 'Print and Export Controls',
        colorPicker: 'Template Color Selection',
        fontSelector: 'Font Style Selection'
    },

    // Keyboard navigation
    keys: {
        next: ['ArrowRight', 'ArrowDown'],
        previous: ['ArrowLeft', 'ArrowUp'],
        select: ['Enter', ' '],
        escape: ['Escape']
    },

    // Focus management
    focusableElements: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    
    // Screen reader announcements
    announcements: {
        templateChanged: template => `Selected ${template} template`,
        colorChanged: color => `Changed color scheme to ${color}`,
        fontChanged: font => `Changed font to ${font}`,
        printStarted: 'Preparing document for printing',
        pdfStarted: 'Generating PDF document',
        success: message => `Success: ${message}`,
        error: message => `Error: ${message}`
    }
};

// Initialize accessibility features
function initAccessibility() {
    // Add ARIA landmarks and labels
    addAriaLabels();
    
    // Setup keyboard navigation
    setupKeyboardNav();
    
    // Initialize focus trap for modals
    initFocusTraps();
    
    // Add screen reader announcements
    setupAnnouncements();
    
    // Setup skip links
    addSkipLinks();
}

// Add ARIA labels and landmarks
function addAriaLabels() {
    // Main regions
    document.querySelector('.cv-builder').setAttribute('role', 'main');
    document.querySelector('.cv-builder').setAttribute('aria-label', a11y.labels.cvBuilder);
    
    // Template selection
    const templateSection = document.querySelector('.template-selector');
    templateSection.setAttribute('role', 'region');
    templateSection.setAttribute('aria-label', a11y.labels.templateSelector);
    
    // Preview section
    const previewSection = document.querySelector('.preview-section');
    previewSection.setAttribute('role', 'region');
    previewSection.setAttribute('aria-label', a11y.labels.previewSection);
    
    // Controls
    document.querySelectorAll('button').forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
}

// Setup keyboard navigation
function setupKeyboardNav() {
    // Template selection keyboard navigation
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', 'false');
        
        card.addEventListener('keydown', (e) => {
            if (a11y.keys.select.includes(e.key)) {
                e.preventDefault();
                card.click();
            } else if (a11y.keys.next.includes(e.key)) {
                e.preventDefault();
                const nextCard = templateCards[index + 1] || templateCards[0];
                nextCard.focus();
            } else if (a11y.keys.previous.includes(e.key)) {
                e.preventDefault();
                const prevCard = templateCards[index - 1] || templateCards[templateCards.length - 1];
                prevCard.focus();
            }
        });
    });
}

// Initialize focus traps for modals
function initFocusTraps() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const focusableElements = modal.querySelectorAll(a11y.focusableElements);
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    });
}

// Setup live announcements for screen readers
function setupAnnouncements() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.classList.add('sr-only');
    document.body.appendChild(liveRegion);
    
    // Function to make announcements
    window.announce = (message, type = 'polite') => {
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    };
}

// Add skip links for keyboard navigation
function addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.classList.add('skip-link');
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Initialize the CV builder
function initCVBuilder() {
    updateNavigation();
    attachInputListeners();
    updateCVStrength();
    initAccessibility();
}

// Navigation functions
function navigate(direction) {
    const newSection = currentSection + direction;
    if (newSection >= 0 && newSection < sections.length) {
        sections[currentSection].classList.remove('active');
        sections[newSection].classList.add('active');
        currentSection = newSection;
        updateNavigation();
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const generateBtn = document.getElementById('generateBtn');

    prevBtn.style.display = currentSection === 0 ? 'none' : 'block';
    nextBtn.style.display = currentSection === sections.length - 1 ? 'none' : 'block';
    generateBtn.style.display = currentSection === sections.length - 1 ? 'block' : 'none';
}

// Input listeners and CV strength calculation
function attachInputListeners() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            updateCVStrength();
            checkSpelling(input);
            showAISuggestion(input);
        }, 500));
    });
}

function updateCVStrength() {
    let totalStrength = 0;
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        const strength = parseInt(input.dataset.strength) || 0;
        if (input.value.trim().length > 0) {
            totalStrength += strength;
        }
    });

    cvStrength = Math.min((totalStrength / maxStrength) * 100, 100);
    document.getElementById('cvStrength').style.width = `${cvStrength}%`;
    document.getElementById('cvStrengthText').textContent = 
        `CV yako imekamilika kwa ${Math.round(cvStrength)}%`;

    updateStrengthColor();
}

function updateStrengthColor() {
    const progressBar = document.getElementById('cvStrength');
    if (cvStrength < 30) {
        progressBar.style.backgroundColor = 'var(--error-color)';
    } else if (cvStrength < 70) {
        progressBar.style.backgroundColor = 'var(--warning-color)';
    } else {
        progressBar.style.backgroundColor = 'var(--success-color)';
    }
}

// AI Suggestions
function showAISuggestion(input) {
    const suggestionContainer = input.parentElement.querySelector('.ai-suggestion');
    if (!suggestionContainer) return;

    const value = input.value.trim();
    if (value.length > 0) {
        const category = input.id || input.classList[1];
        const relevantSuggestions = suggestions[category];
        
        if (relevantSuggestions) {
            const suggestion = relevantSuggestions[Math.floor(Math.random() * relevantSuggestions.length)];
            suggestionContainer.innerHTML = `<i class="fas fa-lightbulb"></i> ${suggestion}`;
            suggestionContainer.classList.add('active');
        }
    } else {
        suggestionContainer.classList.remove('active');
    }
}

// Simplified spell check configuration
const spellCheckConfig = {
    enabled: false, // Disabled by default
    autoCheck: false, // Won't check automatically
    ignoredWords: new Set(), // Words to ignore
    debounceDelay: 1000 // Delay before checking
};

// Toggle spell check
function toggleSpellCheck() {
    spellCheckConfig.enabled = !spellCheckConfig.enabled;
    const button = document.querySelector('.spell-check-toggle');
    if (button) {
        button.classList.toggle('active', spellCheckConfig.enabled);
        button.setAttribute('aria-pressed', spellCheckConfig.enabled);
        button.innerHTML = `
            <i class="fas fa-spell-check"></i>
            ${spellCheckConfig.enabled ? 'Disable' : 'Enable'} Spell Check
        `;
    }
    
    // Clear existing spell check markers if disabled
    if (!spellCheckConfig.enabled) {
        clearSpellCheckMarkers();
    }
}

// Clear spell check markers
function clearSpellCheckMarkers() {
    document.querySelectorAll('.spell-error').forEach(element => {
        element.classList.remove('spell-error');
        element.removeAttribute('data-spell-suggestions');
    });
}

// Optional spell check function
function checkSpelling(text) {
    if (!spellCheckConfig.enabled) return [];
    
    const words = text.split(/\s+/);
    const errors = [];
    
    words.forEach(word => {
        // Skip if word is in ignored list or is empty
        if (spellCheckConfig.ignoredWords.has(word.toLowerCase()) || !word.trim()) {
            return;
        }
        
        // Basic spell check (you can enhance this with a proper dictionary)
        if (!swahiliDictionary.has(word.toLowerCase()) && !englishDictionary.has(word.toLowerCase())) {
            errors.push(word);
        }
    });
    
    return errors;
}

// Add spell check toggle button
function addSpellCheckToggle() {
    const controls = document.querySelector('.cv-controls');
    if (!controls) return;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'spell-check-toggle';
    toggleButton.setAttribute('type', 'button');
    toggleButton.setAttribute('aria-pressed', 'false');
    toggleButton.innerHTML = '<i class="fas fa-spell-check"></i> Enable Spell Check';
    
    toggleButton.addEventListener('click', toggleSpellCheck);
    controls.appendChild(toggleButton);
}

// Initialize spell check
function initSpellCheck() {
    addSpellCheckToggle();
    
    // Add event listener for content editable elements
    document.addEventListener('input', (e) => {
        if (!spellCheckConfig.enabled) return;
        
        const target = e.target;
        if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            debounce(() => {
                const errors = checkSpelling(target.value || target.textContent);
                if (errors.length > 0) {
                    // Just show a subtle indicator instead of preventing operation
                    target.classList.add('has-spelling-errors');
                } else {
                    target.classList.remove('has-spelling-errors');
                }
            }, spellCheckConfig.debounceDelay)();
        }
    });
}

// PDF Generation and Preview
async function handlePDF(action = 'preview') {
    // Show loading state
    showLoadingOverlay('Preparing high-quality PDF...');
    
    // Prepare CV for PDF
    const cvContent = document.getElementById('previewContent');
    const originalStyles = cvContent.style.cssText;
    
    try {
        // Add print preparation class
        cvContent.classList.add('print-preview');

        // Generate QR code for digital version
        const qrCode = document.createElement('div');
        qrCode.className = 'cv-qr-code';
        const qrUrl = window.location.href;
        const qrImage = await generateQRCode(qrUrl, {
            width: 300,
            height: 300,
            margin: 2,
            quality: 1.0
        });
        qrCode.appendChild(qrImage);
        cvContent.appendChild(qrCode);

        // Enhanced PDF options for better quality
        const pdfOptions = {
            margin: [10, 10, 10, 10], // Uniform margins
            filename: 'CV.pdf',
            image: { 
                type: 'jpeg', 
                quality: 1.0  // Maximum image quality
            },
            html2canvas: { 
                scale: 3,  // Higher scale for better resolution
                useCORS: true,
                logging: false,
                allowTaint: true,
                letterRendering: true,
                foreignObjectRendering: true, // Better font rendering
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.documentElement.clientWidth,
                windowHeight: document.documentElement.clientHeight,
                // Enhanced text rendering
                onclone: (doc) => {
                    const content = doc.querySelector('#previewContent');
                    if (content) {
                        // Ensure fonts are loaded
                        document.fonts.ready.then(() => {
                            // Apply text rendering optimization
                            content.style.webkitFontSmoothing = 'antialiased';
                            content.style.mozOsxFontSmoothing = 'grayscale';
                            content.style.textRendering = 'optimizeLegibility';
                        });
                    }
                }
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: false, // Better quality without compression
                precision: 16, // Higher precision for better text rendering
                putOnlyUsedFonts: true,
                floatPrecision: 16 // Better positioning precision
            }
        };

        // Generate PDF
        const pdf = await html2pdf().set(pdfOptions).from(cvContent);
        
        if (action === 'preview') {
            // Get PDF blob for preview with maximum quality
            const blob = await pdf.output('blob');
            showPDFPreview(blob);
        } else {
            // Download high-quality PDF
            await pdf.save();
            showNotification('High-quality PDF downloaded successfully!', 'success');
        }
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');
    } finally {
        // Clean up
        cvContent.classList.remove('print-preview');
        cvContent.style.cssText = originalStyles;
        const qrCode = cvContent.querySelector('.cv-qr-code');
        if (qrCode) qrCode.remove();
        hideLoadingOverlay();
    }
}

// Enhanced QR code generation
async function generateQRCode(url, options = {}) {
    const defaultOptions = {
        width: 300,
        height: 300,
        margin: 2,
        quality: 1.0,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    };

    const qrOptions = { ...defaultOptions, ...options };
    
    return new Promise((resolve) => {
        const qr = new QRCode(document.createElement('div'), {
            text: url,
            width: qrOptions.width,
            height: qrOptions.height,
            colorDark: qrOptions.color.dark,
            colorLight: qrOptions.color.light,
            correctLevel: QRCode.CorrectLevel.H // Highest error correction level
        });

        const canvas = qr._el.querySelector('canvas');
        const image = new Image();
        image.src = canvas.toDataURL('image/png');
        image.style.width = '100%';
        image.style.height = 'auto';
        
        resolve(image);
    });
}

// Show PDF preview modal
function showPDFPreview(pdfBlob) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('pdfPreviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdfPreviewModal';
        modal.className = 'modal pdf-preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>PDF Preview</h2>
                    <div class="modal-actions">
                        <button class="download-pdf-btn" aria-label="Download PDF">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="close-modal-btn" aria-label="Close preview">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    <iframe class="pdf-preview-frame"></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal-btn');
        const downloadBtn = modal.querySelector('.download-pdf-btn');
        const overlay = modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            URL.revokeObjectURL(modal.querySelector('iframe').src);
        });

        downloadBtn.addEventListener('click', () => {
            handlePDF('download');
        });

        overlay.addEventListener('click', () => {
            modal.classList.remove('active');
            URL.revokeObjectURL(modal.querySelector('iframe').src);
        });

        // Keyboard navigation
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                URL.revokeObjectURL(modal.querySelector('iframe').src);
            }
        });
    }

    // Update iframe source with PDF blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const iframe = modal.querySelector('.pdf-preview-frame');
    iframe.src = pdfUrl;

    // Show modal
    modal.classList.add('active');
}

// Loading overlay
function showLoadingOverlay(message = 'Loading...') {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
}

function hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Update print controls
function addPrintControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'print-controls';
    controlsContainer.innerHTML = `
        <button onclick="togglePrintPreview()" class="preview-button">
            <i class="fas fa-eye"></i> Print Preview
        </button>
        <button onclick="printCV()" class="print-button">
            <i class="fas fa-print"></i> Print CV
        </button>
        <button onclick="handlePDF('preview')" class="pdf-button">
            <i class="fas fa-file-pdf"></i> Preview & Download PDF
        </button>
    `;

    // Add print markers
    const markers = document.createElement('div');
    markers.className = 'print-markers';
    markers.innerHTML = `
        <div class="print-marker print-marker-top"></div>
        <div class="print-marker print-marker-right"></div>
        <div class="print-marker print-marker-bottom"></div>
        <div class="print-marker print-marker-left"></div>
    `;

    document.querySelector('.cv-builder-container').appendChild(controlsContainer);
    document.querySelector('.cv-builder-container').appendChild(markers);
}

// Print preview and optimization
function printCV() {
    announce(a11y.announcements.printStarted);
    // Prepare CV for printing
    const cvContent = document.getElementById('previewContent');
    const originalStyles = cvContent.style.cssText;

    // Add print optimization class
    cvContent.classList.add('print-preview');

    // Create and append temporary QR code
    const qrCode = document.createElement('div');
    qrCode.className = 'cv-qr-code';
    const qrUrl = window.location.href;
    generateQRCode(qrUrl).then(qrImage => {
        qrCode.appendChild(qrImage);
        cvContent.appendChild(qrCode);
        
        // Print the document
        window.print();

        // Clean up after printing
        setTimeout(() => {
            cvContent.classList.remove('print-preview');
            cvContent.style.cssText = originalStyles;
            qrCode.remove();
        }, 1000);
    });
}

// QR Code generation
async function generateQRCode(url) {
    const qr = new QRCode(document.createElement('div'), {
        text: url,
        width: 75,
        height: 75,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    return qr._el;
}

// Print preview mode
function togglePrintPreview() {
    const cvContent = document.getElementById('previewContent');
    const isInPreviewMode = cvContent.classList.contains('print-preview');

    if (!isInPreviewMode) {
        // Enter preview mode
        cvContent.classList.add('print-preview');
        document.body.classList.add('preview-mode');
        
        // Show preview toolbar
        showPreviewToolbar();
    } else {
        // Exit preview mode
        cvContent.classList.remove('print-preview');
        document.body.classList.remove('preview-mode');
        
        // Remove preview toolbar
        const toolbar = document.querySelector('.preview-toolbar');
        if (toolbar) toolbar.remove();
    }
}

// Show preview toolbar
function showPreviewToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'preview-toolbar';
    toolbar.innerHTML = `
        <div class="preview-controls">
            <button class="exit-preview-btn" onclick="togglePrintPreview()">
                <i class="fas fa-times"></i> Exit Preview
            </button>
            <button class="generate-pdf-btn" onclick="handlePDF('preview')">
                <i class="fas fa-file-pdf"></i> Generate PDF
            </button>
            <button class="print-btn" onclick="printCV()">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
        <div class="preview-info">
            <span>Preview Mode</span>
            <span class="page-info">Page 1 of 1</span>
        </div>
    `;
    document.body.appendChild(toolbar);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" 
           aria-hidden="true"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    announce(message, 'assertive');

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add entry functions
function addEducationEntry() {
    const container = document.getElementById('educationEntries');
    const entry = container.children[0].cloneNode(true);
    clearInputs(entry);
    container.appendChild(entry);
    attachInputListeners();
}

function addExperienceEntry() {
    const container = document.getElementById('experienceEntries');
    const entry = container.children[0].cloneNode(true);
    clearInputs(entry);
    container.appendChild(entry);
    attachInputListeners();
}

function addResponsibility(btn) {
    const container = btn.previousElementSibling;
    const entry = container.children[0].cloneNode(true);
    clearInputs(entry);
    container.appendChild(entry);
    attachInputListeners();
}

function addLanguage() {
    const container = document.getElementById('languageEntries');
    const entry = container.children[0].cloneNode(true);
    clearInputs(entry);
    container.appendChild(entry);
}

function clearInputs(element) {
    element.querySelectorAll('input, textarea').forEach(input => {
        input.value = '';
    });
}

// Template Selection
let currentTemplate = 'modern';

function initTemplates() {
    const templateBtns = document.querySelectorAll('.select-template-btn');
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            selectTemplate(template);
        });
    });
}

function selectTemplate(template) {
    // Remove active class from all buttons
    document.querySelectorAll('.select-template-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to selected template button
    const selectedBtn = document.querySelector(`[data-template="${template}"]`);
    selectedBtn.classList.add('active');

    // Update current template
    currentTemplate = template;
    updatePreviewStyle();
    announce(a11y.announcements.templateChanged(template));
}

function updatePreviewStyle() {
    const preview = document.getElementById('previewContent');
    preview.className = `preview-content ${currentTemplate}`;

    // Apply template-specific styles
    switch(currentTemplate) {
        case 'modern':
            applyModernStyle(preview);
            break;
        case 'classic':
            applyClassicStyle(preview);
            break;
        case 'creative':
            applyCreativeStyle(preview);
            break;
        case 'minimalist':
            applyMinimalistStyle(preview);
            break;
        case 'academic':
            applyAcademicStyle(preview);
            break;
        case 'technical':
            applyTechnicalStyle(preview);
            break;
    }

    // Apply section layouts
    applySectionLayouts(currentTemplate);
}

// Font combinations for each template
const fontCombinations = {
    modern: {
        primary: "'Roboto', sans-serif",
        secondary: "'Open Sans', sans-serif",
        heading: "'Poppins', sans-serif",
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            bold: 700
        }
    },
    classic: {
        primary: "'Merriweather', serif",
        secondary: "'Source Sans Pro', sans-serif",
        heading: "'Playfair Display', serif",
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            bold: 700
        }
    },
    creative: {
        primary: "'Poppins', sans-serif",
        secondary: "'Lato', sans-serif",
        heading: "'Poppins', sans-serif",
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            bold: 600
        }
    },
    minimalist: {
        primary: "'Inter', sans-serif",
        secondary: "'Inter', sans-serif",
        heading: "'Inter', sans-serif",
        weights: {
            light: 400,
            regular: 400,
            medium: 500,
            bold: 600
        }
    },
    academic: {
        primary: "'Crimson Text', serif",
        secondary: "'Source Sans Pro', sans-serif",
        heading: "'Playfair Display', serif",
        weights: {
            light: 400,
            regular: 400,
            medium: 600,
            bold: 700
        }
    },
    technical: {
        primary: "'JetBrains Mono', monospace",
        secondary: "'Open Sans', sans-serif",
        heading: "'Inter', sans-serif",
        weights: {
            light: 400,
            regular: 400,
            medium: 500,
            bold: 600
        }
    }
};

// Update template styles with font combinations
function applyTemplateFonts(preview, template) {
    const fonts = fontCombinations[template];
    
    // Apply primary font to body
    preview.style.fontFamily = fonts.primary;

    // Apply heading font to headers
    const headers = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
        header.style.fontFamily = fonts.heading;
        header.style.fontWeight = fonts.weights.bold;
    });

    // Apply secondary font to specific elements
    const secondaryElements = preview.querySelectorAll('.cv-subtitle, .cv-section-subtitle, .cv-meta');
    secondaryElements.forEach(element => {
        element.style.fontFamily = fonts.secondary;
    });

    // Apply font weights
    preview.querySelectorAll('.cv-section-title').forEach(title => {
        title.style.fontWeight = fonts.weights.medium;
    });

    preview.querySelectorAll('.cv-text-light').forEach(text => {
        text.style.fontWeight = fonts.weights.light;
    });

    preview.querySelectorAll('.cv-text-bold').forEach(text => {
        text.style.fontWeight = fonts.weights.bold;
    });
}

function applyTemplateColors(preview, template) {
    preview.classList.remove(
        'template-modern',
        'template-classic',
        'template-creative',
        'template-minimalist',
        'template-academic',
        'template-technical'
    );
    preview.classList.add(`template-${template}`);

    // Apply colors to specific elements
    const headers = preview.querySelectorAll('.cv-section-header');
    headers.forEach(header => {
        header.classList.add('cv-text-primary');
    });

    const subheaders = preview.querySelectorAll('.cv-section-subheader');
    subheaders.forEach(subheader => {
        subheader.classList.add('cv-text-accent');
    });

    const metadata = preview.querySelectorAll('.cv-meta');
    metadata.forEach(meta => {
        meta.classList.add('cv-text-muted');
    });

    // Apply background colors
    const sections = preview.querySelectorAll('.cv-section');
    sections.forEach(section => {
        section.classList.add('cv-bg-light');
    });

    // Apply border colors
    const borders = preview.querySelectorAll('.cv-border');
    borders.forEach(border => {
        border.classList.add('cv-border-primary');
    });
}

function applyModernStyle(preview) {
    applyTemplateFonts(preview, 'modern');
    applyTemplateColors(preview, 'modern');
    preview.style.cssText += `
        padding: 0;
        --heading-font: ${fontCombinations.modern.heading};
        --body-font: ${fontCombinations.modern.primary};
    `;
    const header = preview.querySelector('.cv-header');
    if (header) {
        header.style.cssText = `
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            padding: 2rem;
            border-radius: 0.5rem 0.5rem 0 0;
        `;
    }

    const sections = preview.querySelectorAll('.cv-section');
    sections.forEach(section => {
        section.style.cssText = `
            background: white;
            margin: 1rem;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
    });
}

function applyClassicStyle(preview) {
    applyTemplateFonts(preview, 'classic');
    applyTemplateColors(preview, 'classic');
    preview.style.cssText += `
        padding: 2rem;
        --heading-font: ${fontCombinations.classic.heading};
        --body-font: ${fontCombinations.classic.primary};
    `;
    const header = preview.querySelector('.cv-header');
    if (header) {
        header.style.cssText = `
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        `;
    }

    const sections = preview.querySelectorAll('.cv-section');
    sections.forEach(section => {
        section.style.cssText = `
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--gray-300);
            padding-bottom: 1rem;
        `;
    });
}

function applyCreativeStyle(preview) {
    applyTemplateFonts(preview, 'creative');
    applyTemplateColors(preview, 'creative');
    preview.style.cssText += `
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 2rem;
        padding: 0;
        --heading-font: ${fontCombinations.creative.heading};
        --body-font: ${fontCombinations.creative.primary};
    `;
    const sidebar = document.createElement('div');
    sidebar.className = 'cv-sidebar';
    sidebar.style.cssText = `
        background: linear-gradient(180deg, var(--primary-color), var(--primary-dark));
        color: white;
        padding: 2rem;
        height: 100%;
    `;

    const content = document.createElement('div');
    content.className = 'cv-main-content';
    content.style.cssText = `
        padding: 2rem;
    `;

    // Move existing content
    while (preview.firstChild) {
        content.appendChild(preview.firstChild);
    }

    preview.appendChild(sidebar);
    preview.appendChild(content);
}

function applyMinimalistStyle(preview) {
    applyTemplateFonts(preview, 'minimalist');
    applyTemplateColors(preview, 'minimalist');
    preview.style.cssText += `
        padding: 3rem;
        max-width: 800px;
        margin: 0 auto;
        --heading-font: ${fontCombinations.minimalist.heading};
        --body-font: ${fontCombinations.minimalist.primary};
    `;
    const header = preview.querySelector('.cv-header');
    if (header) {
        header.style.cssText = `
            text-align: center;
            margin-bottom: 3rem;
        `;
    }

    const sections = preview.querySelectorAll('.cv-section');
    sections.forEach(section => {
        section.style.cssText = `
            margin-bottom: 2.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--gray-200);
        `;
    });
}

function applyAcademicStyle(preview) {
    applyTemplateFonts(preview, 'academic');
    applyTemplateColors(preview, 'academic');
    preview.style.cssText += `
        padding: 2rem;
        --heading-font: ${fontCombinations.academic.heading};
        --body-font: ${fontCombinations.academic.primary};
    `;
    const header = preview.querySelector('.cv-header');
    if (header) {
        header.style.cssText = `
            text-align: center;
            border-bottom: 2px solid var(--gray-800);
            margin-bottom: 2rem;
            padding-bottom: 1rem;
        `;
    }

    const sections = preview.querySelectorAll('.cv-section');
    sections.forEach(section => {
        section.style.cssText = `
            margin-bottom: 2rem;
            padding-left: 1rem;
            border-left: 3px solid var(--primary-color);
        `;
    });
}

function applyTechnicalStyle(preview) {
    applyTemplateFonts(preview, 'technical');
    applyTemplateColors(preview, 'technical');
    preview.style.cssText += `
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
        padding: 0;
        --heading-font: ${fontCombinations.technical.heading};
        --body-font: ${fontCombinations.technical.primary};
    `;
    const sidebar = document.createElement('div');
    sidebar.className = 'cv-sidebar';
    sidebar.style.cssText = `
        background: var(--gray-800);
        color: white;
        padding: 2rem;
        height: 100%;
    `;

    const content = document.createElement('div');
    content.className = 'cv-main-content';
    content.style.cssText = `
        padding: 2rem;
        background: white;
    `;

    // Move existing content
    while (preview.firstChild) {
        content.appendChild(preview.firstChild);
    }

    preview.appendChild(sidebar);
    preview.appendChild(content);
}

// Section Layout Management
const sectionLayouts = {
    education: {
        modern: 'cv-timeline',
        classic: 'cv-card',
        creative: 'cv-grid-2',
        minimalist: 'cv-timeline',
        academic: 'cv-timeline',
        technical: 'cv-card'
    },
    experience: {
        modern: 'cv-card',
        classic: 'cv-timeline',
        creative: 'cv-grid-2',
        minimalist: 'cv-card',
        academic: 'cv-timeline',
        technical: 'cv-timeline'
    },
    skills: {
        modern: 'cv-grid-3',
        classic: 'cv-grid-2',
        creative: 'cv-grid-sidebar',
        minimalist: 'cv-grid-compact',
        academic: 'cv-grid-2',
        technical: 'cv-skill-list'
    },
    projects: {
        modern: 'cv-grid-2',
        classic: 'cv-timeline',
        creative: 'cv-grid-3',
        minimalist: 'cv-grid-compact',
        academic: 'cv-card',
        technical: 'cv-grid-2'
    },
    awards: {
        modern: 'cv-grid-2',
        classic: 'cv-list-featured',
        creative: 'cv-grid-3',
        minimalist: 'cv-timeline',
        academic: 'cv-timeline',
        technical: 'cv-card'
    },
    languages: {
        modern: 'cv-grid-3',
        classic: 'cv-list-inline',
        creative: 'cv-grid-compact',
        minimalist: 'cv-grid-2',
        academic: 'cv-grid-2',
        technical: 'cv-skill-list'
    }
};

// Apply section layouts based on template
function applySectionLayouts(template) {
    Object.entries(sectionLayouts).forEach(([section, layouts]) => {
        const sectionElement = document.querySelector(`.cv-${section}`);
        if (sectionElement) {
            // Remove existing layout classes
            const layoutClasses = [
                'cv-timeline', 'cv-card', 'cv-grid-2', 'cv-grid-3',
                'cv-grid-sidebar', 'cv-grid-compact', 'cv-skill-list',
                'cv-list-featured', 'cv-list-inline'
            ];
            sectionElement.classList.remove(...layoutClasses);
            
            // Add new layout class
            sectionElement.classList.add(layouts[template]);
        }
    });
}

// Create section header with line
function createSectionHeader(title) {
    return `
        <div class="cv-section-header">
            <h2 class="cv-section-title">${title}</h2>
            <div class="cv-section-line"></div>
        </div>
    `;
}

// Create timeline item
function createTimelineItem(data) {
    return `
        <div class="cv-timeline-item">
            <div class="cv-timeline-date">${data.date}</div>
            <h3 class="cv-card-title">${data.title}</h3>
            <div class="cv-card-subtitle">${data.subtitle}</div>
            <div class="cv-card-content">${data.content}</div>
        </div>
    `;
}

// Create skill item with progress bar
function createSkillItem(skill, level) {
    return `
        <div class="cv-skill-item">
            <div class="cv-skill-name">${skill}</div>
            <div class="cv-skill-bar">
                <div class="cv-skill-progress" style="width: ${level}%"></div>
            </div>
        </div>
    `;
}

// Create contact item with icon
function createContactItem(type, value, icon) {
    return `
        <div class="cv-contact-item">
            <div class="cv-contact-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="cv-contact-value">${value}</div>
        </div>
    `;
}

// Add font preview to template cards
function initFontPreviews() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        const template = card.dataset.template;
        const fonts = fontCombinations[template];
        
        const fontPreview = document.createElement('div');
        fontPreview.className = 'font-preview';
        fontPreview.innerHTML = `
            <span style="font-family: ${fonts.heading}; font-weight: ${fonts.weights.bold}">Aa</span>
            <span style="font-family: ${fonts.primary}; font-weight: ${fonts.weights.regular}">Aa</span>
            <span style="font-family: ${fonts.secondary}; font-weight: ${fonts.weights.light}">Aa</span>
        `;
        
        card.querySelector('.template-info').appendChild(fontPreview);
    });
}

// Add color preview to template cards
function initColorPreviews() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        const template = card.dataset.template;
        
        const colorPreview = document.createElement('div');
        colorPreview.className = 'color-preview';
        colorPreview.innerHTML = `
            <div class="color-swatch color-primary" title="Primary Color"></div>
            <div class="color-swatch color-accent" title="Accent Color"></div>
            <div class="color-swatch color-muted" title="Muted Color"></div>
        `;
        
        card.querySelector('.template-info').appendChild(colorPreview);
    });
}

// Initialize sections with proper layouts
function initSectionLayouts() {
    // Add section headers
    document.querySelectorAll('.cv-section').forEach(section => {
        const sectionType = Array.from(section.classList)
            .find(cls => cls.startsWith('cv-'))
            ?.replace('cv-', '');
            
        if (sectionType && sectionType !== 'section') {
            const title = section.getAttribute('data-title') || 
                         sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
            section.insertAdjacentHTML('afterbegin', createSectionHeader(title));
        }
    });

    // Apply initial layouts
    applySectionLayouts(currentTemplate);
}

// Language selector component
function createLanguageSelector() {
    const selector = document.createElement('div');
    selector.className = 'language-selector';
    selector.setAttribute('role', 'region');
    selector.setAttribute('aria-label', i18n.t('accessibility.language_selector'));

    const button = document.createElement('button');
    button.className = 'language-button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.innerHTML = `
        <span class="current-language">${getCurrentLanguageName()}</span>
        <i class="fas fa-globe"></i>
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'language-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', i18n.t('accessibility.language_options'));
    dropdown.hidden = true;

    // Add available languages
    const languages = {
        en: 'English',
        es: 'Español',
        fr: 'Français'
    };

    Object.entries(languages).forEach(([code, name]) => {
        const option = document.createElement('button');
        option.className = 'language-option';
        option.setAttribute('role', 'option');
        option.setAttribute('data-lang', code);
        option.setAttribute('aria-selected', code === i18n.getCurrentLocale());
        
        option.innerHTML = `
            <span class="language-name">${name}</span>
            <span class="language-code">${code.toUpperCase()}</span>
        `;

        option.addEventListener('click', () => {
            i18n.setLocale(code);
            button.querySelector('.current-language').textContent = name;
            dropdown.hidden = true;
            updateLanguageSelection(code);
            translateCV();
        });

        dropdown.appendChild(option);
    });

    // Toggle dropdown
    button.addEventListener('click', () => {
        const isExpanded = dropdown.hidden === false;
        dropdown.hidden = !dropdown.hidden;
        button.setAttribute('aria-expanded', !isExpanded);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) {
            dropdown.hidden = true;
            button.setAttribute('aria-expanded', false);
        }
    });

    // Keyboard navigation
    dropdown.addEventListener('keydown', (e) => {
        const options = [...dropdown.querySelectorAll('.language-option')];
        const currentIndex = options.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                options[(currentIndex + 1) % options.length].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                options[(currentIndex - 1 + options.length) % options.length].focus();
                break;
            case 'Escape':
                dropdown.hidden = true;
                button.setAttribute('aria-expanded', false);
                button.focus();
                break;
        }
    });

    selector.appendChild(button);
    selector.appendChild(dropdown);
    return selector;
}

// Get current language name
function getCurrentLanguageName() {
    const languages = {
        en: 'English',
        es: 'Español',
        fr: 'Français'
    };
    return languages[i18n.getCurrentLocale()] || 'English';
}

// Update language selection state
function updateLanguageSelection(selectedCode) {
    const options = document.querySelectorAll('.language-option');
    options.forEach(option => {
        const isSelected = option.dataset.lang === selectedCode;
        option.setAttribute('aria-selected', isSelected);
    });
}

// Translate CV content
function translateCV() {
    // Update template names
    document.querySelectorAll('.template-name').forEach(el => {
        const key = `templates.${el.dataset.template}`;
        el.textContent = i18n.t(key);
    });

    // Update section titles
    document.querySelectorAll('.cv-section').forEach(section => {
        const sectionType = Array.from(section.classList)
            .find(cls => cls.startsWith('cv-'))
            ?.replace('cv-', '');
            
        if (sectionType && sectionType !== 'section') {
            const title = section.querySelector('.cv-section-title');
            if (title) {
                title.textContent = i18n.t(`sections.${sectionType}`);
            }
        }
    });

    // Update form labels
    document.querySelectorAll('label[data-i18n]').forEach(label => {
        const key = label.dataset.i18n;
        label.textContent = i18n.t(key);
    });

    // Update buttons
    document.querySelectorAll('button[data-i18n]').forEach(button => {
        const key = button.dataset.i18n;
        button.textContent = i18n.t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
        const key = input.dataset.i18nPlaceholder;
        input.placeholder = i18n.t(key);
    });

    // Update validation messages
    document.querySelectorAll('.error-message[data-i18n]').forEach(error => {
        const key = error.dataset.i18n;
        error.textContent = i18n.t(key);
    });

    // Update aria labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        const key = el.dataset.i18nAriaLabel;
        el.setAttribute('aria-label', i18n.t(key));
    });
}

// Initialize i18n
function initI18n() {
    // Add language selector to the header
    const header = document.querySelector('.cv-builder-header');
    const languageSelector = createLanguageSelector();
    header.appendChild(languageSelector);

    // Initial translation
    translateCV();

    // Listen for locale changes
    window.addEventListener('localeChanged', () => {
        translateCV();
    });
}

// Update initialization
document.addEventListener('DOMContentLoaded', () => {
    initCVBuilder();
    initTemplates();
    initFontPreviews();
    initColorPreviews();
    initSectionLayouts();
    initAccessibility();
    initI18n();
    initSpellCheck();
    addPrintControls();

    // Add QR Code script
    const qrScript = document.createElement('script');
    qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    document.head.appendChild(qrScript);

    // Add html2pdf script
    const pdfScript = document.createElement('script');
    pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    document.head.appendChild(pdfScript);
});

// Print and PDF preview
function togglePrintPreview() {
    const previewContent = document.getElementById('previewContent');
    const isInPreviewMode = previewContent.classList.contains('print-preview');

    if (!isInPreviewMode) {
        // Enter preview mode
        previewContent.classList.add('print-preview');
        document.body.classList.add('preview-mode');
        
        // Show preview toolbar
        showPreviewToolbar();
    } else {
        // Exit preview mode
        previewContent.classList.remove('print-preview');
        document.body.classList.remove('preview-mode');
        
        // Remove preview toolbar
        const toolbar = document.querySelector('.preview-toolbar');
        if (toolbar) toolbar.remove();
    }
}

// Show preview toolbar
function showPreviewToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'preview-toolbar';
    toolbar.innerHTML = `
        <div class="preview-controls">
            <button class="exit-preview-btn" onclick="togglePrintPreview()">
                <i class="fas fa-times"></i> Exit Preview
            </button>
            <button class="generate-pdf-btn" onclick="handlePDF('preview')">
                <i class="fas fa-file-pdf"></i> Generate PDF
            </button>
            <button class="print-btn" onclick="printCV()">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
        <div class="preview-info">
            <span>Preview Mode</span>
            <span class="page-info">Page 1 of 1</span>
        </div>
    `;
    document.body.appendChild(toolbar);
}

// Print CV
function printCV() {
    const content = document.getElementById('previewContent');
    const originalStyles = content.style.cssText;
    
    // Add print styles
    content.classList.add('print-preview');
    
    // Print the document
    window.print();
    
    // Restore original styles
    content.style.cssText = originalStyles;
    content.classList.remove('print-preview');
}

// PDF Generation and Preview
async function handlePDF(action = 'preview') {
    // Show loading state
    showLoadingOverlay('Preparing high-quality PDF...');
    
    try {
        // Get the preview content
        const cvContent = document.getElementById('previewContent');
        if (!cvContent) {
            throw new Error('CV content not found');
        }

        // Clone the content to avoid modifying the original
        const clonedContent = cvContent.cloneNode(true);
        
        // Add necessary print styles
        clonedContent.classList.add('print-preview');
        
        // Create a temporary container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.appendChild(clonedContent);
        document.body.appendChild(container);

        // Configure PDF options
        const pdfOptions = {
            margin: [10, 10, 10, 10],
            filename: 'CV.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 3,
                useCORS: true,
                logging: false,
                allowTaint: true,
                letterRendering: true,
                foreignObjectRendering: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 794, // A4 width in pixels at 96 DPI
                windowHeight: 1123, // A4 height in pixels at 96 DPI
                onclone: (doc) => {
                    const content = doc.querySelector('#previewContent');
                    if (content) {
                        content.style.webkitFontSmoothing = 'antialiased';
                        content.style.mozOsxFontSmoothing = 'grayscale';
                        content.style.textRendering = 'optimizeLegibility';
                    }
                }
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: false,
                precision: 16,
                putOnlyUsedFonts: true
            }
        };

        // Generate PDF
        const pdf = await html2pdf().set(pdfOptions).from(clonedContent);
        
        if (action === 'preview') {
            const blob = await pdf.output('blob');
            showPDFPreview(blob);
        } else {
            await pdf.save();
            showNotification('High-quality PDF downloaded successfully!', 'success');
        }

        // Clean up
        document.body.removeChild(container);
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');
    } finally {
        hideLoadingOverlay();
    }
}

// Show PDF preview modal
function showPDFPreview(pdfBlob) {
    let modal = document.getElementById('pdfPreviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdfPreviewModal';
        modal.className = 'modal pdf-preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>PDF Preview</h2>
                    <div class="modal-actions">
                        <button class="download-pdf-btn" aria-label="Download PDF">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="close-modal-btn" aria-label="Close preview">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="pdf-preview-wrapper">
                        <iframe class="pdf-preview-frame" title="PDF Preview"></iframe>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="preview-zoom-controls">
                        <button class="zoom-out-btn">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <span class="zoom-level">100%</span>
                        <button class="zoom-in-btn">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners
        setupModalEventListeners(modal, pdfBlob);
    }

    // Update iframe source with PDF blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const iframe = modal.querySelector('.pdf-preview-frame');
    iframe.src = pdfUrl;

    // Show modal
    modal.classList.add('active');
}

// Setup modal event listeners
function setupModalEventListeners(modal, pdfBlob) {
    const closeBtn = modal.querySelector('.close-modal-btn');
    const downloadBtn = modal.querySelector('.download-pdf-btn');
    const overlay = modal.querySelector('.modal-overlay');
    const zoomInBtn = modal.querySelector('.zoom-in-btn');
    const zoomOutBtn = modal.querySelector('.zoom-out-btn');
    const zoomLevel = modal.querySelector('.zoom-level');
    const previewWrapper = modal.querySelector('.pdf-preview-wrapper');
    
    let currentZoom = 100;

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        URL.revokeObjectURL(modal.querySelector('iframe').src);
    });

    downloadBtn.addEventListener('click', () => {
        handlePDF('download');
    });

    overlay.addEventListener('click', () => {
        modal.classList.remove('active');
        URL.revokeObjectURL(modal.querySelector('iframe').src);
    });

    zoomInBtn.addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 25, 200);
        updateZoom();
    });

    zoomOutBtn.addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 25, 50);
        updateZoom();
    });

    function updateZoom() {
        zoomLevel.textContent = `${currentZoom}%`;
        previewWrapper.style.transform = `scale(${currentZoom / 100})`;
    }

    // Keyboard navigation
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            URL.revokeObjectURL(modal.querySelector('iframe').src);
        }
    });
}
