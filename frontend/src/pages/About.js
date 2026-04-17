import React, { useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Container, Row, Col } from 'react-bootstrap';
import {
  LightningChargeFill,
  ShieldLockFill,
  RocketTakeoffFill,
  ChatRightHeartFill,
  EnvelopeFill,
  Github,
  Download,
  PatchCheckFill,
  CarFrontFill,
  Bank,
  HouseDoorFill,
  CartFill
} from 'react-bootstrap-icons';
import cvPDF from '../assets/Akshay_kumar(CV).pdf';
import myPic from '../assets/mypic.jpeg';

// ...removed duplicate GlobalFonts declaration...

const About = () => {
  const containerRef = useRef(null);
  const galleryContainerRef = useRef(null);
  const heroRef = useRef(null);
  const [galleryScrollX, setGalleryScrollX] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Handle gallery scroll on page scroll
  const handleScroll = () => {
    if (!galleryContainerRef.current) return;

    const galleryElement = galleryContainerRef.current;
    const galleryRect = galleryElement.getBoundingClientRect();
    const galleryHeight = galleryElement.offsetHeight;
    const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - galleryRect.top) / (window.innerHeight + galleryHeight)));
    
    const totalDistance = (galleryItems.length - 1) * (GALLERY_ITEM_WIDTH + GALLERY_GAP);
    setGalleryScrollX(-totalDistance * scrollProgress);
  };

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const galleryX = galleryScrollX;

  const handleMouseMove = (e) => {
  };

  // Parallax Transforms for Section 2
  const nameY = useTransform(scrollYProgress, [0.2, 0.4], [100, -100]);
  const bgTextY = useTransform(scrollYProgress, [0.2, 0.4], [0, 200]);
  const imageScale = useTransform(scrollYProgress, [0.2, 0.35], [0.8, 1.1]);
  const imageRotate = useTransform(scrollYProgress, [0.2, 0.35], [-5, 0]);
  const imageOpacity = useTransform(scrollYProgress, [0.2, 0.3, 0.45], [0, 1, 0.8]);

  const linersIdea = [
    {
      title: "Authentic Pulse",
      desc: "Liners redefines social dynamics by prioritizing raw human connection over engagement metrics.",
      icon: <ChatRightHeartFill />,
      gradient: "linear-gradient(135deg, #00d2ff 0%, #92fe9d 100%)"
    },
    {
      title: "Ironbound Security",
      desc: "State-of-the-art encryption protocols ensuring your digital footprint remains yours alone.",
      icon: <ShieldLockFill />,
      gradient: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)"
    },
    {
      title: "Kinetic Engine",
      desc: "A high-frequency reactive architecture that responds to your every social beat instantly.",
      icon: <LightningChargeFill />,
      gradient: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)"
    },
    {
      title: "Vanguard Tech",
      desc: "A scalable MERN masterpiece crafted for the next generation of digital nomads.",
      icon: <RocketTakeoffFill />,
      gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: -200 },
    show: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 120,
        damping: 12,
        mass: 1
      }
    })
  };

  const cvData = {
    education: {
      degree: "BS in Computer Science",
      university: "FAST National University",
      period: "2022 – 2026",
      desc: "Specializing in Distributed Systems & AI. Maintaining high academic standing and technical excellence."
    },
    experience: [
      {
        company: "Noble Navigators",
        role: "Lead Intern – Dev Ops",
        period: "June 2025 – August 2025"
      },
      {
        company: "Deloitte",
        role: "Insight Fellow",
        period: "May 2025 – June 2025"
      }
    ],
    skills: ["React (Mastery)", "Node.js", "Express", "NoSQL", "System Architecture", "Python Core", "Next.js 14", "Real-time IO"]
  };

  return (
    <PageWrapper ref={containerRef}>
      <GlobalFonts />

      {/* Stage 1: The Core Vision */}
      <CoreSection>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <header className="text-center mb-32">
                <FloatingLabel>Stage 01 // The Architecture</FloatingLabel>
                <MainTitle>
                  Decoding <GradientText>Liners</GradientText>
                </MainTitle>
                <SubTitle>The intersection of engineering precision and social intuition.</SubTitle>
              </header>

              <VisualGrid onMouseMove={handleMouseMove}>
                {linersIdea.map((item, i) => (
                  <MagneticOrb
                    key={i}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <OrbIcon style={{ background: item.gradient }}>{item.icon}</OrbIcon>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <OrbGlow style={{ background: item.gradient }} />
                  </MagneticOrb>
                ))}
              </VisualGrid>
            </Col>
          </Row>
        </Container>
      </CoreSection>

      {/* Stage 2: The Founder (Layered 3D Parallax) */}
      <IdentitySection ref={heroRef}>
        <ParallaxContainer>
          <BgText style={{ y: bgTextY }}>AKSHAY</BgText>

          <BlobFrame
            style={{ scale: imageScale, rotate: imageRotate, opacity: imageOpacity }}
          >
            <div className="blob-bg" />
            <img src={myPic} alt="Akshay Kumar" loading="eager" />
            <GlassOverlay />
          </BlobFrame>

          <ForegroundLabel style={{ y: nameY }}>
            <motion.h2>Akshay Kumar</motion.h2>
            <div className="role-chip">Lead Developer & Architect</div>
          </ForegroundLabel>
        </ParallaxContainer>
      </IdentitySection>

      {/* Stage 3: Professional Portfolio Stickers */}
      <StickerSection>
        <Container>
          <header className="mb-24">
            <FloatingLabel>Stage 03 // The Pedigree</FloatingLabel>
            <SectionHeadline>Technical <GradientText>Arsenal</GradientText></SectionHeadline>
          </header>

          <Row className="g-5">
            <Col lg={7}>
              <AcrylicSticker
                whileHover={{ rotateY: -3, rotateX: 3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                $holographic
              >
                <HoloShimmer />
                <CertificationBadge>
                  <PatchCheckFill /> FAST CERTIFIED
                </CertificationBadge>
                <StickerPeel />
                <header className="flex items-center gap-4 mb-8">
                  <div className="status-dot green" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Academic Records</h3>
                </header>
                <div className="content">
                  <h4 className="text-3xl font-bold text-white mb-2">{cvData.education.degree}</h4>
                  <p className="text-indigo-400 font-black text-lg mb-4">{cvData.education.university}</p>
                  <p className="text-gray-400 leading-relaxed text-lg">{cvData.education.desc}</p>
                  <div className="mt-8 flex gap-4">
                    <MetaBadge>Class of 2026</MetaBadge>
                    <MetaBadge $outline>Verified Fastian</MetaBadge>
                  </div>
                </div>
              </AcrylicSticker>
            </Col>

            <Col lg={5}>
              <AcrylicSticker accent="#ec4899" $holographic>
                <HoloShimmer />
                <StickerPeel color="#ec4899" />
                <header className="flex items-center gap-4 mb-8">
                  <div className="status-dot magenta" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Career Loop</h3>
                </header>
                <div className="space-y-8">
                  {cvData.experience.map((exp, i) => (
                    <div key={i} className="experience-item">
                      <h4 className="text-white font-bold text-xl">{exp.role}</h4>
                      <p className="text-pink-400 font-bold">{exp.company}</p>
                      <div className="time-line">{exp.period}</div>
                    </div>
                  ))}
                </div>
              </AcrylicSticker>
            </Col>

            <Col md={12}>
              <Row className="g-4">
                <Col md={8}>
                  <ControlSticker>
                    <h3 className="text-white font-black text-xl mb-8 uppercase letter-spacing-2">Skill Matrix</h3>
                    <div className="skill-cloud">
                      {cvData.skills.map(skill => (
                        <MatrixTag key={skill} whileHover={{ scale: 1.1, backgroundColor: "#6366f1" }}>
                          {skill}
                        </MatrixTag>
                      ))}
                    </div>
                  </ControlSticker>
                </Col>
                <Col md={4}>
                  <ControlSticker className="text-center">
                    <h3 className="text-white font-black text-xl mb-8 uppercase letter-spacing-2">Comm Channels</h3>
                    <div className="action-grid">
                      <ActionButton href="mailto:kumaakshay976@gmail.com" className="primary">
                        <EnvelopeFill /> Direct Mail
                      </ActionButton>
                      <ActionButton href={cvPDF} download>
                        <Download /> GET RESUME PDF
                      </ActionButton>
                      <ActionButton href="https://github.com/AK-Thakwani" target="_blank">
                        <Github /> CODEBASE
                      </ActionButton>
                    </div>
                  </ControlSticker>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </StickerSection>

      {/* Stage 3.5: Horizontal Scroll Gallery */}
      <ScrollGallerySection>
        <IntroSection>
          <h1>Featured Projects</h1>
        </IntroSection>

        <motion.div
          className="w-full py-8 custom-scroll-hide"
          ref={galleryContainerRef}
          style={{ x: galleryX }}
        >
          <div className="flex flex-nowrap gap-8 px-8" style={{ minHeight: '420px' }}>
            {/* All Projects Cards - vibrant gradients, rotated */}
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 min-w-[340px] max-w-[380px] mx-2 transform rotate-6 hover:rotate-2 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group animate-border-gradient" style={{borderImage: 'linear-gradient(120deg, #00fff7, #a259ff, #00fff7) 1'}}>
              {/* Animated shimmer */}
              <span className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-2xl shimmer" />
              {/* Floating icon */}
              <span className="absolute -top-6 -left-6 z-20 bg-cyan-400 shadow-lg rounded-full p-3 animate-float">
                <LightningChargeFill size={28} className="text-white" />
              </span>
              {/* Glowing accent */}
              <span className="absolute bottom-2 right-2 w-6 h-6 bg-cyan-300 rounded-full blur-xl opacity-60 z-10" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{background: 'linear-gradient(120deg, rgba(0,255,255,0.12) 0%, rgba(128,0,255,0.10) 100%)', boxShadow: '0 4px 32px 0 rgba(0,255,255,0.08)'}}></div>
              <img src="https://raw.githubusercontent.com/AK-Thakwani/liners/main/assets/logo.png" alt="Liners Logo" className="w-24 h-24 rounded-xl mb-4 border-2 border-cyan-200 shadow-md" />
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow">Liners – Social Media Platform</h2>
              <ul className="text-base text-white/90 mb-4 list-disc pl-5 text-left">
                <li>Built a full-stack social media platform with real-time chat, encrypted messaging, media uploads, and notifications.</li>
                <li>Designed scalable architecture using Node.js, Express.js, MongoDB, and React.js.</li>
              </ul>
              <a href="https://github.com/AK-Thakwani/liners" target="_blank" rel="noopener noreferrer" className="btn btn-primary bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 transition">
                <Github className="me-2" /> View on GitHub
              </a>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 min-w-[340px] max-w-[380px] mx-2 transform -rotate-6 hover:-rotate-2 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group animate-border-gradient" style={{borderImage: 'linear-gradient(120deg, #4fd1c5, #6366f1, #4fd1c5) 1'}}>
              <span className="absolute -top-6 -left-6 z-20 bg-blue-400 shadow-lg rounded-full p-3 animate-float">
                <CarFrontFill size={28} className="text-white" />
              </span>
              <span className="absolute bottom-2 right-2 w-6 h-6 bg-blue-300 rounded-full blur-xl opacity-60 z-10" />
              <span className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-2xl shimmer" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{background: 'linear-gradient(120deg, rgba(0,255,255,0.10) 0%, rgba(0,128,255,0.10) 100%)', boxShadow: '0 4px 32px 0 rgba(0,128,255,0.08)'}}></div>
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow">Car Rental Management System</h2>
              <ul className="text-base text-white/90 mb-4 list-disc pl-5 text-left">
                <li>Developed a web-based rental system with booking, admin dashboard, and user authentication.</li>
                <li>Tools: React.js (frontend), Python (backend), MySQL (database)</li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 min-w-[340px] max-w-[380px] mx-2 transform rotate-6 hover:rotate-2 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group animate-border-gradient" style={{borderImage: 'linear-gradient(120deg, #a259ff, #00fff7, #a259ff) 1'}}>
              <span className="absolute -top-6 -left-6 z-20 bg-purple-400 shadow-lg rounded-full p-3 animate-float">
                <Bank size={28} className="text-white" />
              </span>
              <span className="absolute bottom-2 right-2 w-6 h-6 bg-purple-300 rounded-full blur-xl opacity-60 z-10" />
              <span className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-2xl shimmer" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{background: 'linear-gradient(120deg, rgba(128,0,255,0.10) 0%, rgba(0,255,255,0.10) 100%)', boxShadow: '0 4px 32px 0 rgba(128,0,255,0.08)'}}></div>
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow">Bank Management System – OOP Project</h2>
              <ul className="text-base text-white/90 mb-4 list-disc pl-5 text-left">
                <li>Simulated banking operations using all four OOP pillars: abstraction, encapsulation, inheritance, and polymorphism.</li>
                <li>CLI-based account management with file handling in C++.</li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 min-w-[340px] max-w-[380px] mx-2 transform -rotate-6 hover:-rotate-2 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group animate-border-gradient" style={{borderImage: 'linear-gradient(120deg, #00fff7, #a259ff, #00fff7) 1'}}>
              <span className="absolute -top-6 -left-6 z-20 bg-cyan-400 shadow-lg rounded-full p-3 animate-float">
                <HouseDoorFill size={28} className="text-white" />
              </span>
              <span className="absolute bottom-2 right-2 w-6 h-6 bg-cyan-300 rounded-full blur-xl opacity-60 z-10" />
              <span className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-2xl shimmer" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{background: 'linear-gradient(120deg, rgba(0,255,255,0.10) 0%, rgba(128,0,255,0.10) 100%)', boxShadow: '0 4px 32px 0 rgba(0,255,255,0.08)'}}></div>
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow">Hotel Management System – File-Based C Project</h2>
              <ul className="text-base text-white/90 mb-4 list-disc pl-5 text-left">
                <li>Designed a reservation and billing system using file I/O in C.</li>
                <li>Integrated a voice-command welcome (Text-to-Speech) for an ATM-like interactive experience.</li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 min-w-[340px] max-w-[380px] mx-2 transform rotate-6 hover:rotate-2 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group animate-border-gradient" style={{borderImage: 'linear-gradient(120deg, #6366f1, #4fd1c5, #6366f1) 1'}}>
              <span className="absolute -top-6 -left-6 z-20 bg-blue-400 shadow-lg rounded-full p-3 animate-float">
                <CartFill size={28} className="text-white" />
              </span>
              <span className="absolute bottom-2 right-2 w-6 h-6 bg-blue-300 rounded-full blur-xl opacity-60 z-10" />
              <span className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-2xl shimmer" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{background: 'linear-gradient(120deg, rgba(0,128,255,0.10) 0%, rgba(0,255,255,0.10) 100%)', boxShadow: '0 4px 32px 0 rgba(0,128,255,0.08)'}}></div>
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow">Ice Cream Shop – OS Simulation Project</h2>
              <ul className="text-base text-white/90 mb-4 list-disc pl-5 text-left">
                <li>Simulated a multi-threaded order system using POSIX threads in C.</li>
                <li>Applied CPU scheduling, concurrency, and synchronization concepts.</li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border-2 min-w-[340px] max-w-[380px] mx-2 transform -rotate-6 hover:-rotate-2 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group animate-border-gradient" style={{borderImage: 'linear-gradient(120deg, #a259ff, #00fff7, #a259ff) 1'}}>
              <span className="absolute -top-6 -left-6 z-20 bg-purple-400 shadow-lg rounded-full p-3 animate-float">
                <Bank size={28} className="text-white" />
              </span>
              <span className="absolute bottom-2 right-2 w-6 h-6 bg-purple-300 rounded-full blur-xl opacity-60 z-10" />
              <span className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none rounded-2xl shimmer" />
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{background: 'linear-gradient(120deg, rgba(128,0,255,0.10) 0%, rgba(0,255,255,0.10) 100%)', boxShadow: '0 4px 32px 0 rgba(128,0,255,0.08)'}}></div>
              {/* Patch GlobalFonts to include shimmer/float */}
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow">Shopping Cart Management System – DSA Project</h2>
              <ul className="text-base text-white/90 mb-4 list-disc pl-5 text-left">
                <li>Developed a command-line shopping portal with dynamic cart logic, sorting algorithms, and admin controls.</li>
                <li>Implemented core data structures: Linked List, Stack, and Vector with price-based Bubble Sort.</li>
                <li>Tools Concepts: C++, Linked list, stack, vector, sorting algorithms</li>
              </ul>
            </div>
        </div>
        </motion.div>

        <OutroSection>
          <p>See All Projects</p>
        </OutroSection>
      </ScrollGallerySection>

      <FooterSpacer />
    </PageWrapper>
  );
};

// ===========================
// Hide Scrollbar Utility
// ===========================

const customScrollHide = `
  .custom-scroll-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .custom-scroll-hide::-webkit-scrollbar {
    display: none;
  }
`;

// 1. Define the missing variable here
const shimmerKeyframes = keyframes`
  0% { opacity: 0.2; transform: translateX(-100%) skewX(-12deg); }
  60% { opacity: 0.5; }
  100% { opacity: 0.2; transform: translateX(100%) skewX(-12deg); }
`;

const floatKeyframes = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// 2. Now use it inside createGlobalStyle
const GlobalFonts = createGlobalStyle`
  ${customScrollHide}
  
  /* Use the variables we defined above */
  .shimmer {
    background: linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.12) 100%);
    animation: ${shimmerKeyframes} 2.5s infinite linear;
    mix-blend-mode: lighten;
    position: absolute;
    inset: 0;
  }

  .animate-float { 
    animation: ${floatKeyframes} 2.5s infinite ease-in-out; 
  }

  .animate-border-gradient {
    border-width: 2px;
    border-style: solid;
    border-radius: 1rem;
    border-image-slice: 1;
  }

  body {
    font-family: 'Inter', sans-serif;
    background: #020617;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Outfit', sans-serif;
  }
`;

const PageWrapper = styled.div`
  background: transparent;
  color: #fff;
  overflow-x: hidden;
  position: relative;
`;

const CoreSection = styled.section`
  padding: 180px 0;
  position: relative;
  z-index: 2;
`;

const FloatingLabel = styled.span`
  display: inline-block;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  color: #6366f1;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 30px;
`;

const MainTitle = styled.h1`
  font-size: 6rem;
  font-weight: 900;
  letter-spacing: -3px;
  line-height: 0.9;
  margin-bottom: 20px;
  
  @media (max-width: 768px) { font-size: 3.5rem; }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubTitle = styled.p`
  font-size: 1.5rem;
  color: #94a3b8;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 300;
`;

const VisualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 100px;
`;

const GlassOrb = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(30px);
  border-radius: 40px;
  padding: 50px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 0 20px rgba(255, 255, 255, 0.05),
    0 20px 50px rgba(0, 0, 0, 0.3);
  
  h3 { font-size: 1.6rem; font-weight: 900; margin-bottom: 15px; color: #fff; letter-spacing: -1px; }
  p { color: #94a3b8; line-height: 1.6; font-size: 1.05rem; font-weight: 500; }
`;

const MagneticOrb = ({ children, ...props }) => {
  return (
    <GlassOrb {...props}>
      {children}
    </GlassOrb>
  );
};

const OrbIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

const OrbGlow = styled.div`
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  filter: blur(80px);
  opacity: 0.1;
  z-index: -1;
`;

const IdentitySection = styled.section`
  height: 120vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
`;

const ParallaxContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const BgText = styled(motion.h2)`
  position: absolute;
  font-size: 30rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.02);
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
  letter-spacing: -1rem;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.05), transparent);
`;

const BlobFrame = styled(motion.div)`
  width: 550px;
  height: 650px;
  position: relative;
  z-index: 2;
  clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
  overflow: hidden;
  box-shadow: 0 50px 100px rgba(0,0,0,0.7);
  background: rgba(15, 23, 42, 0.8);
  
  .blob-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #6366f1, #ec4899);
    opacity: 0.1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(20%) brightness(0.9) contrast(1.1);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover img { 
    filter: grayscale(0%) brightness(1.1);
    transform: scale(1.05);
  }

  @media (max-width: 768px) { 
    width: 320px; 
    height: 400px; 
    clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
  }
`;

const GlassOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%, rgba(0,0,0,0.4));
  pointer-events: none;
  border: 1px solid rgba(255,255,255,0.1);
`;

const ForegroundLabel = styled(motion.div)`
  position: absolute;
  bottom: 15%;
  z-index: 3;
  text-align: center;
  
  h2 {
    font-size: 8.5rem;
    font-weight: 950;
    color: #fff;
    margin: 0;
    letter-spacing: -5px;
    text-shadow: 0 10px 50px rgba(0,0,0,0.8);
    
    @media (max-width: 992px) { font-size: 4rem; }
  }

  .role-chip {
    display: inline-block;
    padding: 10px 25px;
    background: #6366f1;
    color: #fff;
    font-weight: 900;
    font-size: 1.2rem;
    border-radius: 10px;
    margin-top: -10px;
    transform: rotate(-2deg);
    box-shadow: 10px 10px 30px rgba(0,0,0,0.5);
  }
`;

const StickerSection = styled.section`
  padding: 150px 0;
  position: relative;
  z-index: 4;
`;

const SectionHeadline = styled.h2`
  font-size: 4.5rem;
  font-weight: 900;
  letter-spacing: -3px;
  color: #fff;
`;

const AcrylicSticker = styled(motion.div)`
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(50px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 60px;
  height: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 0 30px rgba(255, 255, 255, 0.05),
    0 40px 100px rgba(0, 0, 0, 0.6);
  
  ${props => props.$holographic && `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.05) 100%
      );
      pointer-events: none;
      z-index: 2;
    }
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 6px;
    background: ${props => props.accent || 'linear-gradient(90deg, #6366f1, #8b5cf6)'};
    z-index: 10;
  }
`;

const holoAnim = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
`;

const HoloShimmer = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05) 45%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.05) 55%,
    transparent
  );
  z-index: 1;
  animation: ${holoAnim} 8s infinite linear;
  pointer-events: none;
`;

const CertificationBadge = styled.div`
  position: absolute;
  top: 40px;
  right: 40px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 8px 15px;
  border-radius: 12px;
  color: #818cf8;
  font-weight: 950;
  font-size: 0.8rem;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  z-index: 5;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
`;

const StickerPeel = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(45deg);
  box-shadow: inset -5px -5px 15px rgba(0,0,0,0.3);
`;

const MetaBadge = styled.span`
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  ${props => props.$outline ? `
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  ` : `
    background: #6366f1;
    color: #fff;
  `}
`;

const ControlSticker = styled(AcrylicSticker)`
  padding: 40px;
  min-height: 300px;
`;

const MatrixTag = styled(motion.span)`
  display: inline-block;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  font-weight: 800;
  color: #fff;
  margin: 6px;
  cursor: default;
`;

const ActionButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 100%;
  padding: 20px;
  border-radius: 15px;
  font-weight: 900;
  text-decoration: none;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  color: #fff;

  &:hover {
    background: #fff;
    color: #020617;
    transform: translateY(-5px);
  }

  &.primary {
    background: #6366f1;
    border-color: #6366f1;
    &:hover { background: #818cf8; color: #fff; }
  }
`;

const FooterSpacer = styled.div` height: 200px; `;

// Gallery Styled Components
const ScrollGallerySection = styled.div`
  width: 100%;
  background: transparent;
  overflow: visible;
`;

const IntroSection = styled.section`
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  padding-bottom: 40px;

  h1 {
    font-size: clamp(36px, 8vw, 72px);
    color: #f5f5f5;
    margin: 0;
    text-transform: uppercase;
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    letter-spacing: -2px;
  }
`;

const OutroSection = styled.section`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    font-size: clamp(48px, 10vw, 96px);
    color: #f5f5f5;
    margin: 0;
    text-transform: uppercase;
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    letter-spacing: -2px;
  }
`;

// Gallery Data & Constants
const galleryItems = [
  { id: 1, color: "#ff0088", label: "Liners Platform", desc: "Social networking with real-time messaging" },
  { id: 2, color: "#dd00ee", label: "E-Commerce Hub", desc: "Full-stack marketplace with payment integration" },
  { id: 3, color: "#9911ff", label: "Analytics Dashboard", desc: "Real-time data visualization and insights" },
  { id: 4, color: "#0d63f8", label: "Mobile App", desc: "Cross-platform React Native application" },
  { id: 5, color: "#0cdcf7", label: "Cloud Services", desc: "Scalable backend infrastructure" },
];

const GALLERY_ITEM_WIDTH = 400;
const GALLERY_GAP = 30;

export default About;
