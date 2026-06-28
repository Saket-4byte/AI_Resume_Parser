import React, { useState, useEffect, useRef } from 'react';

// Pre-configured list of candidates including a dummy tech candidate profile
const initialCandidates = [
  {
    id: 'liam-carter',
    name: 'Liam Carter',
    role: 'AI Software Intern',
    skills: ['Python', 'JavaScript', 'React.js', 'Node.js', 'FastAPI', 'PyTorch', 'SQL', 'Git', 'HTML5', 'CSS3', 'REST APIs', 'Machine Learning', 'NLP', 'Data Structures', 'Docker'],
    experience: [
      { company: 'Nexus AI Labs', title: 'AI Engineering Intern', period: 'Jan 2026 - Present' },
      { company: 'OpenSource Tech', title: 'Core Contributor', period: 'Jun 2025 - Dec 2025' }
    ],
    education: [
      { school: 'State Institute of Technology', degree: 'B.Tech in Computer Science', period: '2023 - 2027', grade: 'GPA: 9.1/10' },
      { school: 'Oakridge High School', degree: 'High School Diploma', period: '2021 - 2023', grade: '94%' }
    ],
    projects: [
      { title: 'DocuQuery AI – Intelligent Document Search', tool: 'Python/FastAPI/RAG', description: 'Developed a Retrieval-Augmented Generation (RAG) system for searching local PDFs using semantic embeddings and vector search, reducing search latency by 40%.' },
      { title: 'Interactive Portfolio Builder', tool: 'React/Vite/Tailwind', description: 'Created a dynamic, customizable portfolio page builder application featuring drag-and-drop sections and live site previewing.' }
    ],
    email: 'liam.carter@nexusai.io',
    phone: '+1 (555) 019-2834',
    score: 94,
    status: 'New',
    date: 'Today',
    summary: 'Computer Science student specializing in Intelligent Systems. Experienced in developing RAG pipelines, RESTful APIs using FastAPI, and modern user interfaces with React and Tailwind CSS.'
  },
  {
    id: 'alex-henderson',
    name: 'Alex Henderson',
    role: 'Senior Software Engineer',
    skills: ['React.js', 'Python', 'AWS Cloud', 'Docker', 'Kubernetes', 'Node.js'],
    experience: [
      { company: 'TechCorp Solutions', title: 'Lead Full Stack Developer', period: '2019 - Present' },
      { company: 'WebStart Co', title: 'Software Engineer', period: '2016 - 2019' }
    ],
    education: [
      { school: 'Stanford University', degree: 'BS in Computer Science', period: '2012 - 2016', grade: 'GPA: 3.82' }
    ],
    email: 'alex.h@techcorp.io',
    phone: '+1 (555) 234-5678',
    score: 99,
    status: 'Hired',
    date: 'Oct 10',
    summary: 'A seasoned engineering leader with 7+ years of experience in cloud architectures and React/Node web ecosystems.'
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'AI Research Scientist',
    skills: ['PyTorch', 'LLMs', 'NLP', 'Python', 'TensorFlow', 'Transformer Models'],
    experience: [
      { company: 'DeepMind', title: 'Research Scientist', period: '2021 - Present' },
      { company: 'Stanford AI Lab', title: 'Graduate Researcher', period: '2019 - 2021' }
    ],
    education: [
      { school: 'MIT', degree: 'PhD in Computer Science (AI Focus)', period: '2016 - 2019', grade: 'GPA: 4.0' },
      { school: 'UC Berkeley', degree: 'BS in Computer Science', period: '2012 - 2016', grade: 'GPA: 3.95' }
    ],
    email: 'schen@mit.edu',
    phone: '+1 (555) 987-6543',
    score: 98,
    status: 'Hired',
    date: 'Oct 12',
    summary: 'Specialist in natural language processing and transformer architectures with publications in NeurIPS and ICML.'
  },
  {
    id: 'michael-ross',
    name: 'Michael Ross',
    role: 'Product Manager',
    skills: ['Agile', 'Product Strategy', 'SQL', 'User Research', 'Jira', 'Figma'],
    experience: [
      { company: 'Apex Corp', title: 'Senior Product Manager', period: '2020 - Present' },
      { company: 'SaaSify', title: 'Product Owner', period: '2017 - 2020' }
    ],
    education: [
      { school: 'Harvard Business School', degree: 'MBA', period: '2015 - 2017' },
      { school: 'Yale University', degree: 'BS in Economics', period: '2011 - 2015' }
    ],
    email: 'mross@apex.com',
    phone: '+1 (555) 456-7890',
    score: 85,
    status: 'Screening',
    date: 'Oct 14',
    summary: 'Results-driven PM with a track record of launching scalable B2B SaaS products and managing cross-functional squads.'
  }
];

// Dynamically load PDF.js and extract text in pure frontend
const loadPdfText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  let pdfjsLib = window['pdfjs-dist/build/pdf'];

  if (!pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    pdfjsLib = window['pdfjs-dist/build/pdf'];
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(" ") + "\n";
  }
  return text;
};

// Dynamically load Mammoth.js and extract text in pure frontend
const loadDocxText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  if (!window.mammoth) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// Generate a fallback mock candidate
const generateMockCandidate = (filename, fileText) => {
  let cleanName = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]/g, " ")
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let extractedEmail = '';
  let extractedPhone = '';
  let extractedSkills = [];

  if (fileText) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = fileText.match(emailRegex);
    if (emails) extractedEmail = emails[0];

    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = fileText.match(phoneRegex);
    if (phones) extractedPhone = phones[0];

    const skillKeywords = ['React', 'Vue', 'Angular', 'Node', 'Express', 'Python', 'Java', 'Django', 'Flask', 'SQL', 'NoSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Figma', 'Git'];
    skillKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(fileText)) {
        extractedSkills.push(skill);
      }
    });
  }

  extractedEmail = extractedEmail || `${cleanName.toLowerCase().replace(/\s+/g, '')}@example.com`;
  extractedPhone = extractedPhone || `+1 (555) ${Math.floor(100 + Math.random() * 905)}-${Math.floor(1000 + Math.random() * 9000)}`;
  if (extractedSkills.length === 0) {
    extractedSkills = ['React.js', 'Node.js', 'TypeScript', 'CSS'];
  }

  const developerRoles = ['Full Stack Developer', 'Backend Engineer', 'Frontend Engineer', 'Software Engineer'];
  const randomRole = developerRoles[Math.floor(Math.random() * developerRoles.length)];

  return {
    id: `candidate-${Date.now()}`,
    name: cleanName,
    role: randomRole,
    skills: extractedSkills,
    experience: [
      { company: 'Tech Solutions Inc.', title: 'Software Engineer', period: '2022 - Present' },
      { company: 'Digital Agency', title: 'Junior Developer', period: '2020 - 2022' }
    ],
    education: [
      { school: 'State University', degree: 'BS in Computer Science', period: '2018 - 2022', grade: 'GPA: 3.65' }
    ],
    email: extractedEmail,
    phone: extractedPhone,
    score: Math.floor(Math.random() * 15) + 80,
    status: 'New',
    date: 'Today',
    summary: `Extracted profile for ${cleanName}. Demonstrated expertise in ${extractedSkills.slice(0, 3).join(', ')} with a strong foundation in collaborative engineering.`
  };
};

// Call the backend API parser endpoint or call Gemini API directly if frontendApiKey is provided
const parseResumeWithGemini = async (fileText, filename, frontendApiKey = '') => {
  if (frontendApiKey) {
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${frontendApiKey}`;
    
    const prompt = `Parse the following resume text into a structured JSON profile. Extracted fields should match this schema: {
  name: string,
  role: string,
  skills: string[],
  experience: { company: string, title: string, period: string }[],
  education: { school: string, degree: string, period: string, grade: string }[],
  projects: { title: string, tool: string, description: string }[],
  email: string,
  phone: string,
  score: number (match score from 0-100 indicating relevance to a software/tech role),
  summary: string (brief AI executive summary)
}

Resume text:
${fileText || filename}`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              role: { type: "STRING" },
              skills: { type: "ARRAY", items: { type: "STRING" } },
              experience: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    company: { type: "STRING" },
                    title: { type: "STRING" },
                    period: { type: "STRING" }
                  },
                  required: ["company", "title", "period"]
                }
              },
              education: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    school: { type: "STRING" },
                    degree: { type: "STRING" },
                    period: { type: "STRING" },
                    grade: { type: "STRING" }
                  },
                  required: ["school", "degree", "period"]
                }
              },
              projects: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    tool: { type: "STRING" },
                    description: { type: "STRING" }
                  },
                  required: ["title", "tool", "description"]
                }
              },
              email: { type: "STRING" },
              phone: { type: "STRING" },
              score: { type: "INTEGER" },
              summary: { type: "STRING" }
            },
            required: ["name", "role", "skills", "experience", "education", "projects", "email", "phone", "score", "summary"]
          }
        }
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      throw new Error(`Gemini direct API call failed: ${apiResponse.status} - ${errText}`);
    }

    const data = await apiResponse.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const parsedCandidate = JSON.parse(textResponse);

    return {
      ...parsedCandidate,
      id: `candidate-${Date.now()}`,
      status: 'New',
      date: 'Today'
    };
  }

  const response = await fetch('/api/parse-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileText, filename })
  });

  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}`);
  }

  const parsedCandidate = await response.json();

  return {
    ...parsedCandidate,
    id: `candidate-${Date.now()}`,
    status: 'New',
    date: 'Today'
  };
};

function App() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState(initialCandidates[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // API Integration states
  const [backendStatus, setBackendStatus] = useState({ online: false, apiConfigured: false });
  const [frontendApiKey, setFrontendApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', tempApiKey.trim());
    setFrontendApiKey(tempApiKey.trim());
    setShowKeyModal(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setFrontendApiKey('');
    setTempApiKey('');
    setShowKeyModal(false);
  };

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setBackendStatus({ online: data.status === 'online', apiConfigured: data.apiConfigured });
        }
      } catch (err) {
        console.error("Backend status check failed:", err);
      }
    };
    checkBackend();
  }, []);

  // Simulated parsing state
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [parseFilename, setParseFilename] = useState('');
  const fileInputRef = useRef(null);
  const fileContentRef = useRef('');

  // Parse steps texts
  const parseSteps = [
    { text: 'Reading file data & metadata...', duration: 600 },
    { text: 'Extracting semantic structure...', duration: 800 },
    { text: 'Analyzing experience & work history...', duration: 700 },
    { text: 'Identifying skills & certification tags...', duration: 600 },
    { text: 'Running AI score matching algorithm...', duration: 500 },
    { text: 'Finalizing candidate JSON profile...', duration: 400 }
  ];

  // Load and apply theme
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      triggerParsing(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      triggerParsing(files[0]);
    }
  };

  const triggerParsing = async (file) => {
    setParseFilename(file.name);
    setIsParsing(true);
    setParseStep(0);

    try {
      let text = "";
      if (file.name.endsWith('.pdf')) {
        text = await loadPdfText(file);
      } else if (file.name.endsWith('.docx')) {
        text = await loadDocxText(file);
      } else {
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result || "");
          reader.onerror = () => reject(new Error("Failed to read text file"));
          reader.readAsText(file);
        });
      }
      fileContentRef.current = text;
    } catch (err) {
      console.error("Text extraction failed, falling back to basic metadata:", err);
      fileContentRef.current = "";
    }
  };

  // Parsing simulation & api controller
  useEffect(() => {
    if (!isParsing) return;

    if (parseStep < parseSteps.length) {
      const timer = setTimeout(() => {
        setParseStep(prev => prev + 1);
      }, parseSteps[parseStep].duration);
      return () => clearTimeout(timer);
    } else {
      const runGenerator = async () => {
        const fileText = fileContentRef.current || "";

        let newCandidate;

        const activeKey = frontendApiKey || '';
        const useDirectAPI = !!activeKey;
        const useBackend = backendStatus.apiConfigured;

        // If either Client API key or Backend API is available, attempt real Gemini parsing
        if (useDirectAPI || useBackend) {
          try {
            newCandidate = await parseResumeWithGemini(fileText, parseFilename, activeKey);
          } catch (error) {
            console.error("Gemini API parsing failed, falling back to mock:", error);
            newCandidate = generateMockCandidate(parseFilename, fileText);
          }
        } else {
          newCandidate = generateMockCandidate(parseFilename, fileText);
        }

        // Do not add the parsed candidate to the candidate list table (don't save it in frontend)
        // Just show it in the right-hand panel as the active preview candidate
        setSelectedCandidate(newCandidate);
        setIsParsing(false);
      };

      runGenerator();
    }
  }, [isParsing, parseStep]);

  // Filtering logic
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-background dark:bg-[#020617] text-on-surface dark:text-slate-200 font-body-lg min-h-screen relative flex flex-col transition-colors duration-500">

      {/* Background Anim Grid */}
      <div id="bg-animation" className="opacity-40 dark:opacity-10 pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#004ac608_1px,transparent_1px),linear-gradient(to_bottom,#004ac608_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-tertiary/5 dark:bg-tertiary-container/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-surface/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-outline-variant/30 dark:border-slate-800 shadow-sm transition-colors duration-500">
        <nav className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-primary dark:text-primary-fixed-dim flex items-center gap-3">
            <img src="logo.png" alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-sm" />
            <div className="flex flex-col">
              <span className="leading-tight">ResumeAI</span>
              <span className={`text-[9px] font-bold tracking-wider uppercase transition-colors duration-300 ${
                backendStatus.online 
                  ? 'text-emerald-500 dark:text-emerald-400' 
                  : frontendApiKey 
                    ? 'text-primary dark:text-primary-fixed-dim' 
                    : 'text-amber-500'
              }`}>
                {backendStatus.online 
                  ? '● Live (Server)' 
                  : frontendApiKey 
                    ? '● Live (Client API)' 
                    : '● Demo Mode'}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="font-semibold text-sm text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim py-2" href="#">Home</a>
            <a className="font-semibold text-sm text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors py-2" href="#features">Features</a>
            <a className="font-semibold text-sm text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors py-2" href="#demo">Interactive Demo</a>
          </div>
          <div className="flex items-center gap-4">
            {/* API Key Settings Toggle */}
            <button
              onClick={() => {
                setTempApiKey(frontendApiKey);
                setShowKeyModal(true);
              }}
              className={`p-2 rounded-full hover:bg-secondary-container/50 dark:hover:bg-slate-850 transition-all cursor-pointer relative ${
                frontendApiKey ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant dark:text-slate-400'
              }`}
              id="api-key-settings"
              title="Configure Gemini API Key"
            >
              <span className="material-symbols-outlined block">vpn_key</span>
              {frontendApiKey && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-secondary-container/50 dark:hover:bg-slate-850 transition-all text-on-surface-variant dark:text-slate-400 cursor-pointer"
              id="theme-toggle"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <span className="material-symbols-outlined block">light_mode</span>
              ) : (
                <span className="material-symbols-outlined block">dark_mode</span>
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary/95 dark:hover:bg-primary-container/90 transition-transform active:scale-95 cursor-pointer shadow-md shadow-primary/10 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">upload_file</span>
              Upload Resume
            </button>
          </div>
        </nav>
      </header>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt,.doc,.md"
        className="hidden"
      />

      {/* Main Content */}
      <main className="pt-20 flex-grow z-10">

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 self-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight dark:text-white">
                Extract Resume Data in <span className="text-primary dark:text-primary-fixed-dim bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Seconds</span> with AI
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant dark:text-slate-400 max-w-lg leading-relaxed">
                Automate your recruitment workflow with high-precision AI parsing for PDF, DOCX, and text files. Transform messy resumes into structured candidate profiles instantly.
              </p>

              {/* Drag-and-drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${isDragOver
                  ? 'border-primary bg-primary/5 dark:bg-primary-container/10 scale-[1.02]'
                  : 'border-outline-variant/60 dark:border-slate-700 hover:border-primary/50 hover:bg-surface-container/30 dark:hover:bg-slate-900/40'
                  }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className={`material-symbols-outlined text-4xl transition-transform ${isDragOver ? 'scale-110 text-primary' : 'text-on-surface-variant dark:text-slate-400'}`}>
                    cloud_upload
                  </span>
                  <div>
                    <p className="font-semibold text-sm dark:text-slate-200">
                      Drag & drop resume file here, or <span className="text-primary dark:text-primary-fixed-dim underline">browse</span>
                    </p>
                    <p className="text-xs text-on-surface-variant dark:text-slate-500 mt-1">
                      Supports PDF, DOCX, TXT, MD up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href="#demo"
                  className="bg-secondary-container dark:bg-slate-800 text-primary dark:text-primary-fixed-dim px-6 py-3 rounded-xl font-semibold text-base hover:bg-secondary-container/80 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer border border-outline-variant/20 dark:border-slate-700 shadow-sm"
                >
                  <span className="material-symbols-outlined text-xl">play_circle</span>
                  Explore Recruiter Dashboard
                </a>
              </div>
            </div>

            {/* Right Content: Active Candidate Card Preview */}
            <div className="lg:col-span-6 relative">
              <div className="glass-panel p-6 rounded-2xl card-shadow border border-outline-variant/30 dark:border-slate-800/80 hover:shadow-xl transition-all duration-300 relative z-10">

                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary-container/20 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-primary-fixed-dim">
                      <span className="material-symbols-outlined text-2xl font-bold">person</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        {selectedCandidate.name}
                        {selectedCandidate.status === 'New' && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-2xs font-semibold border border-primary/20">New</span>
                        )}
                      </h3>
                      <p className="text-on-surface-variant dark:text-slate-400 text-xs font-semibold">{selectedCandidate.role}</p>
                    </div>
                  </div>

                  {/* Score circle */}
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm self-start sm:self-auto">
                    <span className="material-symbols-outlined text-lg">workspace_premium</span>
                    <span className="font-bold text-sm">{selectedCandidate.score}% Match Score</span>
                  </div>
                </div>

                {/* Candidate Summary */}
                <div className="mb-6 p-4 rounded-xl bg-surface-container-low/50 dark:bg-slate-950/40 border border-outline-variant/20 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">summarize</span>
                    AI Executive Summary
                  </h4>
                  <p className="text-sm text-on-surface-variant dark:text-slate-300 leading-relaxed italic">
                    "{selectedCandidate.summary}"
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Skills tags */}
                  <div>
                    <h4 className="text-xs font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm font-bold">dataset</span>
                      Extracted Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 text-xs font-medium border border-outline-variant/20 dark:border-slate-700/60 shadow-sm hover:border-primary/30 dark:hover:border-primary-fixed-dim/30 hover:scale-[1.03] transition-all"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="border-t border-outline-variant/30 dark:border-slate-800 pt-5">
                    <h4 className="text-xs font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm font-semibold">work</span>
                      Work History
                    </h4>
                    <div className="space-y-4">
                      {selectedCandidate.experience.map((exp, index) => (
                        <div key={index} className="flex justify-between items-start text-sm">
                          <div>
                            <p className="font-bold dark:text-slate-200">{exp.company}</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{exp.title}</p>
                          </div>
                          <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400 bg-surface-container-high dark:bg-slate-850 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {exp.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                    <div className="border-t border-outline-variant/30 dark:border-slate-800 pt-5">
                      <h4 className="text-xs font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm font-semibold">construction</span>
                        Projects
                      </h4>
                      <div className="space-y-3">
                        {selectedCandidate.projects.map((proj, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between items-center">
                              <p className="font-bold dark:text-slate-200">{proj.title}</p>
                              <span className="px-2 py-0.5 rounded-md bg-secondary-container/50 dark:bg-slate-850 text-[10px] font-semibold text-primary dark:text-primary-fixed-dim border border-outline-variant/10">
                                {proj.tool}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Details */}
                  {selectedCandidate.education && (
                    <div className="border-t border-outline-variant/30 dark:border-slate-800 pt-5">
                      <h4 className="text-xs font-bold text-primary dark:text-primary-fixed-dim uppercase tracking-wider mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm font-semibold">school</span>
                        Education Details
                      </h4>
                      <div className="space-y-4">
                        {Array.isArray(selectedCandidate.education) ? (
                          selectedCandidate.education.map((edu, index) => (
                            <div key={index} className="flex justify-between items-start text-sm">
                              <div>
                                <p className="font-bold dark:text-slate-200">{edu.school}</p>
                                <p className="text-xs text-on-surface-variant dark:text-slate-400">
                                  {edu.degree} {edu.grade && <span className="font-semibold text-primary dark:text-primary-fixed-dim">({edu.grade})</span>}
                                </p>
                              </div>
                              <span className="text-xs font-medium text-on-surface-variant dark:text-slate-400 bg-surface-container-high dark:bg-slate-850 px-2 py-0.5 rounded-md whitespace-nowrap">
                                {edu.period}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between items-start text-sm">
                            <div>
                              <p className="font-bold dark:text-slate-200">{selectedCandidate.education}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="border-t border-outline-variant/30 dark:border-slate-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-primary dark:text-primary-fixed-dim">mail</span>
                      <span>{selectedCandidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-primary dark:text-primary-fixed-dim">call</span>
                      <span>{selectedCandidate.phone}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 z-20 glass-panel p-3 px-4 rounded-xl shadow-lg border border-primary/25 bg-white/90 dark:bg-slate-900/90 animate-bounce">
                <div className="flex items-center gap-2 text-primary dark:text-primary-fixed-dim">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  <span className="text-xs font-bold tracking-tight">99.4% Parsing Accuracy</span>
                </div>
              </div>

              {/* Background gradient blob behind mockup */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

          </div>
        </section>

        {/* Features Grid Section */}
        <section className="py-20 bg-surface-container-low dark:bg-slate-900/40" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight dark:text-white">Everything You Need to Scale</h2>
              <p className="text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                Our advanced NLP models are fine-tuned specifically to decode complex resumes across engineering, sales, and design departments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-slate-900/30 border border-outline-variant/30 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">neurology</span>
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white">Deep AI Processing</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Goes beyond standard keyword matching. Analyzes semantic hierarchy to understand candidate potential and match roles accurately.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-slate-900/30 border border-outline-variant/30 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white">Multi-Format Support</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Seamlessly extract data from PDF, DOCX, Markdown, and TXT files, resolving layout irregularities and messy column formats.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-slate-900/30 border border-outline-variant/30 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white">Smart Skill Extraction</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Automatically extracts and distinguishes technical tools, programming languages, soft skills, and certificates into neat tags.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-slate-900/30 border border-outline-variant/30 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white">Chronological Timelines</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Organizes employment history and degrees chronologically, catching overlaps, career breaks, and tenure durations automatically.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-slate-900/30 border border-outline-variant/30 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">person_search</span>
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white">Talent Search Engine</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Query parsed CV profiles with natural language. Search by skills, tenure, match score, or status inside the recruiter console.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-6 rounded-2xl bg-surface-container-lowest dark:bg-slate-900/30 border border-outline-variant/30 dark:border-slate-800/80 shadow-md hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed-dim mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">summarize</span>
                </div>
                <h3 className="text-base font-bold mb-2 dark:text-white">Summarized Profiles</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Condenses multi-page resumes into a clear, single-paragraph AI summary. Perfect for fast-screening candidates.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Dashboard Preview / Interactive Demo Section */}
        <section className="py-20 max-w-7xl mx-auto px-6 scroll-mt-24" id="demo">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Description Info */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight dark:text-white">The Recruiter Command Center</h2>
              <p className="text-on-surface-variant dark:text-slate-400 text-base leading-relaxed">
                Experience real-time interactive resume parsing. Upload a resume file on this page, or click candidates in the dashboard table below to load their AI-extracted details in the main preview card.
              </p>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm font-semibold text-primary dark:text-primary-fixed-dim">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                  Real-time pipeline analytics
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-primary dark:text-primary-fixed-dim">
                  <span className="material-symbols-outlined text-xl">dataset</span>
                  Smart skill category mapping
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-primary dark:text-primary-fixed-dim">
                  <span className="material-symbols-outlined text-xl">groups</span>
                  Instant dashboard synchronization
                </li>
              </ul>

              {/* Upload trigger button inside dashboard panel info */}
              <div className="pt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">upload_file</span>
                  Simulate Resume Upload
                </button>
              </div>
            </div>

            {/* Recruiter Console Layout */}
            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl card-shadow border border-outline-variant/30 dark:border-slate-800/80 p-6 flex flex-col transition-all duration-500 overflow-hidden">

                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-outline-variant/20 dark:border-slate-800 pb-4">
                  <div>
                    <h4 className="text-lg font-bold dark:text-white">Active Candidates</h4>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400">Total parsed profiles in the current pipeline</p>
                  </div>

                  {/* Filters block */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Search bar */}
                    <div className="relative flex-grow sm:flex-grow-0">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant dark:text-slate-400">search</span>
                      <input
                        type="text"
                        placeholder="Search name/skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-4 py-1.5 rounded-lg border border-outline-variant/40 dark:border-slate-700/60 bg-surface-container-low dark:bg-slate-950 text-xs w-full focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 dark:text-slate-200"
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      )}
                    </div>

                    {/* Status filter dropdown */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/40 dark:border-slate-700/60 bg-surface-container-low dark:bg-slate-950 text-xs text-on-surface-variant dark:text-slate-300 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Hired">Hired</option>
                      <option value="Screening">Screening</option>
                      <option value="New">New</option>
                    </select>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary/5 dark:bg-primary-container/5 p-4 rounded-xl border border-primary/10 dark:border-primary-container/10">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant dark:text-slate-400 mb-1">Total Resumes</p>
                    <p className="text-xl font-bold dark:text-white">{candidates.length}</p>
                  </div>
                  <div className="bg-primary/5 dark:bg-primary-container/5 p-4 rounded-xl border border-primary/10 dark:border-primary-container/10">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant dark:text-slate-400 mb-1">In Pipeline</p>
                    <p className="text-xl font-bold dark:text-white">{candidates.filter(c => c.status !== 'Hired').length}</p>
                  </div>
                  <div className="bg-primary/5 dark:bg-primary-container/5 p-4 rounded-xl border border-primary/10 dark:border-primary-container/10">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant dark:text-slate-400 mb-1">Top Sector</p>
                    <p className="text-xl font-bold dark:text-white">Software</p>
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-surface-container-low dark:bg-slate-950/70 border border-outline-variant/20 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/30 dark:border-slate-800 text-on-surface-variant dark:text-slate-400 font-bold bg-surface-container-high/30 dark:bg-slate-950/90">
                        <th className="p-4">Candidate</th>
                        <th className="p-4">Primary Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">AI Score</th>
                        <th className="p-4 text-right">Processed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 dark:divide-slate-800/60">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate) => (
                          <tr
                            key={candidate.id}
                            onClick={() => setSelectedCandidate(candidate)}
                            className={`cursor-pointer transition-all ${selectedCandidate.id === candidate.id
                              ? 'bg-primary/10 dark:bg-primary-container/15 font-semibold text-primary dark:text-primary-fixed-dim'
                              : 'hover:bg-surface-container-high/50 dark:hover:bg-slate-900/50 text-on-surface dark:text-slate-300'
                              }`}
                          >
                            <td className="p-4">
                              <div className="font-bold">{candidate.name}</div>
                              <div className="text-[10px] text-on-surface-variant dark:text-slate-500 font-normal">{candidate.email}</div>
                            </td>
                            <td className="p-4 font-medium">{candidate.role}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${candidate.status === 'Hired'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : candidate.status === 'Screening'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-primary/10 text-primary dark:text-primary-fixed-dim border-primary/20'
                                }`}>
                                {candidate.status}
                              </span>
                            </td>
                            <td className="p-4 text-center font-bold">{candidate.score}/100</td>
                            <td className="p-4 text-right text-on-surface-variant dark:text-slate-400">{candidate.date}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-on-surface-variant dark:text-slate-500">
                            No candidates match your search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-surface-container-low dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="p-8 bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 dark:border-slate-800 text-center flex flex-col items-center shadow-md">
                <img
                  className="w-32 h-32 mb-6 object-contain dark:brightness-90 hover:scale-105 transition-transform"
                  alt="A clean, minimalist 3D illustration of an analog clock with flowing digital data lines around it"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBepZt3GQWXThPuBXV0S-0JurVMX7f9Ce-U_bRTrE28-ea41dpws0FOtA1idutRBqR26Yvx-TP_QYeXjT277mEmf1yKh647SglYNsgWwahXQqPQHg8rBC2CnCFSb_s25Nx6KVTijHj3WiwNL3cpgMKS_Zuu9Ljuyxm_ZeqVFuEQfP4NuRxtjDy560J-sYU8D4ppkRKrMUwTH8TxEMH5NsVTCn4T8f9kpnv4cBC9mSyUQzpxROW5yJtrTuSiS4LBYLv67f-6VMusteUX"
                />
                <h3 className="text-base font-bold mb-2 dark:text-white">Save Hours of Manual Entry</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Convert thousands of multi-page resumes into structured profile dashboards in minutes, not days.
                </p>
              </div>

              <div className="p-8 bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 dark:border-slate-800 text-center flex flex-col items-center shadow-md">
                <img
                  className="w-32 h-32 mb-6 object-contain dark:brightness-90 hover:scale-105 transition-transform"
                  alt="A sophisticated abstract illustration of a magnifying glass scanning a grid of diverse professional profile icons"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABqhvDhEfJlYQ53bpJT1pvEq0LWxhmqo1Siyn3d4AtRxPFEWZAZcF8Fdjm8niV2RYsqY-UX9lRUDWnsn1prMKZ62mVZ2NISTFU620qozGTKknr5HokVHsHA-fwQ3uWL4yfS1hv5N1EZAr5UbE8cnvTvjjmZ_E4TP5CT7hG0zk8A054cryvuwTOQ83jPyQCsjxp_Ov5aA_otV037Tux6o98FAfZLaS0_BBKSESzYElJLcTcrekuyFmETL-l2RbUMC8TUWonx51FGTlK"
                />
                <h3 className="text-base font-bold mb-2 dark:text-white">Improve Candidate Selection</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Standardized metrics and skill density highlights make merit-based screening quick and highly consistent.
                </p>
              </div>

              <div className="p-8 bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 dark:border-slate-800 text-center flex flex-col items-center shadow-md">
                <img
                  className="w-32 h-32 mb-6 object-contain dark:brightness-90 hover:scale-105 transition-transform"
                  alt="A high-tech digital brain icon composed of interconnected blue nodes and neural paths"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaqVpbalOf5rPokc42f2bpN4y4QlS3nxmBasPUxUkrMC9fbMrApMpmuvSGDjqfM6RRtqaz0cB3y4wxSL7gNHvOFZjbXqMMvkxIImJhHnT7-oEBc_MsacCw7FWgZiek64B5GmlTa894eTHvnZN8gC084tZi4yu1DPcQE1HvnqL-YTgyZsiHw0XK82N9pfnidQuHXWn-rjmo-21AXpiCEVBCehuCSgz5zd1Ep_YMTq5qDqCByTorL4L_rC2GO-3iIdJ7MeEDISnqT5_y"
                />
                <h3 className="text-base font-bold mb-2 dark:text-white">Enterprise-Grade AI</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-relaxed">
                  Leverage HR-tuned LLM transformers trained explicitly for reading semantic syntax and job title mappings.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-[#020617] border-t border-outline-variant/30 dark:border-slate-900 w-full py-12 transition-colors duration-500 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-sm text-on-surface-variant dark:text-slate-550 flex items-center gap-3 font-bold">
            <img src="logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span>ResumeAI © 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-on-surface-variant dark:text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          </div>
        </div>
      </footer>

      {/* Simulated Parser Overlay Modal */}
      {isParsing && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">

            {/* Spinning background effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse"></div>

            <div className="flex flex-col items-center text-center space-y-6">

              {/* Spinner & Progress */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary dark:text-primary-fixed-dim animate-spin">
                  sync
                </span>
              </div>

              {/* Title & File */}
              <div>
                <h4 className="text-lg font-bold dark:text-white flex items-center gap-3 justify-center">
                  <img src="logo.png" alt="Logo" className="w-9 h-9 rounded-lg object-contain animate-pulse" />
                  <span>AI Parsing in Progress</span>
                </h4>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-2 font-medium bg-surface-container dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-outline-variant/10 dark:border-slate-800 max-w-xs truncate">
                  File: {parseFilename}
                </p>
              </div>

              {/* Steps status */}
              <div className="w-full space-y-3 pt-2 text-left">
                {parseSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {parseStep > idx ? (
                      <span className="material-symbols-outlined text-emerald-500 font-bold text-sm">check_circle</span>
                    ) : parseStep === idx ? (
                      <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-350 dark:text-slate-700 text-sm">pending</span>
                    )}
                    <span className={`${parseStep > idx
                      ? 'text-on-surface-variant/60 dark:text-slate-500 line-through'
                      : parseStep === idx
                        ? 'text-primary dark:text-primary-fixed-dim font-bold'
                        : 'text-on-surface-variant/40 dark:text-slate-600'
                      }`}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary dark:bg-primary-container h-full transition-all duration-300 ease-out"
                  style={{ width: `${(parseStep / parseSteps.length) * 100}%` }}
                ></div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">vpn_key</span>
                  Gemini API Configuration
                </h4>
                <button 
                  onClick={() => setShowKeyModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined block">close</span>
                </button>
              </div>

              <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                Configure a local <strong>Gemini API Key</strong> to enable real-time AI parsing directly in the browser. Useful when deploying to static hosting environments like GitHub Pages.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your GEMINI_API_KEY..."
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 dark:border-slate-700/60 bg-surface-container-low dark:bg-slate-950 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 dark:text-slate-200"
                />
              </div>

              {/* Status details inside modal */}
              <div className="p-4 rounded-xl bg-surface-container-low/50 dark:bg-slate-950/40 border border-outline-variant/20 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="dark:text-slate-400">Backend Server:</span>
                  <span className={`font-semibold ${backendStatus.online ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {backendStatus.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="dark:text-slate-400">Active Key Mode:</span>
                  <span className={`font-semibold ${frontendApiKey ? 'text-primary dark:text-primary-fixed-dim' : 'text-amber-500'}`}>
                    {frontendApiKey ? 'Client Key Loaded' : 'None (Mock Demo)'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                {frontendApiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error/10 transition-all cursor-pointer border border-error/25"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-slate-850 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container px-5 py-2 rounded-xl font-bold text-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
