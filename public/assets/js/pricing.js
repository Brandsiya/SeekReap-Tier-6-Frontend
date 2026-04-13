// Pricing Page JavaScript - Conversion Optimized
(function() {
  'use strict';

  let currentBilling = 'monthly'; // 'monthly' or 'yearly'

  // Initialize page
  function init() {
    initPlanSelection();
    initPlanButtons();
    initFAQ();
    initNavScroll();
    animateCardsOnScroll();
    handleUpgradeParam();
    updateAuthNav();
  }

  // Plan selection tracking (CRITICAL for conversion funnel)
  function initPlanSelection() {
    // Get plan from URL param
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPlan = urlParams.get('plan');
    
    if (selectedPlan) {
      // Store selected plan for post-signup routing
      localStorage.setItem('selectedPlan', selectedPlan);
      console.log(`🎯 Plan selected from URL: ${selectedPlan}`);
      
      // Highlight the corresponding card
      const planCard = document.querySelector(`.pricing-card[data-plan="${selectedPlan}"]`);
      if (planCard) {
        planCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        planCard.style.animation = 'pulse 1s ease-in-out 3';
        setTimeout(() => {
          planCard.style.animation = '';
        }, 3000);
      }
    }
    
    // Check if user is already authenticated
    if (window.currentUser) {
      updateNavForAuth();
    }
  }

  // Plan button handlers with proper routing
  function initPlanButtons() {
    const buttons = document.querySelectorAll('.plan-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const plan = btn.getAttribute('data-plan');
        
        // Store selected plan in localStorage for post-signup routing
        localStorage.setItem('selectedPlan', plan);
        
        // Track for analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'select_plan', {
            event_category: 'engagement',
            event_label: plan,
            value: getPlanPrice(plan, currentBilling)
          });
        }
        
        console.log(`📊 Plan selected: ${plan}`);
        
        // Check if user is already logged in
        if (window.currentUser) {
          // User is logged in, route to checkout or dashboard
          if (plan === 'free') {
            window.location.href = '/certification_portal.html';
          } else {
            window.location.href = `/checkout.html?plan=${plan}&billing=${currentBilling}`;
          }
        } else {
          // User not logged in, go to signup with plan param
          window.location.href = `/signup_signin.html?plan=${plan}`;
        }
      });
    });
  }

  // Helper: Get plan price
  function getPlanPrice(plan, billing) {
    const prices = {
      'free': { monthly: 0, yearly: 0 },
      'pro': { monthly: 149, yearly: 119 },
      'elite': { monthly: 499, yearly: 399 }
    };
    return prices[plan]?.[billing] || 0;
  }

  // Update navigation based on auth state
  function updateAuthNav() {
    const authNavBtn = document.getElementById('authNavBtn');
    if (window.currentUser && authNavBtn) {
      authNavBtn.textContent = 'Dashboard';
      authNavBtn.href = '/certification_portal.html';
    }
  }

  // Handle hero buttons
  function handleHeroButtons() {
    const heroStartFree = document.getElementById('heroStartFree');
    if (heroStartFree) {
      heroStartFree.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('selectedPlan', 'free');
        if (window.currentUser) {
          window.location.href = '/certification_portal.html';
        } else {
          window.location.href = '/signup_signin.html?plan=free';
        }
      });
    }
  }

  // FAQ accordion functionality
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      
      question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle current item
        item.classList.toggle('active');
      });
    });
    
    // Open first FAQ by default
    if (faqItems.length > 0) {
      faqItems[0].classList.add('active');
    }
  }
  
  // Smooth scroll for navigation
  function initNavScroll() {
    const viewPlansBtn = document.querySelector('.hero-btn-secondary');
    if (viewPlansBtn) {
      viewPlansBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const pricingGrid = document.getElementById('pricing-grid');
        if (pricingGrid) {
          pricingGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }
  
  // Animate cards on scroll
  function animateCardsOnScroll() {
    const cards = document.querySelectorAll('.pricing-card, .value-card');
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
      observer.observe(card);
    });
  }
  
  // Handle upgrade from URL params
  function handleUpgradeParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const upgrade = urlParams.get('upgrade');
    const plan = urlParams.get('plan');
    
    if (upgrade === 'true' && plan) {
      const planCard = document.querySelector(`.pricing-card[data-plan="${plan}"]`);
      if (planCard) {
        planCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        planCard.style.animation = 'pulse 1s ease-in-out 3';
        setTimeout(() => {
          planCard.style.animation = '';
        }, 3000);
      }
    }
  }
  
  // Track page view for analytics
  function trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Pricing',
        page_location: window.location.href,
        page_path: '/pricing.html'
      });
    }
    console.log('📊 Pricing page viewed');
  }
  
  // Listen for auth ready event
  document.addEventListener('authReady', (event) => {
    window.currentUser = event.detail.user;
    updateAuthNav();
  });
  
  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(201, 153, 58, 0.7);
      }
      50% {
        box-shadow: 0 0 0 20px rgba(201, 153, 58, 0);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      handleHeroButtons();
      trackPageView();
    });
  } else {
    init();
    handleHeroButtons();
    trackPageView();
  }
})();
