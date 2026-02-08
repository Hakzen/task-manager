// Live Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tasksList = document.getElementById('tasksList');
    
    if (searchInput && tasksList) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            // Debounce search to avoid excessive requests
            searchTimeout = setTimeout(function() {
                if (query.length > 2 || query.length === 0) {
                    performLiveSearch(query);
                }
            }, 300);
        });
        
        // Also search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value.trim();
                performLiveSearch(query);
            }
        });
    }
    
    // Auto-hide messages after 5 seconds
    const messages = document.querySelectorAll('.message');
    messages.forEach(function(message) {
        setTimeout(function() {
            message.style.display = 'none';
        }, 5000);
    });
    
    // Add confirmation for delete links
    const deleteLinks = document.querySelectorAll('.btn-delete');
    deleteLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this task?')) {
                e.preventDefault();
            }
        });
    });
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && searchInput) {
            searchInput.value = '';
            performLiveSearch('');
        }
    });
    
    // Add loading states for forms
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
        });
    });
});

function performLiveSearch(query) {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;
    
    const taskCards = document.querySelectorAll('.task-card');
    let visibleCount = 0;
    
    taskCards.forEach(function(card) {
        const title = card.querySelector('.task-title');
        const description = card.querySelector('.task-description');
        
        const titleText = title ? title.textContent.toLowerCase() : '';
        const descriptionText = description ? description.textContent.toLowerCase() : '';
        const searchText = query.toLowerCase();
        
        if (titleText.includes(searchText) || descriptionText.includes(searchText)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide empty state based on search results
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        if (visibleCount === 0 && query) {
            // Update empty state message for search
            const emptyStateTitle = emptyState.querySelector('h3');
            const emptyStateText = emptyState.querySelector('p');
            if (emptyStateTitle) emptyStateTitle.textContent = 'No tasks found';
            if (emptyStateText) emptyStateText.textContent = `No tasks match your search for "${query}".`;
            emptyState.style.display = 'block';
            tasksList.style.display = 'none';
        } else if (visibleCount === 0 && !query) {
            // Show default empty state
            const emptyStateTitle = emptyState.querySelector('h3');
            const emptyStateText = emptyState.querySelector('p');
            if (emptyStateTitle) emptyStateTitle.textContent = 'No tasks found';
            if (emptyStateText) emptyStateText.textContent = 'Start by adding your first task!';
            emptyState.style.display = 'block';
            tasksList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            tasksList.style.display = 'grid';
        }
    }
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Utility function to get relative time
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Add task priority color coding
function updatePriorityColors() {
    const priorityElements = document.querySelectorAll('.priority');
    priorityElements.forEach(function(element) {
        const priority = element.textContent.trim().toLowerCase();
        element.classList.remove('priority-high', 'priority-medium', 'priority-low');
        
        if (priority.includes('high')) {
            element.classList.add('priority-high');
        } else if (priority.includes('medium')) {
            element.classList.add('priority-medium');
        } else if (priority.includes('low')) {
            element.classList.add('priority-low');
        }
    });
}

// Initialize priority colors when page loads
document.addEventListener('DOMContentLoaded', updatePriorityColors);

// Add smooth animations for task cards
function animateTaskCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1
    });
    
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// Initialize animations
document.addEventListener('DOMContentLoaded', animateTaskCards);

// Form validation enhancements
function enhanceFormValidation() {
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', enhanceFormValidation);

// Add task completion animation
function animateTaskCompletion(taskElement) {
    taskElement.style.transition = 'all 0.3s ease';
    taskElement.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        taskElement.style.transform = 'scale(1)';
    }, 300);
}

// Export functions for potential use in other scripts
window.TaskManager = {
    performLiveSearch,
    formatDate,
    getRelativeTime,
    updatePriorityColors,
    animateTaskCompletion
};

/**
 * Django Notes/Task Manager - JavaScript Module
 * 
 * This module provides client-side functionality for the task management system.
 * It includes form validation, UI interactions, accessibility features,
 * and enhanced user experience improvements.
 * 
 * Author: Senior Full-Stack Developer
 * Created: 2026
 */

// Main TaskManager namespace
const TaskManager = {
    
    /**
     * Initialize the application when DOM is ready
     */
    init() {
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupFormValidation();
        this.setupMessageAutoHide();
        this.setupKeyboardShortcuts();
        this.setupAnimations();
    },
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Delete confirmation buttons
        this.setupDeleteButtons();
        
        // Show more/less description buttons
        this.setupDescriptionToggle();
        
        // Form submissions
        this.setupFormHandlers();
        
        // Search functionality
        this.setupSearchHandlers();
        
        // Task completion toggle
        this.setupCompletionToggle();
    },
    
    /**
     * Setup delete button functionality
     */
    setupDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const deleteForm = document.getElementById('deleteForm');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const taskId = button.getAttribute('data-task-id');
                const taskTitle = button.getAttribute('data-task-title');
                
                if (this.confirmDelete(taskTitle)) {
                    this.submitDelete(taskId, deleteForm);
                }
            });
        });
    },
    
    /**
     * Show delete confirmation dialog
     */
    confirmDelete(taskTitle) {
        const message = `Are you sure you want to delete this task?\n\n"${taskTitle}"`;
        return confirm(message);
    },
    
    /**
     * Submit delete form
     */
    submitDelete(taskId, form) {
        form.action = `/delete/${taskId}/`;
        form.submit();
    },
    
    /**
     * Setup description toggle functionality
     */
    setupDescriptionToggle() {
        const showMoreButtons = document.querySelectorAll('.show-more');
        const showLessButtons = document.querySelectorAll('.show-less');
        
        showMoreButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const taskId = button.getAttribute('data-task-id');
                this.toggleDescription(taskId);
            });
        });
        
        showLessButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const taskId = button.getAttribute('data-task-id');
                this.toggleDescription(taskId);
            });
        });
    },
    
    /**
     * Toggle description visibility
     */
    toggleDescription(taskId) {
        const fullDesc = document.getElementById(`full-desc-${taskId}`);
        const showMoreBtn = document.querySelector(`[data-task-id="${taskId}"].show-more`);
        const showLessBtn = document.querySelector(`[data-task-id="${taskId}"].show-less`);
        
        if (fullDesc) {
            const isVisible = fullDesc.style.display !== 'none';
            
            if (isVisible) {
                fullDesc.style.display = 'none';
                if (showMoreBtn) showMoreBtn.style.display = 'inline-block';
                if (showLessBtn) showLessBtn.style.display = 'none';
            } else {
                fullDesc.style.display = 'block';
                if (showMoreBtn) showMoreBtn.style.display = 'none';
                if (showLessBtn) showLessBtn.style.display = 'inline-block';
            }
        }
    },
    
    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        // Add task form
        const addTaskForm = document.querySelector('.add-task-form');
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', (e) => this.handleAddTaskSubmit(e));
        }
        
        // Edit task form
        const editTaskForm = document.querySelector('.edit-form');
        if (editTaskForm) {
            editTaskForm.addEventListener('submit', (e) => this.handleEditTaskSubmit(e));
        }
        
        // Auto-focus title fields
        this.setupAutoFocus();
    },
    
    /**
     * Handle add task form submission
     */
    handleAddTaskSubmit(e) {
        const titleField = e.target.querySelector('#id_title');
        if (titleField && titleField.value.trim() === '') {
            e.preventDefault();
            this.showFieldError(titleField, 'Task title is required.');
            titleField.focus();
        }
    },
    
    /**
     * Handle edit task form submission
     */
    handleEditTaskSubmit(e) {
        const titleField = e.target.querySelector('#id_title');
        if (titleField && titleField.value.trim() === '') {
            e.preventDefault();
            this.showFieldError(titleField, 'Task title cannot be empty.');
            titleField.focus();
        }
    },
    
    /**
     * Setup auto-focus for form fields
     */
    setupAutoFocus() {
        const titleField = document.getElementById('id_title');
        if (titleField && !titleField.value) {
            titleField.focus();
        }
        
        // Select text in edit forms
        const editTitleField = document.querySelector('.edit-form #id_title');
        if (editTitleField) {
            editTitleField.select();
        }
    },
    
    /**
     * Setup search functionality
     */
    setupSearchHandlers() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        
        if (searchForm && searchInput) {
            // Live search with debouncing
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                searchTimeout = setTimeout(() => {
                    if (query.length >= 2 || query.length === 0) {
                        this.performLiveSearch(query);
                    }
                }, 300);
            });
            
            // Search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchForm.submit();
                }
            });
        }
    },
    
    /**
     * Perform live search
     */
    performLiveSearch(query) {
        const taskCards = document.querySelectorAll('.task-card');
        let visibleCount = 0;
        
        taskCards.forEach(card => {
            const title = card.querySelector('.task-title');
            const description = card.querySelector('.task-description');
            
            const titleText = title ? title.textContent.toLowerCase() : '';
            const descriptionText = description ? description.textContent.toLowerCase() : '';
            const searchText = query.toLowerCase();
            
            const matches = titleText.includes(searchText) || descriptionText.includes(searchText);
            
            if (matches) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        this.updateSearchResults(visibleCount, query);
    },
    
    /**
     * Update search results display
     */
    updateSearchResults(count, query) {
        const emptyState = document.querySelector('.empty-state');
        const tasksList = document.querySelector('.tasks-list');
        const searchResults = document.querySelector('.search-results');
        
        if (emptyState && tasksList) {
            if (count === 0) {
                emptyState.style.display = 'block';
                tasksList.style.display = 'none';
                
                // Update empty state message
                const emptyStateText = emptyState.querySelector('p');
                if (emptyStateText) {
                    emptyStateText.innerHTML = `No tasks match your search for "${query}". <a href="/" class="btn-link">Clear search</a>`;
                }
            } else {
                emptyState.style.display = 'none';
                tasksList.style.display = 'grid';
            }
        }
        
        // Update search results count
        if (searchResults && query) {
            searchResults.textContent = `(${count} results for "${query}")`;
        }
    },
    
    /**
     * Setup task completion toggle
     */
    setupCompletionToggle() {
        const toggleButtons = document.querySelectorAll('.btn-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const form = button.closest('form');
                if (form) {
                    form.submit();
                }
            });
        });
    },
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA live regions for dynamic content
        this.setupAriaLiveRegions();
        
        // Add keyboard navigation
        this.setupKeyboardNavigation();
        
        // Add focus management
        this.setupFocusManagement();
    },
    
    /**
     * Setup ARIA live regions
     */
    setupAriaLiveRegions() {
        // Create live region for status messages
        if (!document.getElementById('status-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'status-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
    },
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) searchInput.focus();
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                const searchInput = document.querySelector('.search-input');
                if (searchInput && searchInput.value) {
                    searchInput.value = '';
                    this.performLiveSearch('');
                }
            }
        });
    },
    
    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Add focus indicators
        const focusableElements = document.querySelectorAll('button, a, input, textarea, select');
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => element.classList.add('focused'));
            element.addEventListener('blur', () => element.classList.remove('focused'));
        });
    },
    
    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Add real-time validation
        const titleFields = document.querySelectorAll('#id_title');
        titleFields.forEach(field => {
            field.addEventListener('input', () => this.validateTitleField(field));
            field.addEventListener('blur', () => this.validateTitleField(field));
        });
        
        // Add character counters
        this.setupCharacterCounters();
    },
    
    /**
     * Validate title field
     */
    validateTitleField(field) {
        const value = field.value.trim();
        const maxLength = parseInt(field.getAttribute('maxlength')) || 200;
        
        if (value.length === 0) {
            this.showFieldError(field, 'Task title is required.');
            return false;
        } else if (value.length > maxLength) {
            this.showFieldError(field, `Task title cannot exceed ${maxLength} characters.`);
            return false;
        } else {
            this.clearFieldError(field);
            return true;
        }
    },
    
    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea[maxlength]');
        textareas.forEach(textarea => {
            const maxLength = parseInt(textarea.getAttribute('maxlength'));
            if (maxLength) {
                this.addCharacterCounter(textarea, maxLength);
            }
        });
    },
    
    /**
     * Add character counter to field
     */
    addCharacterCounter(field, maxLength) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.textContent = `0/${maxLength}`;
        counter.setAttribute('aria-live', 'polite');
        
        field.parentNode.appendChild(counter);
        
        field.addEventListener('input', () => {
            const length = field.value.length;
            counter.textContent = `${length}/${maxLength}`;
            
            if (length > maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        });
    },
    
    /**
     * Setup message auto-hide
     */
    setupMessageAutoHide() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 300);
            }, 5000);
        });
    },
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Ctrl/Cmd + N for new task
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const titleField = document.querySelector('#id_title');
                if (titleField) {
                    titleField.focus();
                    titleField.value = '';
                }
            }
        });
    },
    
    /**
     * Setup animations
     */
    setupAnimations() {
        // Add entrance animations
        this.animateTaskCards();
        this.animateMessages();
    },
    
    /**
     * Animate task cards
     */
    animateTaskCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, { threshold: 0.1 });
        
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    },
    
    /**
     * Animate messages
     */
    animateMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            message.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                message.style.opacity = '1';
                message.style.transform = 'translateY(0)';
            }, 100);
        });
    },
    
    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        
        field.parentNode.appendChild(errorElement);
        field.classList.add('error');
    },
    
    /**
     * Clear field error
     */
    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('error');
    },
    
    /**
     * Announce to screen readers
     */
    announce(message) {
        const liveRegion = document.getElementById('status-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TaskManager.init();
});

// Export for global access
window.TaskManager = TaskManager;
