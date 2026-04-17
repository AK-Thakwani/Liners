import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const WelcomeMessage = ({ isVisible, onComplete }) => {
    if (!isVisible) return null;

    return (
        <WelcomeOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={onComplete}
        >
            <WelcomeContent
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            >
                <SharinganIcon>👁️</SharinganIcon>
                <WelcomeText
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    Welcome to <GradientText>Liners</GradientText>
                </WelcomeText>
                <SubText
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                >
                    Witness the power of connection...
                </SubText>
            </WelcomeContent>
        </WelcomeOverlay>
    );
};

const WelcomeOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
`;

const WelcomeContent = styled(motion.div)`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const sharinganSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SharinganIcon = styled.div`
  font-size: 5rem;
  animation: ${sharinganSpin} 3s linear infinite;
  filter: drop-shadow(0 0 30px rgba(255, 50, 0, 0.8));
`;

const WelcomeText = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -2px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #ff6400 0%, #ff3200 50%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: ${keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  `} 3s ease infinite;
`;

const SubText = styled(motion.p)`
  font-size: 1.5rem;
  color: #94a3b8;
  font-weight: 500;
  font-style: italic;
  margin: 0;
`;

export default WelcomeMessage;
