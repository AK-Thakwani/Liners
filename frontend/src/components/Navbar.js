import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import CreatePost from './CreatePost';
import Messaging from './Messaging';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  HouseFill,
  Grid3x3GapFill,
  EnvelopeFill,
  PlusCircleFill,
  PersonFill,
  CaretDownFill,
  ShieldFill,
  BoxArrowRight,
  Lightning,
  Star
} from 'react-bootstrap-icons';
import { UserContext } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { Dropdown, Image } from 'react-bootstrap';


const LinersNavbar = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  const { user } = useContext(UserContext);
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  let location = useLocation();

  const [lightingIndex, setLightingIndex] = useState(-1);
  const snakeTimers = useRef([]);

  useEffect(() => {
    setShowMessaging(false);
    setShowCreateModal(false);

    // Stop early if sequence exists
    snakeTimers.current.forEach(clearTimeout);
    snakeTimers.current = [];

    // Optimized 3D Welcome Snake Animation Logic
    const sequence = () => {
      const START_DELAY = 2200;
      const ITEM_DURATION = 1200;
      const itemDelays = [300, 1500, 2700, 3900, 5100, 6300, 7500];

      itemDelays.forEach((delay, index) => {
        const t1 = setTimeout(() => {
          setLightingIndex(index);
          const t2 = setTimeout(() => setLightingIndex(-1), ITEM_DURATION);
          snakeTimers.current.push(t2);
        }, START_DELAY + delay);
        snakeTimers.current.push(t1);
      });
    };

    sequence();

    return () => {
      snakeTimers.current.forEach(clearTimeout);
    };
  }, [location.pathname]);

  const currentUser = user
    ? {
      name: user.name,
      email: user.email,
      avatar: user.profilePicture || "https://placehold.co/40x40"
    }
    : {
      name: "Loading...",
      email: "",
      avatar: "https://placehold.co/40x40"
    };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const handleCloseMessaging = React.useCallback(() => setShowMessaging(false), []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navItems = React.useMemo(() => [
    { id: 'home', icon: HouseFill, label: 'Home', path: '/home' },
    { id: 'explore', icon: Grid3x3GapFill, label: 'Explore', path: '/feed' },
    { id: 'about', icon: Lightning, label: 'About', path: '/about' },
    {
      id: 'messages', icon: EnvelopeFill, label: 'Messages', action: () => {
        setShowMessaging(true);
        setActiveNav('messages');
      }
    },
    { id: 'profile', icon: PersonFill, label: 'Profile', path: '/profile' },
  ], [setShowMessaging, setActiveNav]);

  return (
    <>
      <NavbarWrapper>
        {/* Animated Background Orbs */}
        <BackgroundOrb1 />
        <BackgroundOrb2 />
        <BackgroundOrb3 />

        <NavContent>
          {/* Left: Logo Section with Animation */}
          <LogoSection as={Link} to="/">
            <LogoContainer
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <LogoGlowAura1 />
              <LogoGlowAura2 />
              <LogoImageWrapper>
                <LogoImage src={logo} alt="Liners" loading="eager" />
                <LogoInnerGlow />
                <LogoHighlightDrop />

                {/* Orbiting Spotlight Ball */}
                <LogoOrbitWrapper>
                  <OrbitingBall
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <BallIndicator />
                  </OrbitingBall>
                </LogoOrbitWrapper>
              </LogoImageWrapper>

              <LogoBadge
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
              >
                <Star size={10} fill="currentColor" />
              </LogoBadge>
            </LogoContainer>

            {/* 3D Snake Welcome Light Animation */}
            <SnakeLight
              initial={{ x: -100, opacity: 0 }}
              animate={{
                x: [-100, 1500], // Extended to reach the end of the Navbar
                y: [0, -40, 40, -40, 40, -40, 40, 0], // More undulating segments
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1.3, 1.3, 0.8],
                rotate: [0, 360 * 3]
              }}
              transition={{
                duration: 9, // Slower speed (increased from 6s for better visual flow)
                delay: 2,
                ease: "easeInOut",
                times: [0, 0.1, 0.9, 1]
              }}
            />
            <BrandInfo>
              <LogoText>Liners</LogoText>
              <SubtitleText>Connect & Share</SubtitleText>
            </BrandInfo>
          </LogoSection>

          {/* Center: Creative Navigation with Animated Cards */}
          <NavigationCenter>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeNav === item.id;

              const handleNavClick = () => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
                setActiveNav(item.id);
              };

              return item.action ? (
                <NavItemCard
                  key={item.id}
                  $isActive={isActive}
                  $isLightingUp={lightingIndex === navItems.indexOf(item)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNavClick}
                  type="button"
                >
                  <NavIconWrapper $isActive={isActive}>
                    <IconComponent size={20} />
                    {item.id === 'messages' && unreadCount > 0 && (
                      <MessageDot>{unreadCount}</MessageDot>
                    )}
                  </NavIconWrapper>
                  <NavLabel $isActive={isActive}>{item.label}</NavLabel>
                  {isActive && <ActiveIndicator layoutId="activeIndicator" />}
                </NavItemCard>
              ) : (
                <NavItemLink
                  key={item.id}
                  $isActive={isActive}
                  $isLightingUp={lightingIndex === navItems.indexOf(item)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  to={item.path}
                  onClick={handleNavClick}
                >
                  <NavIconWrapper $isActive={isActive}>
                    <IconComponent size={20} />
                    {item.id === 'messages' && unreadCount > 0 && (
                      <MessageDot>{unreadCount}</MessageDot>
                    )}
                  </NavIconWrapper>
                  <NavLabel $isActive={isActive}>{item.label}</NavLabel>
                  {isActive && <ActiveIndicator layoutId="activeIndicator" />}
                </NavItemLink>
              );
            })}
          </NavigationCenter>

          {/* Right: Premium Create Button + Profile */}
          <RightSection>
            <CreateButtonPremium
              onClick={handleShowCreateModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              $isLightingUp={lightingIndex === 5}
            >
              <PlusCircleFill size={20} />
              <CreateLabel>Create</CreateLabel>
            </CreateButtonPremium>

            <ProfileDropdown align="end" $isLightingUp={lightingIndex === 6}>
              <Dropdown.Toggle variant="light" id="dropdown-profile">
                <ProfileImageWrapper>
                  <ProfileImage src={currentUser.avatar} roundedCircle alt={currentUser.name} loading="eager" />
                  <OnlineDot />
                </ProfileImageWrapper>
                <ProfileInfo>
                  <ProfileName>{currentUser.name.split(' ')[0]}</ProfileName>
                  <ProfileStatus>Online</ProfileStatus>
                </ProfileInfo>
                <CaretDownFill size={12} />
              </Dropdown.Toggle>
              <Dropdown.Menu className="mt-3 shadow-lg border-0">
                <Dropdown.ItemText className="p-3 border-bottom border-white/10">
                  <ProfileNameFull className="text-white">{currentUser.name}</ProfileNameFull>
                  <ProfileEmailText>{currentUser.email}</ProfileEmailText>
                </Dropdown.ItemText>
                <Dropdown.Item as={Link} to="/profile">
                  <PersonFill className="me-2" size={16} style={{ color: '#6366f1' }} /> <span className="text-white/80">My Profile</span>
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/moderation">
                  <ShieldFill className="me-2" size={16} style={{ color: '#6366f1' }} /> <span className="text-white/80">Safety</span>
                </Dropdown.Item>
                <Dropdown.Divider className="border-white/10" />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <BoxArrowRight className="me-2" size={16} /> Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </ProfileDropdown>
          </RightSection>
        </NavContent>
      </NavbarWrapper>

      {/* Mobile Floating Bottom Navigation */}
      <MobileNavWrapper>
        <MobileNavContainer>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <MobileNavItemWrapper
                key={item.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
              >
                <MobileNavItem
                  as={item.action ? 'button' : Link}
                  to={item.action ? undefined : item.path}
                  onClick={() => {
                    if (item.action) item.action();
                    setActiveNav(item.id);
                  }}
                >
                  <IconComponent size={24} />
                  {item.id === 'messages' && unreadCount > 0 && (
                    <MobileMessageBadge>{unreadCount}</MobileMessageBadge>
                  )}
                </MobileNavItem>
              </MobileNavItemWrapper>
            );
          })}

          <MobileCreateButton
            onClick={handleShowCreateModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
          >
            <PlusCircleFill size={28} />
          </MobileCreateButton>

          <MobileProfileLink as={Link} to="/profile">
            <ProfileImage src={currentUser.avatar} roundedCircle alt={currentUser.name} style={{ width: '32px', height: '32px' }} />
          </MobileProfileLink>
        </MobileNavContainer>
      </MobileNavWrapper>

      {/* Modals */}
      <CreatePost show={showCreateModal} handleClose={handleCloseCreateModal} />
      <Messaging isOpen={showMessaging} onClose={handleCloseMessaging} />
    </>
  );
};

export default LinersNavbar;

// ===========================
// Creative Styled Components
// ===========================
const NavbarWrapper = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1050;
  background: rgba(0,0,0,0.40);
  backdrop-filter: blur(16px) saturate(1.5);
  box-shadow: 0 8px 32px 0 var(--color-blue), 0 0 0 1px var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 0;
  transition: background 0.3s, box-shadow 0.3s;
  overflow: visible;

  @media (max-width: 768px) {
    padding: 6px 0;
  }
`;

const BackgroundOrb1 = styled.div`
  position: absolute;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  top: -150px;
  left: -50px;
  filter: blur(40px);
  animation: float 10s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, 30px) scale(1.1); }
  }
`;

const BackgroundOrb2 = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  bottom: -100px;
  right: 15%;
  filter: blur(40px);
  animation: float 12s ease-in-out infinite reverse;
`;

const BackgroundOrb3 = styled.div`
  position: absolute;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  top: 50%;
  right: 25%;
  filter: blur(40px);
  animation: float 15s ease-in-out infinite;
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  position: relative;
  z-index: 10;
  overflow: visible;

  @media (max-width: 768px) {
    padding: 0 16px;
    height: 50px;
  }
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;
  min-width: fit-content;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoContainer = styled(motion.div)`
  position: relative;
`;

const LogoImageWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  padding: 6px;
  position: relative;
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  ${LogoSection}:hover & {
    transform: scale(1.1) rotate(5deg);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 
      0 20px 40px rgba(99, 102, 241, 0.4),
      0 0 30px rgba(99, 102, 241, 0.3);
  }
`;

const LogoHighlightDrop = styled.div`
  position: absolute;
  top: 0;
  left: -150%;
  width: 120%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 70%,
    transparent
  );
  filter: blur(4px);
  z-index: 4;
  animation: liquidShimmer 4s infinite cubic-bezier(0.4, 0, 0.2, 1);

  &::after {
    content: '';
    position: absolute;
    top: 20%;
    left: 45%;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 0 20px white;
    opacity: 0.8;
  }

  @keyframes liquidShimmer {
    0% { left: -150%; opacity: 0; }
    30% { opacity: 1; }
    70% { opacity: 1; }
    100% { left: 150%; opacity: 0; }
  }
`;

const LogoGlowAura1 = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%);
  filter: blur(20px);
  z-index: 1;
  animation: pulseAura1 4s infinite alternate;

  @keyframes pulseAura1 {
    0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
    100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.4); }
  }
`;

const LogoGlowAura2 = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%);
  filter: blur(15px);
  z-index: 2;
  animation: pulseAura2 3s infinite alternate-reverse;

  @keyframes pulseAura2 {
    0% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.9); }
  }
`;



const LogoOrbitWrapper = styled.div`
  position: absolute;
  inset: -15px;
  pointer-events: none;
  z-index: 5;
`;

const OrbitingBall = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 50%;
`;

const BallIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  margin-left: -5px;
  box-shadow: 
    0 0 15px #fff,
    0 0 30px #6366f1;
  filter: blur(0.5px);
`;

const SnakeLight = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1000;
  margin-top: -13px;
  
  /* High-performance 3D Sphere Effect */
  background: radial-gradient(circle at 35% 35%, 
    #ffffff 0%, 
    #c084fc 25%, 
    #6366f1 60%, 
    #312e81 100%
  );
  
  box-shadow: 
    0 0 15px rgba(168, 85, 247, 0.5),
    inset -3px -3px 8px rgba(0, 0, 0, 0.4),
    inset 3px 3px 6px rgba(255, 255, 255, 0.6);
  
  will-change: transform, opacity;

  @media (max-width: 768px) {
    display: none;
  }
`;





const LogoInnerGlow = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  box-shadow: inset 0 0 15px rgba(99, 102, 241, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;

  ${LogoSection}:hover & {
    opacity: 1;
  }
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LogoBadge = styled(motion.div)`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
  z-index: 2;
  border: 2px solid #0f172a;
`;

const LogoText = styled.span`
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  font-family: 'Poppins', sans-serif;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const SubtitleText = styled.span`
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  @media (max-width: 992px) {
    display: none;
  }
`;

const NavigationCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItemCard = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border: 1px solid ${props => props.$isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  color: ${props => props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  background: none;
  text-decoration: none;

  ${props => props.$isLightingUp && `
    box-shadow: 
      0 0 30px rgba(168, 85, 247, 0.6),
      0 0 60px rgba(99, 102, 241, 0.3),
      inset 0 0 15px rgba(168, 85, 247, 0.3);
    border-color: rgba(168, 85, 247, 0.8);
    background: rgba(168, 85, 247, 0.15);
    color: #fff;
    transform: translateY(-8px) scale(1.1);
    
    & div svg {
      filter: drop-shadow(0 0 8px #fff);
    }
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavItemLink = styled(motion.create(Link))`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 16px;
  cursor: pointer;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border: 1px solid ${props => props.$isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  color: ${props => props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  text-decoration: none;

  ${props => props.$isLightingUp && `
    box-shadow: 
      0 0 30px rgba(168, 85, 247, 0.6),
      0 0 60px rgba(99, 102, 241, 0.3),
      inset 0 0 15px rgba(168, 85, 247, 0.3);
    border-color: rgba(168, 85, 247, 0.8);
    background: rgba(168, 85, 247, 0.15);
    color: #fff;
    transform: translateY(-8px) scale(1.1);
    
    & div svg {
      filter: drop-shadow(0 0 8px #fff);
    }
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const NavIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  position: relative;
  color: inherit;
`;

const MessageDot = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
`;

const NavLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  transition: color 0.4s ease;
  letter-spacing: 0.5px;
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  bottom: -4px;
  width: 30%;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #ec4899);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: flex-end;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const CreateButtonPremium = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 
    0 10px 25px rgba(99, 102, 241, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;

  ${props => props.$isLightingUp && `
    box-shadow: 
      0 0 40px rgba(168, 85, 247, 0.8),
      0 0 80px rgba(99, 102, 241, 0.4);
    transform: scale(1.15) translateY(-5px);
    background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
    color: #312e81;
  `}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 15px 35px rgba(99, 102, 241, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &::before {
      transform: translateX(100%);
    }
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 12px;

    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }

  @media (max-width: 480px) {
    padding: 10px;
    gap: 0;

    span {
      display: none;
    }
  }
`;

const CreateLabel = styled.span``;

const ProfileDropdown = styled(Dropdown)`
  position: relative;
  z-index: 1001;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  ${props => props.$isLightingUp && `
    transform: scale(1.1) translateY(-5px);
    
    .dropdown-toggle {
      background: rgba(168, 85, 247, 0.2) !important;
      box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
    }
    
    img {
      box-shadow: 0 0 20px #fff !important;
    }
  `}

  .dropdown-toggle {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    background: transparent !important;
    border: none !important;
    padding: 8px 12px !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;

    &:hover {
      background: rgba(99, 102, 241, 0.08) !important;
    }

    &::after {
      display: none !important;
    }

    &:focus {
      box-shadow: none !important;
      outline: none !important;
    }
  }

  .dropdown-menu {
    position: absolute !important;
    right: 0 !important;
    top: calc(100% + 10px) !important;
    z-index: 1002 !important;
    background: rgba(15, 23, 42, 0.9) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 
      0 20px 50px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
    border-radius: 18px !important;
    padding: 10px 0 !important;
    min-width: 280px !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: translateY(0) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &.show {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .dropdown-item {
      border-radius: 10px !important;
      transition: all 0.2s ease !important;
      margin: 4px 10px !important;
      padding: 10px 16px !important;
      border: none !important;
      cursor: pointer !important;
      color: rgba(255, 255, 255, 0.8) !important;
      background: transparent !important;

      &:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #fff !important;
      }

      &:focus {
        background: rgba(255, 255, 255, 0.08) !important;
      }
    }
  }
`;


const ProfileImageWrapper = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.08);
  }
`;

const OnlineDot = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  border: 3px solid white;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: onlinePulse 2s infinite;

  @keyframes onlinePulse {
    0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
    50% { box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); }
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 992px) {
    display: none;
  }
`;

const ProfileName = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: #fff;
`;

const ProfileStatus = styled.span`
  font-size: 10px;
  color: #94a3b8;
  font-weight: 500;
`;

const ProfileNameFull = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  margin-bottom: 2px;
`;

const ProfileEmailText = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

// Mobile Navigation
const MobileNavWrapper = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(30px) saturate(1.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  z-index: 998;
  padding-bottom: env(safe-area-inset-bottom);

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 75px;
    padding: 8px 16px;
  }
`;

const MobileNavContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
`;

const MobileNavItemWrapper = styled(motion.div)`
  display: flex;
  gap: 8px;
`;

const MobileNavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  cursor: pointer;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: relative;

  &:active {
    background: rgba(255, 255, 255, 0.08);
    color: #6366f1;
  }
`;

const MobileCreateButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 
    0 10px 30px rgba(99, 102, 241, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin-top: -15px;
`;

const MobileProfileLink = styled(Link)`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  text-decoration: none;
`;

const MobileMessageBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
`;
