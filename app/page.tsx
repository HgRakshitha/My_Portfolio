"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import gsap from "gsap";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  /* ===== Smooth Scroll with Lenis ===== */
  useEffect(() => {
    const initLenis = async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: isMobile ? 1.5 : 2,
        infinite: false,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    };

    initLenis();
  }, [isMobile]);

  /* ===== Advanced Particle System ===== */
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "floating-particle";
      const size = Math.random() * 6 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 25 + 20}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      const colors = ["rgba(0, 212, 170, 0.6)", "rgba(0, 184, 212, 0.6)", "rgba(255, 107, 107, 0.6)"];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      document.querySelector(".space-bg")?.appendChild(particle);

      setTimeout(() => particle.remove(), 40000);
    };

    for (let i = 0; i < 40; i++) {
      setTimeout(() => createParticle(), i * 150);
    }

    const interval = setInterval(() => {
      createParticle();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  /* ===== Detect Mobile Device ===== */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 968 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ===== Prevent body scroll when mobile menu is open ===== */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  /* ===== Mouse Position Tracking ===== */
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  /* ===== Enhanced Cursor (Desktop Only) ===== */
  useEffect(() => {
    if (isMobile) {
      // Hide cursor elements on mobile
      const cursor = document.querySelector(".cursor-tail") as HTMLElement;
      const cursorFollower = document.querySelector(".cursor-follower") as HTMLElement;
      if (cursor) cursor.style.display = "none";
      if (cursorFollower) cursorFollower.style.display = "none";
      return;
    }

    const cursor = document.querySelector(".cursor-tail") as HTMLElement;
    const cursorFollower = document.querySelector(".cursor-follower") as HTMLElement;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;

    const move = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (cursor) {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%,-50%)`;
      }
    };

    const animateFollower = () => {
      followerX += (cursorX - followerX) * 0.08;
      followerY += (cursorY - followerY) * 0.08;
      if (cursorFollower) {
        cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%,-50%)`;
      }
      requestAnimationFrame(animateFollower);
    };

    animateFollower();

    const click = (e: MouseEvent) => {
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 800);
    };

    /* Magnetic effect (Desktop only) */
    const magneticElements = document.querySelectorAll(
      ".magnetic, .project-card, .contact-btn, .nav-links a, .skill-card"
    );

    magneticElements.forEach((el) => {
      el.addEventListener("mousemove", (e: Event) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left - rect.width / 2;
        const y = (e as MouseEvent).clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)",
        });
      });
    });

    window.addEventListener("mousemove", move);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("click", click);
    };
  }, [isMobile]);

  /* ===== GSAP Scroll Animations ===== */
  useEffect(() => {
    let ctx: gsap.Context | null = null;

    const initGSAP = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.utils.toArray(".skill-bar-fill").forEach((bar: any) => {
          gsap.fromTo(
            bar,
            { width: "0%" },
            {
              width: bar.dataset.width || "0%",
              scrollTrigger: {
                trigger: bar,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              duration: 1.5,
              ease: "power3.out",
            }
          );
        });
      });
    };

    initGSAP();

    return () => {
      if (ctx) {
        ctx.revert();
      }
    };
  }, []);

  const projects = [
    {
      img: "/ai-blog.png",
      title: "RazCapitals – Trading Platform",
      desc: "Developed a comprehensive trading platform with website, admin panel, and user dashboard using React and TypeScript, integrated with Supabase for authentication and data management.",
      tech: ["React", "TypeScript", "Supabase", "PostgreSQL"],
      link: "#",
    },
    {
      img: "/ai-chat.jpg",
      title: "DoorSync – Community Management Platform",
      desc: "Contributed to backend microservices development using Java and Spring Boot, following DDD, CQRS, and hexagonal architecture principles. Built serverless APIs with AWS Lambda and API Gateway.",
      tech: ["Java", "Spring Boot", "AWS Lambda", "API Gateway", "DynamoDB", "Cognito"],
      link: "#",
    },
    {
      img: "/ai-blog.png",
      title: "Traffic Sign Recognition System",
      desc: "Designed and trained a CNN model using TensorFlow to classify traffic signs, achieving over 95% accuracy through data augmentation and model tuning.",
      tech: ["Python", "TensorFlow", "Keras", "CNN", "Machine Learning"],
      link: "#",
    },
    {
      img: "/ai-chat.jpg",
      title: "IoT Smart Walk Stick",
      desc: "Engineered a smart walking stick with Arduino-based sensors for gait analysis and fall detection, featuring real-time alerts to enhance mobility and safety.",
      tech: ["Arduino", "IoT", "Sensors", "Embedded Systems"],
      link: "#",
    },
  ];

  const skills = [
    { name: "Frontend Development", level: 90, icon: "🎨" },
    { name: "Backend Development", level: 88, icon: "⚙️" },
    { name: "Cloud & AWS", level: 85, icon: "☁️" },
    { name: "Machine Learning", level: 82, icon: "🤖" },
    { name: "Full-Stack Development", level: 90, icon: "💻" },
  ];

  const techStack = [
    "Java", "JavaScript", "TypeScript", "Python", "React", "Next.js",
    "Spring Boot", "AWS Lambda", "API Gateway", "Supabase", "MySQL",
    "DynamoDB", "Docker", "TensorFlow", "Keras", "Git", "PostgreSQL"
  ];

  return (
    <main className="page">
      <div className="space-bg">
        <div className="animated-gradient-orb orb-1" />
        <div className="animated-gradient-orb orb-2" />
        <div className="animated-gradient-orb orb-3" />
        <div className="grid-pattern" />
      </div>
      <div className="cursor-tail" />
      <div className="cursor-follower" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* NAV */}
      <motion.header
        className="navbar"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="nav-container">
          <motion.div
            className="nav-left"
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="nav-logo-mark"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              }}
            >
              <span>RK</span>
            </motion.div>
            <span className="nav-logo-text">Ranith Kumar</span>
          </motion.div>
          <nav className={`nav-links ${isMobileMenuOpen ? "nav-links-open" : ""}`}>
            {["home", "about", "skills", "projects", "contact"].map((i, idx) => (
              <motion.a
                key={i}
                href={`#${i}`}
                className="magnetic"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                whileHover={{ y: isMobile ? 0 : -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  // Smooth scroll to section
                  const element = document.getElementById(i);
                  if (element) {
                    e.preventDefault();
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {i}
              </motion.a>
            ))}
          </nav>
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "menu-open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </motion.header>

      {/* HERO */}
      <section id="home" className="hero section" ref={heroRef}>
        <div className="hero-background-glow" />
        <motion.div
          className="container hero-inner"
          style={{ scale, opacity }}
        >
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="badge-dot" />
              Available for opportunities
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Crafting Digital
              <br />
              <span className="gradient-text">Experiences</span> That
              <br />
              <span className="gradient-text-alt">Inspire & Engage</span>
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Software Developer passionate about building scalable web applications,
              backend microservices, and AI-powered solutions. Currently working at
              Unico International, crafting innovative digital experiences.
            </motion.p>

            <motion.div
              className="hero-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <motion.a
                href="#contact"
                className="btn-primary magnetic"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get In Touch
                <motion.span
                  className="btn-arrow"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.a>
              <motion.a
                href="#projects"
                className="btn-secondary magnetic"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Work
              </motion.a>
            </motion.div>

            <motion.div
              className="hero-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {[
                { number: "10+", label: "Projects" },
                { number: "2+", label: "Years Experience" },
                { number: "100%", label: "Client Satisfaction" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="stat-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + idx * 0.1, duration: 0.5 }}
                >
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            style={{
              x: useTransform(
                useSpring(mousePosition.x, { stiffness: 100, damping: 20 }),
                [-1, 1],
                [30, -30]
              ),
              y: useTransform(
                useSpring(mousePosition.y, { stiffness: 100, damping: 20 }),
                [-1, 1],
                [30, -30]
              ),
            }}
          >
            <div className="hero-image-frame">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
              >
                <img
                  src="/ranith-1.jpeg"
                  alt="Ranith Kumar"
                  className="hero-image"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "24px" }}
                />
              </motion.div>
              <div className="hero-image-glow" />
              <div className="hero-image-border" />
            </div>
            <div className="floating-shapes">
              <motion.div
                className="shape shape-1"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="shape shape-2"
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section about-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label">About Me</span>
            <h2 className="section-title">
              Building the Future,
              <br />
              <span className="gradient-text">One Line at a Time</span>
            </h2>
          </motion.div>

          <div className="about-content">
            <motion.div
              className="about-image-wrapper"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="about-image-frame">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
                >
                  <img
                    src="/ranith-2.jpeg"
                    alt="Ranith Kumar - About"
                    className="about-image"
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover", 
                      borderRadius: "24px",
                      display: "block"
                    }}
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                    }}
                  />
                </motion.div>
                <div className="about-image-glow" />
              </div>
            </motion.div>

            <motion.div
              className="about-text-content"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="about-description">
                I'm a Software Developer with a B.Tech in Computer Science and Engineering
                from MGIT, Hyderabad (2024). Currently working at Unico International Pvt Ltd,
                Bangalore, where I develop scalable web applications and backend microservices
                using modern technologies like React, Next.js, TypeScript, Java, and Spring Boot.
              </p>
              <p className="about-description">
                My expertise spans full-stack development, cloud architecture with AWS,
                and machine learning. I've contributed to projects ranging from corporate
                websites to complex trading platforms, following best practices like DDD,
                CQRS, and hexagonal architecture. I'm passionate about building production-grade
                applications that deliver exceptional user experiences.
              </p>

              <div className="about-highlights">
                {[
                  "Full-Stack Development",
                  "Backend Microservices",
                  "Cloud & AWS",
                  "Machine Learning",
                ].map((highlight, idx) => (
                  <motion.div
                    key={highlight}
                    className="highlight-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <span className="highlight-icon">✓</span>
                    {highlight}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="section skills-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label">Skills & Expertise</span>
            <h2 className="section-title">
              Technologies I <span className="gradient-text">Master</span>
            </h2>
          </motion.div>

          <div className="skills-circular-grid">
            {skills.map((skill, idx) => (
              <motion.div
                key={skill.name}
                className="skill-circular-card magnetic"
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: idx * 0.15, 
                  duration: 0.8, 
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="circular-progress-wrapper">
                  <svg className="circular-progress" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id={`circularGradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-primary)" />
                        <stop offset="100%" stopColor="var(--accent-secondary)" />
                      </linearGradient>
                    </defs>
                    <circle
                      className="circular-progress-bg"
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      strokeWidth="8"
                    />
                    <motion.circle
                      className="circular-progress-fill"
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke={`url(#circularGradient-${idx})`}
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: skill.level / 100 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: idx * 0.2, ease: "easeOut" }}
                      style={{
                        strokeDasharray: "314",
                        strokeDashoffset: "314",
                      }}
                    />
                  </svg>
                  <div className="circular-progress-content">
                    <div className="skill-icon-large">{skill.icon}</div>
                    <div className="skill-percentage-large">{skill.level}%</div>
                  </div>
                </div>
                <h3 className="skill-name-circular">{skill.name}</h3>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="tech-stack-hexagonal"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="tech-stack-title">Tools & Technologies</h3>
            <div className="hexagonal-grid">
              {techStack.map((tech, idx) => (
                <motion.div
                  key={tech}
                  className="hexagon-item magnetic"
                  initial={{ opacity: 0, scale: 0, rotate: 45 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.4 + idx * 0.08, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: 360,
                    zIndex: 10
                  }}
                  style={{
                    transition: "z-index 0s",
                  }}
                >
                  <div className="hexagon-content">
                    <span className="hexagon-text">{tech}</span>
                    <div className="hexagon-glow" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="section projects-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label">Portfolio</span>
            <h2 className="section-title">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="section-description">
              A collection of projects showcasing my expertise in full-stack development,
              backend microservices, cloud architecture, and machine learning
            </p>
          </motion.div>

          <div className="projects-grid">
            {projects.map((project, idx) => (
              <motion.div
                key={project.title}
                className="project-card magnetic"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, duration: 0.8, type: "spring" }}
                onHoverStart={() => setActiveProject(idx)}
                onHoverEnd={() => setActiveProject(null)}
                whileHover={{ y: -15 }}
              >
                <div className="project-image-wrapper">
                  <motion.img
                    src={project.img}
                    alt={project.title}
                    className="project-image"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="project-overlay" />
                  <AnimatePresence>
                    {activeProject === idx && (
                      <motion.div
                        className="project-hover-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.a
                          href={project.link}
                          className="project-link-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Project →
                        </motion.a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.desc}</p>
                  <div className="project-tech">
                    {project.tech.map((tech) => (
                      <span key={tech} className="project-tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <motion.div
            className="contact-wrapper"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="contact-content">
              <motion.div
                className="section-header"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="section-label">Get In Touch</span>
                <h2 className="section-title">
                  Let's Build Something
                  <br />
                  <span className="gradient-text">Amazing Together</span>
                </h2>
                <p className="section-description">
                  I'm always open to discussing new projects, creative ideas, or
                  opportunities to be part of your visions.
                </p>
              </motion.div>

              <motion.div
                className="contact-buttons"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {[
                  {
                    href: "mailto:ranithkumar04@gmail.com",
                    text: "Email Me",
                    icon: "✉️",
                    className: "contact-btn email-btn",
                  },
                  {
                    href: "tel:+919515630782",
                    text: "Call Me",
                    icon: "📞",
                    className: "contact-btn linkedin-btn",
                  },
                  {
                    href: "https://github.com",
                    text: "GitHub",
                    icon: "💻",
                    className: "contact-btn github-btn",
                  },
                ].map((link, idx) => (
                  <motion.a
                    key={link.text}
                    href={link.href}
                    className={`${link.className} magnetic`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="contact-btn-icon">{link.icon}</span>
                    {link.text}
                    <motion.span
                      className="contact-btn-arrow"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.footer
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} Ranith Kumar. All rights reserved.</p>
          <p className="footer-tagline">Built with passion and attention to detail</p>
        </div>
      </motion.footer>
    </main>
  );
}

