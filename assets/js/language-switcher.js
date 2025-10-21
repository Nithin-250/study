// Language Switcher Functionality for VidyaSetu Website
(function() {
  'use strict';
  
  // Available languages
  const languages = {
    en: { name: 'English', flag: '🇬🇧' },
    hi: { name: 'हिन्दी', flag: '🇮🇳' },
    ta: { name: 'தமிழ்', flag: '🇮🇳' },
    sw: { name: 'Kiswahili', flag: '🇰🇪' }
  };
  
  // Default language
  let currentLanguage = 'en';
  
  // Initialize language switcher
  function initLanguageSwitcher() {
    // Get saved language from localStorage or use default
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && languages[savedLanguage]) {
      currentLanguage = savedLanguage;
    }
    
    // Create language switcher UI
    createLanguageSwitcher();
    
    // Apply translations
    translatePage(currentLanguage);
  }
  
  // Create language switcher dropdown
  function createLanguageSwitcher() {
    // Create switcher container
    const switcherContainer = document.createElement('div');
    switcherContainer.id = 'language-switcher';
    switcherContainer.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 9999;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
      padding: 5px;
    `;
    
    // Create current language display
    const currentLangDisplay = document.createElement('button');
    currentLangDisplay.id = 'current-lang-btn';
    currentLangDisplay.style.cssText = `
      background: #4e65ff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      min-width: 140px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    currentLangDisplay.innerHTML = `
      <span>${languages[currentLanguage].flag} ${languages[currentLanguage].name}</span>
      <span style="margin-left: 10px;">▼</span>
    `;
    
    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.id = 'lang-dropdown';
    dropdownMenu.style.cssText = `
      display: none;
      position: absolute;
      bottom: 100%;
      right: 0;
      background: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 5px;
      overflow: hidden;
      min-width: 140px;
    `;
    
    // Add language options
    Object.keys(languages).forEach(langCode => {
      const option = document.createElement('button');
      option.className = 'lang-option';
      option.dataset.lang = langCode;
      option.style.cssText = `
        display: block;
        width: 100%;
        padding: 10px 20px;
        border: none;
        background: ${langCode === currentLanguage ? '#f0f0f0' : 'white'};
        cursor: pointer;
        text-align: left;
        font-size: 14px;
        transition: background 0.3s;
      `;
      option.innerHTML = `${languages[langCode].flag} ${languages[langCode].name}`;
      
      // Add hover effect
      option.onmouseover = function() {
        this.style.background = '#e8e8e8';
      };
      option.onmouseout = function() {
        this.style.background = langCode === currentLanguage ? '#f0f0f0' : 'white';
      };
      
      // Add click handler
      option.onclick = function() {
        changeLanguage(langCode);
        dropdownMenu.style.display = 'none';
      };
      
      dropdownMenu.appendChild(option);
    });
    
    // Toggle dropdown
    currentLangDisplay.onclick = function() {
      dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    };
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!switcherContainer.contains(event.target)) {
        dropdownMenu.style.display = 'none';
      }
    });
    
    // Assemble switcher
    switcherContainer.appendChild(currentLangDisplay);
    switcherContainer.appendChild(dropdownMenu);
    
    // Add to page
    document.body.appendChild(switcherContainer);
  }
  
  // Change language function
  function changeLanguage(langCode) {
    if (languages[langCode]) {
      currentLanguage = langCode;
      localStorage.setItem('preferredLanguage', langCode);
      translatePage(langCode);
      updateLanguageSwitcher(langCode);
    }
  }
  
  // Update language switcher display
  function updateLanguageSwitcher(langCode) {
    const currentLangBtn = document.getElementById('current-lang-btn');
    if (currentLangBtn) {
      currentLangBtn.innerHTML = `
        <span>${languages[langCode].flag} ${languages[langCode].name}</span>
        <span style="margin-left: 10px;">▼</span>
      `;
    }
    
    // Update option backgrounds
    document.querySelectorAll('.lang-option').forEach(option => {
      option.style.background = option.dataset.lang === langCode ? '#f0f0f0' : 'white';
    });
  }
  
  // Translate page function
  function translatePage(langCode) {
    if (!window.translations || !window.translations[langCode]) {
      console.error('Translations not found for language:', langCode);
      return;
    }
    
    const trans = window.translations[langCode];
    
    // Update page title
    document.title = trans.title || 'EduGuide';
    
    // Translate elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      if (trans[key]) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = trans[key];
        } else {
          element.textContent = trans[key];
        }
      }
    });
    
    // Manual translations for specific elements
    translateSpecificElements(trans);
  }
  
  // Translate specific elements that need special handling
  function translateSpecificElements(trans) {
    // Main heading
    const mainHeading = document.querySelector('.left-content h6');
    if (mainHeading) mainHeading.textContent = trans.mainHeading;
    
    const mainSubheading = document.querySelector('.left-content h2');
    if (mainSubheading) mainSubheading.textContent = trans.mainSubheading;
    
    const mainDesc = document.querySelector('.left-content p');
    if (mainDesc) mainDesc.textContent = trans.mainDescription;
    
    // Navigation menu
    const navLinks = document.querySelectorAll('.nav li a');
    const navTexts = ['home', 'about', 'services', 'projects', 'blog', 'contact', 'contactUs'];
    navLinks.forEach((link, index) => {
      if (navTexts[index] && trans[navTexts[index]]) {
        link.textContent = trans[navTexts[index]];
      }
    });
    
    // About section
    const aboutHeading = document.querySelector('#about h6');
    if (aboutHeading) aboutHeading.textContent = trans.aboutUs;
    
    const aboutTitle = document.querySelector('#about h4');
    if (aboutTitle) aboutTitle.innerHTML = `${trans.whoIs}<em> ${trans.vidyaSetu}</em>`;
    
    const aboutDesc = document.querySelector('.about-right-content p');
    if (aboutDesc) aboutDesc.textContent = trans.aboutDescription;
    
    // Services section
    const servicesHeading = document.querySelector('#services h6');
    if (servicesHeading) servicesHeading.textContent = trans.ourServices;
    
    const servicesTitle = document.querySelector('#services h4');
    if (servicesTitle) servicesTitle.innerHTML = `${trans.whatAims} <em>${trans.vidyaSetu}</em> ${trans.aimsToProvide}`;
    
    // Service tabs
    const serviceTabs = document.querySelectorAll('.menu .thumb');
    const serviceTabTexts = [trans.aptitude, trans.pdfSummarizer, trans.mentorship, trans.analysis, trans.ngos];
    serviceTabs.forEach((tab, index) => {
      if (serviceTabTexts[index]) {
        const textNode = Array.from(tab.childNodes).find(node => node.nodeType === 3);
        if (textNode) {
          textNode.textContent = serviceTabTexts[index];
        }
      }
    });
    
    // Free quote section
    const quoteHeading = document.querySelector('#free-quote h6');
    if (quoteHeading) quoteHeading.textContent = trans.getFreeGuidance;
    
    const quoteTitle = document.querySelector('#free-quote h4');
    if (quoteTitle) quoteTitle.textContent = trans.growWithUs;
    
    // Form placeholders
    const nameInput = document.querySelector('input[name="web"]');
    if (nameInput) nameInput.placeholder = trans.yourName;
    
    const emailInput = document.querySelector('input[name="address"]');
    if (emailInput) emailInput.placeholder = trans.emailAddress;
    
    const submitBtn = document.querySelector('#search button');
    if (submitBtn) submitBtn.textContent = trans.contactUsNow;
    
    // Courses section
    const coursesHeading = document.querySelector('#courses h6');
    if (coursesHeading) coursesHeading.textContent = trans.freeCourses;
    
    const coursesTitle = document.querySelector('#courses h4');
    if (coursesTitle) coursesTitle.innerHTML = `${trans.exploreOur} <em>${trans.learningCatalog}</em>`;
    
    // Blog section
    const blogHeading = document.querySelector('#blog h2');
    if (blogHeading) blogHeading.textContent = trans.latestUpdates;
    
    // Contact section
    const contactHeading = document.querySelector('#contact h6');
    if (contactHeading) contactHeading.textContent = trans.contactUs;
    
    const contactTitle = document.querySelector('#contact h4');
    if (contactTitle) contactTitle.innerHTML = `${trans.getInTouch} <em>${trans.now}</em>`;
    
    // Contact form
    const contactNameInput = document.querySelector('#contact input[name="name"]');
    if (contactNameInput) contactNameInput.placeholder = trans.name;
    
    const contactEmailInput = document.querySelector('#contact input[name="email"]');
    if (contactEmailInput) contactEmailInput.placeholder = trans.yourEmail;
    
    const contactSubjectInput = document.querySelector('#contact input[name="subject"]');
    if (contactSubjectInput) contactSubjectInput.placeholder = trans.subject;
    
    const contactMessageTextarea = document.querySelector('#contact textarea[name="message"]');
    if (contactMessageTextarea) contactMessageTextarea.placeholder = trans.message;
    
    const contactSubmitBtn = document.querySelector('#form-submit');
    if (contactSubmitBtn) contactSubmitBtn.textContent = trans.sendMessage;
    
    // Footer
    const footerText = document.querySelector('footer p');
    if (footerText) footerText.textContent = trans.copyright;
    
    // Service content translations
    translateServiceContent(trans);
    
    // Translate buttons
    const startButtons = document.querySelectorAll('.btn-primary');
    startButtons.forEach(btn => {
      if (btn.textContent.includes('Start')) {
        btn.textContent = trans.startNow;
      }
    });
  }
  
  // Translate service content
  function translateServiceContent(trans) {
    const serviceContents = document.querySelectorAll('.nacc li');
    
    if (serviceContents.length > 0) {
      // Aptitude service
      const aptitudeTitle = serviceContents[0].querySelector('h4');
      if (aptitudeTitle) aptitudeTitle.textContent = trans.aptitudeTitle;
      
      const aptitudeParagraphs = serviceContents[0].querySelectorAll('p');
      if (aptitudeParagraphs[0]) aptitudeParagraphs[0].textContent = trans.aptitudeDesc1;
      if (aptitudeParagraphs[1]) aptitudeParagraphs[1].textContent = trans.aptitudeDesc2;
    }
    
    if (serviceContents.length > 1) {
      // PDF Summarizer service
      const pdfTitle = serviceContents[1].querySelector('h4');
      if (pdfTitle) pdfTitle.textContent = trans.pdfTitle;
      
      const pdfParagraphs = serviceContents[1].querySelectorAll('p');
      if (pdfParagraphs[0]) pdfParagraphs[0].textContent = trans.pdfDesc1;
      if (pdfParagraphs[1]) pdfParagraphs[1].textContent = trans.pdfDesc2;
    }
    
    if (serviceContents.length > 2) {
      // Mentorship service
      const mentorshipTitle = serviceContents[2].querySelector('h4');
      if (mentorshipTitle) mentorshipTitle.textContent = trans.mentorshipTitle;
      
      const mentorshipParagraphs = serviceContents[2].querySelectorAll('p');
      if (mentorshipParagraphs[0]) mentorshipParagraphs[0].textContent = trans.mentorshipDesc1;
      if (mentorshipParagraphs[1]) mentorshipParagraphs[1].textContent = trans.mentorshipDesc2;
    }
    
    if (serviceContents.length > 3) {
      // Analysis service
      const analysisTitle = serviceContents[3].querySelector('h4');
      if (analysisTitle) analysisTitle.textContent = trans.analysisTitle;
      
      const analysisParagraphs = serviceContents[3].querySelectorAll('p');
      if (analysisParagraphs[0]) analysisParagraphs[0].textContent = trans.analysisDesc1;
      if (analysisParagraphs[1]) analysisParagraphs[1].textContent = trans.analysisDesc2;
    }
    
    if (serviceContents.length > 4) {
      // NGO service
      const ngoTitle = serviceContents[4].querySelector('h4');
      if (ngoTitle) ngoTitle.textContent = trans.ngoTitle;
      
      const ngoParagraphs = serviceContents[4].querySelectorAll('p');
      if (ngoParagraphs[0]) ngoParagraphs[0].textContent = trans.ngoDesc1;
      if (ngoParagraphs[1]) ngoParagraphs[1].textContent = trans.ngoDesc2;
    }
    
    // Translate skill items
    const skillItems = document.querySelectorAll('.skill-item span');
    const skillTexts = [trans.guidance, trans.learning, trans.progress];
    skillItems.forEach((item, index) => {
      const span = item.querySelector('span');
      if (span && skillTexts[index % 3]) {
        span.textContent = skillTexts[index % 3];
      }
    });
  }
  
  // Wait for DOM and translations to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initLanguageSwitcher, 100);
    });
  } else {
    setTimeout(initLanguageSwitcher, 100);
  }
})();
