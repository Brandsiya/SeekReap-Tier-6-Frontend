// Pricing Page JavaScript
(function() {
  'use strict';

  let currentBilling = 'monthly'; // 'monthly' or 'yearly'
  
  // Initialize page
  function init() {
    initBillingToggle();
    initPlanButtons();
    initFAQ();
    initNavScroll();
    animateCardsOnScroll();
  }
  
  // Billing toggle functionality
  function initBillingToggle() {
    const toggleSwitch = document.getElementById('billingSwitch');
    const monthlyOption = document.querySelector('[data-billing="monthly"]');
    const yearlyOption = document.querySelector('[data-billing="yearly"]');
    const priceAmounts = document.querySelectorAll('.price-amount');
    
    if (!toggleSwitch) return;
    
    // Set initial state from localStorage if exists
    const savedBilling = localStorage.getItem('seekreap_billing');
    if (savedBilling === 'yearly') {
      currentBilling = 'yearly';
      toggleSwitch.classList.add('active');
      monthlyOption.classList.remove('active');
      yearlyOption.classList.add('active');
      updatePrices(priceAmounts, 'yearly');
    } else {
      currentBilling = 'monthly';
      monthlyOption.classList.add('active');
      yearlyOption.classList.remove('active');
      updatePrices(priceAmounts, 'monthly');
    }
    
    // Toggle click handler
    toggleSwitch.addEventListener('click', () => {
      currentBilling = currentBilling === 'monthly' ? 'yearly' : 'monthly';
      
      // Update UI
      toggleSwitch.classList.toggle('active');
      monthlyOption.classList.toggle('active');
      yearlyOption.classList.toggle('active');
      
      // Update prices
      updatePrices(priceAmounts, currentBilling);
      
      // Save preference
      localStorage.setItem('seekreap_billing', currentBilling);
    });
    
    // Option clicks
    monthlyOption.addEventListener('click', () => {
      if (currentBilling === 'monthly') return;
      currentBilling = 'monthly';
      toggleSwitch.classList.remove('active');
      monthlyOption.classList.add('active');
      yearlyOption.classList.remove('active');
      updatePrices(priceAmounts, 'monthly');
      localStorage.setItem('seekreap_billing', 'monthly');
    });
    
    yearlyOption.addEventListener('click', () => {
      if (currentBilling === 'yearly') return;
      currentBilling = 'yearly';
      toggleSwitch.classList.add('active');
      monthlyOption.classList.remove('active');
      yearlyOption.classList.add('active');
      updatePrices(priceAmounts, 'yearly');
      localStorage.setItem('seekreap_billing', 'yearly');
    });
  }
  
  // Update prices based on billing period
  function updatePrices(priceElements, billing) {
    priceElements.forEach(el => {
      const monthlyPrice = el.getAttribute('data-monthly');
      const yearlyPrice = el.getAttribute('data-yearly');
      
      if (billing === 'monthly' && monthlyPrice) {
        el.textContent = monthlyPrice;
        // Update period text
        const periodEl = el.nextElementSibling;
        if (periodEl && periodEl.classList.contains('period')) {
          periodEl.textContent = '/month';
        }
      } else if (billing === 'yearly' && yearlyPrice) {
        el.textContent = yearlyPrice;
        const periodEl = el.nextElementSibling;
        if (periodEl && periodEl.classList.contains('period')) {
          periodEl.textContent = '/month';
          // Add yearly note
          const yearlyNote = el.closest('.plan-price')?.querySelector('.yearly-note');
          if (!yearlyNote && yearlyPrice !== '0') {
            const note = document.createElement('span');
            note.className = 'yearly-note';
            note.style.cssText = 'display: block; font-size: 0.7rem; color: var(--gold); margin-top: 4px;';
            note.textContent = 'Billed annually';
            el.closest('.plan-price')?.appendChild(note);
          }
        }
      }
    });
  }
  
  // Plan button handlers
  function initPlanButtons() {
    const buttons = document.querySelectorAll('.plan-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const plan = btn.getAttribute('data-plan');
        const planName = getPlanName(plan);
        const price = getPlanPrice(plan, currentBilling);
        
        // Store selected plan info
        localStorage.setItem('selected_plan', JSON.stringify({
          plan: plan,
          name: planName,
          price: price,
          billing: currentBilling
        }));
        
        // Redirect to certification portal or checkout
        if (price === 0) {
          // Free plan - go directly to certification
          if (confirm(`You've selected the ${planName} plan. Continue to certification?`)) {
            window.location.href = ROUTES?.home || '/certification_portal.html';
          }
        } else {
          // Paid plan - go to checkout
          if (confirm(`You've selected the ${planName} plan at $${price}/${currentBilling === 'monthly' ? 'month' : 'month (billed annually)'}. Proceed to checkout?`)) {
            // Store for checkout page
            sessionStorage.setItem('checkout_plan', JSON.stringify({
              plan: plan,
              name: planName,
              price: price,
              billing: currentBilling,
              amount: currentBilling === 'yearly' ? price * 12 : price
            }));
            window.location.href = '/checkout.html';
          }
        }
      });
    });
  }
  
  // Helper: Get plan display name
  function getPlanName(plan) {
    const names = {
      'free': 'Free',
      'creator': 'Creator',
      'studio': 'Studio'
    };
    return names[plan] || plan;
  }
  
  // Helper: Get plan price
  function getPlanPrice(plan, billing) {
    const prices = {
      'free': { monthly: 0, yearly: 0 },
      'creator': { monthly: 9.99, yearly: 7.99 },
      'studio': { monthly: 29.99, yearly: 23.99 }
    };
    return prices[plan]?.[billing] || 0;
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
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }
  
  // Animate cards on scroll
  function animateCardsOnScroll() {
    const cards = document.querySelectorAll('.pricing-card');
    
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
  
  // Handle upgrade from URL params
  function handleUpgradeParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const upgrade = urlParams.get('upgrade');
    const plan = urlParams.get('plan');
    
    if (upgrade === 'true' && plan) {
      // Scroll to pricing section and highlight the plan
      const pricingGrid = document.querySelector('.pricing-grid');
      if (pricingGrid) {
        pricingGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const planCard = document.querySelector(`.pricing-card[data-plan="${plan}"]`);
        if (planCard) {
          planCard.style.animation = 'pulse 1s ease-in-out 3';
          setTimeout(() => {
            planCard.style.animation = '';
          }, 3000);
        }
      }
    }
  }
  
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
      trackPageView();
      handleUpgradeParam();
    });
  } else {
    init();
    trackPageView();
    handleUpgradeParam();
  }
})();
