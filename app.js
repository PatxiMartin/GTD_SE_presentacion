class StressManagementPresentation {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideEl = document.querySelector('.current-slide');
        this.progressFill = document.querySelector('.progress-fill');
        this.dots = document.querySelectorAll('.dot');
        
        this.init();
    }
    
    init() {
        this.updateSlide();
        this.bindEvents();
        this.updateNavigation();
        this.addSlideAnimations();
    }
    
    bindEvents() {
        // Navigation button events
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });
        
        // Dot navigation events - Fixed implementation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const slideNumber = parseInt(dot.dataset.slide) || (index + 1);
                this.goToSlide(slideNumber);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ': // Space bar
                case 'PageDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Touch/swipe events for mobile
        this.setupTouchEvents();
        
        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
    }
    
    setupTouchEvents() {
        let touchStartX = null;
        let touchStartY = null;
        let touchStartTime = null;
        const minSwipeDistance = 50;
        const maxSwipeTime = 500;
        
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY || !touchStartTime) return;
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            const diffTime = touchEndTime - touchStartTime;
            
            // Check if it's a valid swipe
            if (diffTime <= maxSwipeTime && Math.abs(diffX) > minSwipeDistance) {
                // Only process horizontal swipes (ignore vertical scrolling)
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) {
                        // Swipe left - next slide
                        this.nextSlide();
                    } else {
                        // Swipe right - previous slide
                        this.previousSlide();
                    }
                }
            }
            
            touchStartX = null;
            touchStartY = null;
            touchStartTime = null;
        }, { passive: true });
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updateSlide();
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updateSlide();
        }
    }
    
    goToSlide(slideNumber) {
        // Ensure slideNumber is valid and different from current
        const targetSlide = parseInt(slideNumber);
        if (targetSlide >= 1 && targetSlide <= this.totalSlides && targetSlide !== this.currentSlide) {
            this.currentSlide = targetSlide;
            this.updateSlide();
            return true;
        }
        return false;
    }
    
    updateSlide() {
        // Remove active class from all slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            if (index + 1 < this.currentSlide) {
                slide.classList.add('prev');
            }
        });
        
        // Add active class to current slide
        const currentSlideEl = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (currentSlideEl) {
            currentSlideEl.classList.add('active');
        }
        
        // Update all navigation elements
        this.updateNavigation();
        this.updateProgressBar();
        this.updateSlideIndicator();
        this.updateDots();
        
        // Add slide-specific animations
        setTimeout(() => {
            this.addSlideAnimations();
        }, 100);
        
        // Announce slide change for screen readers
        this.announceSlideChange();
    }
    
    updateNavigation() {
        // Update previous button state
        this.prevBtn.disabled = this.currentSlide === 1;
        this.prevBtn.setAttribute('aria-label', 
            this.currentSlide === 1 ? 'Primera diapositiva' : 'Diapositiva anterior'
        );
        
        // Update next button state
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        this.nextBtn.setAttribute('aria-label', 
            this.currentSlide === this.totalSlides ? 'Última diapositiva' : 'Siguiente diapositiva'
        );
    }
    
    updateProgressBar() {
        const progress = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressFill.setAttribute('aria-valuenow', this.currentSlide);
        this.progressFill.setAttribute('aria-valuetext', 
            `Diapositiva ${this.currentSlide} de ${this.totalSlides}`
        );
    }
    
    updateSlideIndicator() {
        if (this.currentSlideEl) {
            this.currentSlideEl.textContent = this.currentSlide;
        }
    }
    
    updateDots() {
        // Re-query dots to ensure we have the latest elements
        this.dots = document.querySelectorAll('.dot');
        
        this.dots.forEach((dot, index) => {
            const slideNumber = index + 1;
            const isActive = slideNumber === this.currentSlide;
            
            // Update visual state
            dot.classList.toggle('active', isActive);
            
            // Update accessibility attributes
            dot.setAttribute('aria-label', `Ir a diapositiva ${slideNumber}`);
            dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            dot.setAttribute('tabindex', isActive ? '0' : '-1');
            
            // Ensure data attribute is set correctly
            dot.setAttribute('data-slide', slideNumber.toString());
        });
    }
    
    addSlideAnimations() {
        const currentSlideEl = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (!currentSlideEl) return;
        
        // Remove any existing animation classes
        const animatedElements = currentSlideEl.querySelectorAll('[data-animated]');
        animatedElements.forEach(el => {
            el.removeAttribute('data-animated');
            el.style.animation = '';
        });
        
        // Add animations based on slide content
        this.animateSlideContent(currentSlideEl);
    }
    
    animateSlideContent(slideElement) {
        const slideType = this.getSlideType(this.currentSlide);
        
        switch (slideType) {
            case 'title':
                this.animateTitleSlide(slideElement);
                break;
            case 'question':
                this.animateQuestionSlide(slideElement);
                break;
            case 'characteristic':
                this.animateCharacteristicSlide(slideElement);
                break;
            case 'course-content':
                this.animateListSlide(slideElement);
                break;
            default:
                this.animateDefaultSlide(slideElement);
        }
    }
    
    getSlideType(slideNumber) {
        const slideTypes = {
            1: 'title',
            2: 'question',
            3: 'concept',
            4: 'introduction',
            5: 'characteristic',
            6: 'characteristic',
            7: 'characteristic',
            8: 'characteristic',
            9: 'transition',
            10: 'course-content',
            11: 'philosophy',
            12: 'body-mind',
            13: 'target',
            14: 'cta',
            15: 'closing'
        };
        return slideTypes[slideNumber] || 'default';
    }
    
    animateTitleSlide(slideElement) {
        const titleIcon = slideElement.querySelector('.title-icon');
        const mainTitle = slideElement.querySelector('.main-title');
        const subtitle = slideElement.querySelector('.subtitle');
        const zenElements = slideElement.querySelectorAll('.zen-icon');
        
        if (titleIcon) {
            setTimeout(() => {
                titleIcon.style.animation = 'fadeInScale 0.8s ease-out';
                titleIcon.setAttribute('data-animated', 'true');
            }, 100);
        }
        
        if (mainTitle) {
            setTimeout(() => {
                mainTitle.style.animation = 'fadeInUp 0.8s ease-out';
                mainTitle.setAttribute('data-animated', 'true');
            }, 300);
        }
        
        if (subtitle) {
            setTimeout(() => {
                subtitle.style.animation = 'fadeInUp 0.8s ease-out';
                subtitle.setAttribute('data-animated', 'true');
            }, 500);
        }
        
        zenElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.animation = 'bounceIn 0.6s ease-out';
                element.setAttribute('data-animated', 'true');
            }, 700 + (index * 150));
        });
    }
    
    animateQuestionSlide(slideElement) {
        const question = slideElement.querySelector('.big-question');
        const comparisonVisual = slideElement.querySelector('.comparison-visual');
        
        if (question) {
            setTimeout(() => {
                question.style.animation = 'fadeInUp 0.8s ease-out';
                question.setAttribute('data-animated', 'true');
            }, 100);
        }
        
        if (comparisonVisual) {
            setTimeout(() => {
                comparisonVisual.style.animation = 'fadeInUp 0.8s ease-out';
                comparisonVisual.setAttribute('data-animated', 'true');
            }, 400);
        }
    }
    
    animateCharacteristicSlide(slideElement) {
        const title = slideElement.querySelector('h1');
        const subtitle = slideElement.querySelector('h2');
        const examples = slideElement.querySelectorAll('.examples-list li');
        const sections = slideElement.querySelectorAll('.cause-section, .result-section, .problem-item, .consequence-item');
        
        if (title) {
            setTimeout(() => {
                title.style.animation = 'slideInFromLeft 0.8s ease-out';
                title.setAttribute('data-animated', 'true');
            }, 100);
        }
        
        if (subtitle) {
            setTimeout(() => {
                subtitle.style.animation = 'fadeInUp 0.8s ease-out';
                subtitle.setAttribute('data-animated', 'true');
            }, 300);
        }
        
        examples.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInFromRight 0.6s ease-out';
                item.setAttribute('data-animated', 'true');
            }, 500 + (index * 100));
        });
        
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.style.animation = 'fadeInScale 0.6s ease-out';
                section.setAttribute('data-animated', 'true');
            }, 400 + (index * 200));
        });
    }
    
    animateListSlide(slideElement) {
        const title = slideElement.querySelector('h1');
        const listItems = slideElement.querySelectorAll('.course-items li');
        
        if (title) {
            setTimeout(() => {
                title.style.animation = 'fadeInUp 0.8s ease-out';
                title.setAttribute('data-animated', 'true');
            }, 100);
        }
        
        listItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInFromLeft 0.6s ease-out';
                item.setAttribute('data-animated', 'true');
            }, 300 + (index * 150));
        });
    }
    
    animateDefaultSlide(slideElement) {
        const title = slideElement.querySelector('h1');
        const subtitle = slideElement.querySelector('h2');
        const icons = slideElement.querySelectorAll('[class*="icon"], [class*="emoji"]');
        
        if (title) {
            setTimeout(() => {
                title.style.animation = 'fadeInUp 0.8s ease-out';
                title.setAttribute('data-animated', 'true');
            }, 100);
        }
        
        if (subtitle) {
            setTimeout(() => {
                subtitle.style.animation = 'fadeInUp 0.8s ease-out';
                subtitle.setAttribute('data-animated', 'true');
            }, 300);
        }
        
        icons.forEach((icon, index) => {
            setTimeout(() => {
                icon.style.animation = 'bounceIn 0.6s ease-out';
                icon.setAttribute('data-animated', 'true');
            }, 500 + (index * 100));
        });
    }
    
    announceSlideChange() {
        const currentSlideEl = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (!currentSlideEl) return;
        
        const title = currentSlideEl.querySelector('h1');
        if (title) {
            const announcement = `Diapositiva ${this.currentSlide} de ${this.totalSlides}: ${title.textContent}`;
            this.announceToScreenReader(announcement);
        }
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!document.fullscreenElement;
        document.body.classList.toggle('fullscreen', isFullscreen);
    }
    
    handleResize() {
        // Recalculate layout if needed
        this.updateSlide();
    }
    
    // Auto-advance functionality (optional)
    startAutoAdvance(intervalMs = 30000) { // 30 seconds
        this.stopAutoAdvance();
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalMs);
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
    
    // Presentation controls
    restart() {
        this.goToSlide(1);
    }
    
    end() {
        this.goToSlide(this.totalSlides);
    }
}

// Additional animation styles
const presentationAnimations = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideInFromLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.95);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Fullscreen styles */
    .fullscreen .slide {
        width: 95vw;
        height: 90vh;
    }
    
    .fullscreen .navigation {
        background: rgba(0, 0, 0, 0.8);
        color: white;
    }
    
    .fullscreen .slide-dots {
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 10px;
    }
`;

// Add animation styles to document
const animationStyleSheet = document.createElement('style');
animationStyleSheet.textContent = presentationAnimations;
document.head.appendChild(animationStyleSheet);

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new StressManagementPresentation();
    
    // Make presentation globally accessible for debugging
    window.presentation = presentation;
    
    // Add loading completion class
    document.body.classList.add('loaded');
    
    // Show brief instructions
    const showInstructions = () => {
        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                z-index: 1001;
                animation: instructionsFade 5s ease-in-out;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            ">
                <div>🎯 Usa ← → teclas, clic en puntos, o desliza para navegar</div>
                <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">
                    Esc para pantalla completa
                </div>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        // Remove instructions after animation
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.parentNode.removeChild(instructions);
            }
        }, 5000);
    };
    
    // Add instructions animation
    const instructionsStyle = document.createElement('style');
    instructionsStyle.textContent = `
        @keyframes instructionsFade {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(instructionsStyle);
    
    // Show instructions after a brief delay
    setTimeout(showInstructions, 1000);
    
    // Add keyboard shortcut for presenter mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            console.log('Modo presentador activado');
            console.log('Comandos disponibles:');
            console.log('- presentation.restart() - Reiniciar presentación');
            console.log('- presentation.end() - Ir al final');
            console.log('- presentation.goToSlide(n) - Ir a diapositiva n');
            console.log('- presentation.startAutoAdvance(ms) - Auto-avance');
            console.log('- presentation.stopAutoAdvance() - Detener auto-avance');
        }
    });
    
    // Handle visibility changes (pause auto-advance when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            presentation.stopAutoAdvance();
        }
    });
    
    // Prevent accidental page refresh
    window.addEventListener('beforeunload', (e) => {
        if (presentation.currentSlide > 1 && presentation.currentSlide < presentation.totalSlides) {
            e.preventDefault();
            e.returnValue = '';
            return '¿Estás seguro de que quieres salir de la presentación?';
        }
    });
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StressManagementPresentation;
}