/**
 * Chatbot Interface - Portfolio Q&A System with Card Responses
 * Matches aaabadcode.com design with profile, projects, skills cards
 */

class PortfolioChatbot {
  constructor() {
    this.messages = [];
    this.isLoading = false;
    this.currentProjectPage = 0;
    this.projectsPerPage = 3;
    this.initializeProjectsData();
    this.initializeQADatabase();
    this.setupEventListeners();
    this.showGreeting();
    this.initChatParticles();
  }

  initChatParticles() {
    const canvas = document.getElementById('chat-particles');
    const container = document.querySelector('.chatbot-container');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let particles = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / 4500);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.25 + 0.05),
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.002 + 0.001
      }));
    };

    const tick = (time) => {
      requestAnimationFrame(tick);
      if (!container.classList.contains('active')) return;
      if (canvas.clientWidth !== width || canvas.clientHeight !== height) resize();
      if (!width) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';

      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -2) { p.y = height + 2; p.x = Math.random() * width; }
          if (p.x < -2) p.x = width + 2;
          if (p.x > width + 2) p.x = -2;
        }
        ctx.globalAlpha = 0.45 + 0.4 * Math.sin(time * p.speed + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    requestAnimationFrame(tick);
  }

  initializeProjectsData() {
    this.allProjects = [
      {
        title: "AcaRAG-Pro",
        description: "Engineered a production-grade Retrieval-Augmented Generation (RAG) chatbot using FastAPI, GROQ LLM, and ChromaDB to answer questions from institutional PDFs. Implemented multi-level Cache-Augmented Generation (CAG), reducing repeated query latency from 3–4 seconds to 0.5 seconds.",
        tags: ["FastAPI", "GROQ", "ChromaDB", "RAG", "Python"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/Acaragpro.jpeg"
      },
      {
        title: "Transac-NOVA",
        description: "Designed a high-throughput AI transaction intelligence platform using FastAPI microservices for large-scale financial transaction ingestion and analytics. Integrated anomaly detection models with RAG to detect fraudulent activities and generate intelligent insights in real time.",
        tags: ["FastAPI", "Python", "Machine Learning", "Docker", "Microservices"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/transacNova.jpeg"
      },
      {
        title: "Food Delivery Platform",
        description: "Developed a scalable MERN-based food ordering platform featuring secure Stripe payment integration, RESTful APIs for authentication and order management, and optimized backend services for high-performance database operations.",
        tags: ["MongoDB", "Express", "React", "Node.js", "Stripe"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/Foodie.jpeg"
      },
      {
        title: "Prescripto",
        description: "Built a full-stack healthcare platform with Patient, Doctor, and Admin dashboards using the MERN stack. Implemented JWT authentication, secure appointment scheduling, and integrated Stripe and Razorpay payment gateways.",
        tags: ["MongoDB", "Express", "React", "Node.js", "Razorpay"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/Prescripto.jpeg"
      },
      {
        title: "AI Code Reviewer",
        description: "Built an AI-powered code review platform that analyzes Git repositories and ZIP projects for bugs, code quality, and security issues. Integrated GPT with LangChain to provide contextual recommendations and best-practice improvements using FastAPI backend and React frontend.",
        tags: ["React", "FastAPI", "LangChain", "OpenAI", "Python"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/aiCodeReviewer.jpeg"
      },
      {
        title: "AI Meeting Summarizer",
        description: "Developed an AI meeting assistant that converts meeting recordings into transcripts using OpenAI Whisper and generates concise summaries with GPT. Automatically extracts key discussion points, action items, and decisions through FastAPI backend and Streamlit interface.",
        tags: ["FastAPI", "Whisper", "OpenAI", "Streamlit", "Python"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/aiMeetingSummarizer.jpeg"
      }
    ];
    this.currentProjectPage = 0;
    this.projectsPerPage = 3; // Show 3 projects at a time like aaabadcode.com

    // Products data
    this.allProducts = [
      {
        title: "Aqua Guard",
        description: "Built an IoT-based real-time water quality monitoring system using ESP32 sensors and Firebase cloud services. Implemented machine learning models to predict water quality trends from historical sensor data for aquaculture applications.",
        tags: ["ESP32", "Firebase", "Python", "Machine Learning", "IoT"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/Aquagaurd.jpeg"
      },
      {
        title: "MyoSync",
        description: "Developed a real-time prosthetic arm control system using EMG signal acquisition and machine learning-based gesture recognition. Implemented Raspberry Pi-powered control pipelines for assistive healthcare applications. Patent-worthy innovation!",
        tags: ["Python", "Raspberry Pi", "Machine Learning", "IoT", "Hardware"],
        image: "https://sahithik04.github.io/sahithisProfile/assets/img/projects/Myosync.jpeg"
      }
    ];
    this.currentProductPage = 0;
    this.productsPerPage = 3; // Show 3 products at a time
  }

  initializeQADatabase() {
    this.qaDatabase = {
      "me": { type: "profile", category: "about" },
      "who are you": { type: "profile", category: "about" },
      "tell me about yourself": { type: "profile", category: "about" },
      "about you": { type: "profile", category: "about" },
      "tell me about me": { type: "profile", category: "about" },

      "projects": { type: "projects", category: "projects" },
      "what projects have you built": { type: "projects", category: "projects" },
      "show me projects": { type: "projects", category: "projects" },

      "products": { type: "products", category: "products" },
      "what products have you built": { type: "products", category: "products" },
      "show me products": { type: "products", category: "products" },

      "skills": { type: "skills", category: "skills" },
      "what are your skills": { type: "skills", category: "skills" },
      "your skillset": { type: "skills", category: "skills" },

      "fun": { type: "fun", category: "fun" },
      "something fun": { type: "fun", category: "fun" },
      "tell me something fun": { type: "fun", category: "fun" },

      "contact": { type: "contact", category: "contact" },
      "how to contact you": { type: "contact", category: "contact" },
      "your contact info": { type: "contact", category: "contact" },

      "hello": { type: "text", response: "Hello! 👋 Welcome to my portfolio! How can I help you today?" },
      "hi": { type: "text", response: "Hey there! 👋 What would you like to know?" },
    };
  }

  setupEventListeners() {
    const inputBox = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const questionBtns = document.querySelectorAll('.question-btn');
    const letsTalkBtn = document.getElementById('btn-talk');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const profileCloseBtn = document.getElementById('profile-close-btn');
    const projectsCloseBtn = document.getElementById('projects-close-btn');
    const projectsPrevBtn = document.getElementById('projects-prev');
    const projectsNextBtn = document.getElementById('projects-next');
    const productsCloseBtn = document.getElementById('products-close-btn');
    const productsPrevBtn = document.getElementById('products-prev');
    const productsNextBtn = document.getElementById('products-next');

    if (letsTalkBtn) {
      letsTalkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openChatbotModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeChatbotModal();
      });
    }

    if (profileCloseBtn) {
      profileCloseBtn.addEventListener('click', () => {
        this.closeProfileModal();
      });
    }

    if (projectsCloseBtn) {
      projectsCloseBtn.addEventListener('click', () => {
        this.closeProjectsModal();
      });
    }

    if (projectsPrevBtn) {
      projectsPrevBtn.addEventListener('click', () => {
        this.showPreviousProject();
      });
    }

    if (projectsNextBtn) {
      projectsNextBtn.addEventListener('click', () => {
        this.showNextProject();
      });
    }

    if (productsCloseBtn) {
      productsCloseBtn.addEventListener('click', () => {
        this.closeProductsModal();
      });
    }

    if (productsPrevBtn) {
      productsPrevBtn.addEventListener('click', () => {
        this.showPreviousProduct();
      });
    }

    if (productsNextBtn) {
      productsNextBtn.addEventListener('click', () => {
        this.showNextProduct();
      });
    }

    const skillsCloseBtn = document.getElementById('skills-close-btn');
    const funCloseBtn = document.getElementById('fun-close-btn');
    const contactCloseBtn = document.getElementById('contact-close-btn');

    if (skillsCloseBtn) {
      skillsCloseBtn.addEventListener('click', () => {
        this.closeSkillsModal();
      });
    }

    if (funCloseBtn) {
      funCloseBtn.addEventListener('click', () => {
        this.closeFunModal();
      });
    }

    if (contactCloseBtn) {
      contactCloseBtn.addEventListener('click', () => {
        this.closeContactModal();
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (inputBox) {
      inputBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    questionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // First try to use data-question attribute
        let question = btn.dataset.question;
        // If not available, extract from text content
        if (!question) {
          question = btn.textContent
            .replace(/[^\w\s]/gi, '') // Remove emojis and special chars
            .trim()
            .toLowerCase();
        }
        this.handleQuickQuestion(question);
      });
    });
  }

  openChatbotModal() {
    const container = document.querySelector('.chatbot-container');
    if (container) {
      container.classList.add('active');
      // Focus on input for better UX
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) input.focus();
      }, 100);
    }
  }

  closeChatbotModal() {
    const container = document.querySelector('.chatbot-container');
    if (container) {
      container.classList.remove('active');
    }
  }

  showGreeting() {
    // Initial greeting message
    this.addMessage('ai', "Hi! 👋 I'm Sai Sahithi. Ask me anything about my work, projects, or skills!");
  }

  handleSendMessage() {
    const inputBox = document.getElementById('chat-input');
    const message = inputBox.value.trim();

    if (!message) return;

    // Clear previous messages
    this.clearMessages();

    this.addMessage('user', message);
    inputBox.value = '';

    this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      this.generateResponse(message);
    }, 800);
  }

  handleQuickQuestion(question) {
    // Clear previous messages
    this.clearMessages();

    this.addMessage('user', `Tell me about ${question}`);
    this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      this.generateResponse(question);
    }, 800);
  }

  generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const match = Object.entries(this.qaDatabase).find(([key]) => lowerMessage.includes(key));

    if (!match) {
      const fallbacks = [
        "That's a great question! Feel free to reach out at sahitikontam@gmail.com 📧",
        "Interesting! For detailed discussions, let's connect on LinkedIn! 💼",
      ];
      this.addMessage('ai', fallbacks[Math.floor(Math.random() * fallbacks.length)]);
      return;
    }

    const value = match[1];
    if (value.type === 'text') {
      this.addMessage('ai', value.response);
      return;
    }
    this.openSection(value.type);
  }

  openSection(type) {
    const openers = {
      profile: () => this.openProfileModal(),
      projects: () => { this.currentProjectPage = 0; this.openProjectsModal(); },
      products: () => { this.currentProductPage = 0; this.openProductsModal(); },
      skills: () => this.openSkillsModal(),
      fun: () => this.openFunModal(),
      contact: () => this.openContactModal()
    };
    if (!openers[type]) return null;

    this.closeAllModals();
    this.closeChatbotModal();
    openers[type]();
    return document.querySelector(`.${type}-modal-container`);
  }

  closeAllModals() {
    document.querySelectorAll('.profile-modal-container, .projects-modal-container, .products-modal-container, .skills-modal-container, .fun-modal-container, .contact-modal-container')
      .forEach(modal => modal.classList.remove('active', 'gesture-reveal'));
  }

  openProfileModal() {
    const profileModal = document.querySelector('.profile-modal-container');
    if (profileModal) {
      profileModal.classList.add('active');
    }
  }

  closeProfileModal() {
    const profileModal = document.querySelector('.profile-modal-container');
    if (profileModal) {
      profileModal.classList.remove('active');
    }
  }

  openProjectsModal() {
    const projectsModal = document.querySelector('.projects-modal-container');
    if (projectsModal) {
      projectsModal.classList.add('active');
      this.displayCurrentProject();
    }
  }

  closeProjectsModal() {
    const projectsModal = document.querySelector('.projects-modal-container');
    if (projectsModal) {
      projectsModal.classList.remove('active');
    }
  }

  displayCurrentProject() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = '';
    const startIndex = this.currentProjectPage * this.projectsPerPage;
    const endIndex = Math.min(startIndex + this.projectsPerPage, this.allProjects.length);
    const projectsToShow = this.allProjects.slice(startIndex, endIndex);
    
    // Create a grid container for 3 projects
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      width: 100%;
    `;
    
    projectsToShow.forEach((project, index) => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`;
      
      projectCard.innerHTML = `
        <div class="project-image" style="width: 100%; height: 180px; border-radius: 16px 16px 0 0; overflow: hidden;">
          <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>
        <div class="project-info" style="padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px;">
          <h3 class="project-title" style="font-size: 1.1rem; font-weight: 700; color: rgba(255, 255, 255, 0.95); margin: 0;">${project.title}</h3>
          <p class="project-description" style="font-size: 0.85rem; line-height: 1.5; color: rgba(255, 255, 255, 0.75); margin: 0; flex: 1;">${project.description}</p>
          <div class="project-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${project.tags.slice(0, 3).map(tag => `<span class="project-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
      
      gridContainer.appendChild(projectCard);
    });
    
    container.appendChild(gridContainer);

    // Update pagination
    const totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
    document.getElementById('current-page').textContent = this.currentProjectPage + 1;
    document.getElementById('total-pages').textContent = totalPages;
    this.updateArrowStates('projects', this.currentProjectPage, totalPages);
  }

  updateArrowStates(prefix, page, totalPages) {
    const prevBtn = document.getElementById(`${prefix}-prev`);
    const nextBtn = document.getElementById(`${prefix}-next`);
    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= totalPages - 1;
  }

  showNextProject() {
    const totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
    if (this.currentProjectPage >= totalPages - 1) return;
    this.currentProjectPage++;
    this.displayCurrentProject();
  }

  showPreviousProject() {
    if (this.currentProjectPage <= 0) return;
    this.currentProjectPage--;
    this.displayCurrentProject();
  }

  openProductsModal() {
    const productsModal = document.querySelector('.products-modal-container');
    if (productsModal) {
      productsModal.classList.add('active');
      this.displayCurrentProduct();
    }
  }

  closeProductsModal() {
    const productsModal = document.querySelector('.products-modal-container');
    if (productsModal) {
      productsModal.classList.remove('active');
    }
  }

  displayCurrentProduct() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    const startIndex = this.currentProductPage * this.productsPerPage;
    const endIndex = Math.min(startIndex + this.productsPerPage, this.allProducts.length);
    const productsToShow = this.allProducts.slice(startIndex, endIndex);
    
    // Create a grid container for 3 products
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      width: 100%;
    `;
    
    productsToShow.forEach((product, index) => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`;
      
      productCard.innerHTML = `
        <div class="product-image" style="width: 100%; height: 180px; border-radius: 16px 16px 0 0; overflow: hidden;">
          <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>
        <div class="product-info" style="padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px;">
          <h3 class="product-title" style="font-size: 1.1rem; font-weight: 700; color: rgba(255, 255, 255, 0.95); margin: 0;">${product.title}</h3>
          <p class="product-description" style="font-size: 0.85rem; line-height: 1.5; color: rgba(255, 255, 255, 0.75); margin: 0; flex: 1;">${product.description}</p>
          <div class="product-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${product.tags.slice(0, 3).map(tag => `<span class="product-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
      
      gridContainer.appendChild(productCard);
    });
    
    container.appendChild(gridContainer);

    // Update pagination
    const totalPages = Math.ceil(this.allProducts.length / this.productsPerPage);
    document.getElementById('products-current-page').textContent = this.currentProductPage + 1;
    document.getElementById('products-total-pages').textContent = totalPages;
    this.updateArrowStates('products', this.currentProductPage, totalPages);
  }

  showNextProduct() {
    const totalPages = Math.ceil(this.allProducts.length / this.productsPerPage);
    if (this.currentProductPage >= totalPages - 1) return;
    this.currentProductPage++;
    this.displayCurrentProduct();
  }

  showPreviousProduct() {
    if (this.currentProductPage <= 0) return;
    this.currentProductPage--;
    this.displayCurrentProduct();
  }

  openSkillsModal() {
    const skillsModal = document.querySelector('.skills-modal-container');
    if (skillsModal) {
      skillsModal.classList.add('active');
      this.displaySkills();
    }
  }

  closeSkillsModal() {
    const skillsModal = document.querySelector('.skills-modal-container');
    if (skillsModal) {
      skillsModal.classList.remove('active');
    }
  }

  displaySkills() {
    const container = document.getElementById('skills-container');
    if (!container) return;

    container.innerHTML = '';

    const icons = {
      code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
      sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>',
      database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
      cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>',
      monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
    };

    const skillsData = [
      { title: 'Programming Languages', icon: 'code', skills: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C'] },
      { title: 'Backend & Systems', icon: 'cpu', skills: ['Spring Boot', 'FastAPI', 'Node.js', 'Express', 'REST APIs', 'Microservices'] },
      { title: 'AI & Machine Learning', icon: 'sparkles', skills: ['LLMs', 'RAG', 'LangChain', 'OpenAI', 'Whisper', 'Prompt Engineering', 'Machine Learning', 'TensorFlow'] },
      { title: 'Databases & Messaging', icon: 'database', skills: ['MySQL', 'SQL', 'MongoDB', 'Firebase', 'ChromaDB', 'Apache Kafka'] },
      { title: 'Cloud, DevOps & Testing', icon: 'cloud', skills: ['Docker', 'Git', 'GitHub', 'GitHub Actions', 'CI/CD', 'Jest', 'Pytest'] },
      { title: 'Frontend Development', icon: 'monitor', skills: ['React', 'HTML', 'CSS', 'Tailwind CSS', 'Streamlit'] },
      { title: 'Soft Skills', icon: 'users', skills: ['Communication', 'Problem-Solving', 'Adaptability', 'Learning Agility', 'Teamwork', 'Creativity'] }
    ];

    skillsData.forEach((group, groupIdx) => {
      const section = document.createElement('div');
      section.className = 'skill-group';
      section.style.animationDelay = `${groupIdx * 0.08}s`;

      section.innerHTML = `
        <h3 class="skill-group-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[group.icon]}</svg>
          ${group.title}
        </h3>
        <div class="skill-pills">
          ${group.skills.map((skill, i) => `<span class="skill-pill" style="animation-delay: ${groupIdx * 0.08 + i * 0.03}s">${skill}</span>`).join('')}
        </div>
      `;

      container.appendChild(section);
    });
  }

  openFunModal() {
    const funModal = document.querySelector('.fun-modal-container');
    if (funModal) {
      funModal.classList.add('active');
      this.displayFun();
    }
  }

  closeFunModal() {
    const funModal = document.querySelector('.fun-modal-container');
    if (funModal) {
      funModal.classList.remove('active');
    }
  }

  displayFun() {
    const container = document.getElementById('fun-container');
    if (!container) return;

    container.innerHTML = '';

    const funContent = document.createElement('div');
    funContent.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 24px;
      animation: fadeInUp 0.6s ease-out;
    `;

    const imagePlaceholder = document.createElement('div');
    imagePlaceholder.className = 'fun-image';
    imagePlaceholder.style.cssText = `
      width: 100%;
      height: 300px;
      border: 2px dashed rgba(255, 140, 90, 0.35);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 4rem;
      background: rgba(255, 90, 60, 0.05);
    `;
    imagePlaceholder.textContent = '🏔️';

    const factsContainer = document.createElement('div');
    factsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    const funFacts = [
      '🎸 I love playing guitar in my free time',
      '✈️ Travel enthusiast - always exploring new places',
      '📚 Avid reader of sci-fi and tech blogs',
      '🧗 Rock climbing is my favorite outdoor activity',
      '🎮 Gaming geek - RPGs are my go-to',
      '🌍 Fluent in French alongside English and Telugu'
    ];

    funFacts.forEach((fact, idx) => {
      const factItem = document.createElement('div');
      factItem.className = 'fun-fact';
      factItem.style.cssText = `
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 120, 90, 0.2);
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.85);
        font-size: 0.95rem;
        line-height: 1.6;
        animation: fadeInUp 0.5s ease-out ${idx * 0.08}s backwards;
        transition: all 0.3s ease;
      `;
      factItem.textContent = fact;

      factItem.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 90, 60, 0.1)';
        this.style.borderColor = 'rgba(255, 130, 90, 0.45)';
        this.style.transform = 'translateY(-4px)';
      });

      factItem.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255, 255, 255, 0.04)';
        this.style.borderColor = 'rgba(255, 120, 90, 0.2)';
        this.style.transform = 'translateY(0)';
      });

      factsContainer.appendChild(factItem);
    });

    funContent.appendChild(imagePlaceholder);
    funContent.appendChild(factsContainer);
    container.appendChild(funContent);
  }

  openContactModal() {
    const contactModal = document.querySelector('.contact-modal-container');
    if (contactModal) {
      contactModal.classList.add('active');
      this.displayContact();
    }
  }

  closeContactModal() {
    const contactModal = document.querySelector('.contact-modal-container');
    if (contactModal) {
      contactModal.classList.remove('active');
    }
  }

  displayContact() {
    const container = document.getElementById('contact-container');
    if (!container) return;

    const email = 'sahitikontam@gmail.com';
    const links = [
      {
        label: 'LinkedIn',
        value: 'in/sahithi-kontam',
        href: 'https://linkedin.com/in/sahithi-kontam',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
      },
      {
        label: 'Email',
        value: email,
        href: `mailto:${email}`,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
      },
      {
        label: 'GitHub',
        value: 'sahithiK04',
        href: 'https://github.com/sahithiK04',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'
      }
    ];

    container.innerHTML = `
      <div class="contact-layout">
        <div class="contact-links">
          <p class="contact-intro">Open to new roles, collaborations, or a good conversation about AI and backend systems. Pick a channel or drop a message.</p>
          ${links.map((link, i) => `
            <a class="contact-link" href="${link.href}" ${link.href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} style="animation-delay: ${i * 0.1}s">
              <span class="contact-link-icon">${link.icon}</span>
              <span class="contact-link-text">
                <span class="contact-link-label">${link.label}</span>
                <span class="contact-link-value">${link.value}</span>
              </span>
              <span class="contact-link-arrow" aria-hidden="true">↗</span>
            </a>
          `).join('')}
        </div>

        <form class="contact-form">
          <h3 class="contact-form-title">Send a message</h3>
          <div class="contact-form-row">
            <label class="contact-field">
              <span>Name</span>
              <input type="text" name="name" required maxlength="100" placeholder="Your name" autocomplete="name">
            </label>
            <label class="contact-field">
              <span>Email</span>
              <input type="email" name="email" required maxlength="150" placeholder="you@example.com" autocomplete="email">
            </label>
          </div>
          <label class="contact-field">
            <span>Message</span>
            <textarea name="message" rows="6" required maxlength="2000" placeholder="Tell me about your project, role, or idea..."></textarea>
          </label>
          <button type="submit" class="contact-submit">
            Send message
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
          <p class="contact-form-status" aria-live="polite"></p>
        </form>
      </div>
    `;

    const form = container.querySelector('.contact-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name').trim();
      const from = data.get('email').trim();
      const message = data.get('message').trim();

      // No backend: hand the message to the visitor's mail client.
      const subject = `Portfolio message from ${name}`;
      const body = `${message}\n\n— ${name} (${from})`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      form.querySelector('.contact-form-status').textContent = 'Opening your email app...';
      form.reset();
    });
  }

  addMessage(sender, htmlContent) {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = htmlContent;

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Setup button event listeners
    const nextBtn = contentDiv.querySelector('.next-projects-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.showNextProjects());
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typing-indicator';

    const indicatorContent = document.createElement('div');
    indicatorContent.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      indicatorContent.appendChild(dot);
    }

    typingDiv.appendChild(indicatorContent);
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  clearMessages() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (messagesContainer) {
      // Clear all messages except the greeting on first load
      messagesContainer.innerHTML = '';
    }
  }

  generateProfileCard() {
    return `
      <div class="card-response profile-card">
        <div class="card-avatar">👩‍💻</div>
        <div class="card-header">
          <h3>Sai Sahithi</h3>
          <p>AI Engineer & Full Stack Developer</p>
        </div>
        <div class="card-bio">
          <p>Software Engineer building backend systems and AI-driven solutions. Currently at Dhan AI, working on production ML models and backend microservices.</p>
          <p style="margin-top: 8px;">Fascinated by LLMs, data pipelines, and building systems that scale! 🚀</p>
        </div>
        <div class="card-tags">
          <span>AI</span>
          <span>Backend</span>
          <span>ML</span>
          <span>Full-Stack</span>
          <span>Python</span>
          <span>JavaScript</span>
        </div>
      </div>
    `;
  }

  generateProjectsCard() {
    const start = this.currentProjectPage * this.projectsPerPage;
    const end = start + this.projectsPerPage;
    const projectsToShow = this.allProjects.slice(start, end);
    const hasNext = end < this.allProjects.length;
    const pageNum = this.currentProjectPage + 1;
    const totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);

    let html = `<div class="card-response projects-card">
      <div class="projects-header">
        <h3>🎯 My Projects</h3>
        <p class="page-indicator">Page ${pageNum} of ${totalPages}</p>
      </div>
      <div class="projects-list">`;

    projectsToShow.forEach((project, index) => {
      html += `
        <div class="project-item" style="animation-delay: ${index * 0.1}s;">
          <h4>${project.title}</h4>
          <p>${project.description}</p>
          <div class="project-tags">
            ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    if (hasNext) {
      html += `
        <button class="next-projects-btn" onclick="chatbotInstance.showNextProjects()">
          Next Projects →
        </button>
      `;
    }

    html += `</div>`;
    return html;
  }

  generateSkillsCard() {
    return `
      <div class="card-response skills-card">
        <h3>⚙️ Skills & Expertise</h3>
        
        <div class="skill-category">
          <h4>📝 Languages</h4>
          <div class="skill-tags">
            <span>Python</span>
            <span>JavaScript</span>
            <span>TypeScript</span>
            <span>Java</span>
            <span>C</span>
          </div>
        </div>

        <div class="skill-category">
          <h4>🤖 AI & ML</h4>
          <div class="skill-tags">
            <span>LLMs</span>
            <span>RAG Pipelines</span>
            <span>Deep Learning</span>
            <span>Anomaly Detection</span>
            <span>ML Models</span>
          </div>
        </div>

        <div class="skill-category">
          <h4>🌐 Web & Frontend</h4>
          <div class="skill-tags">
            <span>React</span>
            <span>Node.js</span>
            <span>Express</span>
            <span>REST APIs</span>
            <span>Full-Stack</span>
          </div>
        </div>

        <div class="skill-category">
          <h4>💾 Databases & Tools</h4>
          <div class="skill-tags">
            <span>PostgreSQL</span>
            <span>MongoDB</span>
            <span>ChromaDB</span>
            <span>Apache Kafka</span>
            <span>Docker</span>
          </div>
        </div>
      </div>
    `;
  }

  generateFunCard() {
    return `
      <div class="card-response fun-card">
        <h3>🎉 Fun Facts About Me</h3>
        <div class="fun-image-placeholder">
          <div class="placeholder-text">🏔️ Image coming soon...</div>
          <p style="margin-top: 12px; font-size: 0.9rem; color: rgba(255,255,255,0.7);">Will add personal adventure photos here!</p>
        </div>
        <div class="fun-facts">
          <div class="fact-item">
            <span>🧠</span>
            <p>Passionate about AI & Machine Learning – the future is here!</p>
          </div>
          <div class="fact-item">
            <span>🎮</span>
            <p>Love tackling complex algorithms and problem-solving</p>
          </div>
          <div class="fact-item">
            <span>💡</span>
            <p>Always excited about new JavaScript/TypeScript frameworks</p>
          </div>
          <div class="fact-item">
            <span>🚀</span>
            <p>Experimenting with different architecture patterns & innovation</p>
          </div>
        </div>
      </div>
    `;
  }

  generateContactCard() {
    return `
      <div class="card-response contact-card">
        <h3>📧 Let's Connect!</h3>
        <div class="contact-items">
          <div class="contact-item">
            <span>✉️</span>
            <div>
              <p class="contact-label">Email</p>
              <p class="contact-value">sahitikontam@gmail.com</p>
            </div>
          </div>
          <div class="contact-item">
            <span>💼</span>
            <div>
              <p class="contact-label">LinkedIn</p>
              <p class="contact-value">linkedin.com/in/sahithi-kontam</p>
            </div>
          </div>
          <div class="contact-item">
            <span>🐙</span>
            <div>
              <p class="contact-label">GitHub</p>
              <p class="contact-value">github.com/sahithiK04</p>
            </div>
          </div>
        </div>
        <p style="margin-top: 16px; font-size: 0.9rem; color: rgba(255,255,255,0.8);">Feel free to reach out for collaborations, opportunities, or just to chat about tech! 💬</p>
      </div>
    `;
  }

  showNextProjects() {
    const totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
    this.currentProjectPage = (this.currentProjectPage + 1) % totalPages;
    this.addMessage('ai', this.generateProjectsCard());
  }
}

// Global instance for onclick handlers
let chatbotInstance;

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  chatbotInstance = new PortfolioChatbot();
});
