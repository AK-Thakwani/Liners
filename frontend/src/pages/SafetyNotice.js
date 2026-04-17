import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { ShieldCheck, EyeSlashFill, ExclamationTriangleFill, HandThumbsUpFill } from 'react-bootstrap-icons';

const SafetyNotice = () => {
  const guidelines = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Proactive Moderation",
      content: "Our AI-powered systems work 24/7 to identify and flag harmful content before it reaches your feed. Safety is baked into the platform."
    },
    {
      icon: <EyeSlashFill size={24} />,
      title: "You Are in Control",
      content: "Use our 'Hide' and 'Block' features to curate your experience. Your peace of mind is our top priority."
    },
    {
      icon: <ExclamationTriangleFill size={24} />,
      title: "Instant Reporting",
      content: "See something wrong? One-click reporting sends content directly to our human moderation team for urgent review."
    },
    {
      icon: <HandThumbsUpFill size={24} />,
      title: "Positive Community",
      content: "We encourage 'Liner' etiquette. Build others up, share authentic stories, and foster a healthy digital environment."
    }
  ];

  return (
    <PageWrapper>
    <div className="relative z-10 py-32">
    <Container>
      <HeaderSection>
        <Badge>Stay Safe</Badge>
        <Title>Safety <GradientText>Notice</GradientText></Title>
        <Subtitle>Building a secure space for authentic connection</Subtitle>
      </HeaderSection>

      <GuidelineGrid>
        {guidelines.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard>
              <IconCircle>{item.icon}</IconCircle>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.content}</p>
            </GlassCard>
          </motion.div>
        ))}
      </GuidelineGrid>

      <SafetyToolsSection>
        <h2 className="text-3xl font-black text-white mb-8 text-center">Safety Tools</h2>
        <ToolsGrid>
          <ToolItem>
            <div className="text-emerald-400 font-bold mb-2">Private Accounts</div>
            <p className="text-gray-500 text-sm">Control who sees your liners with our robust request system.</p>
          </ToolItem>
          <ToolItem>
            <div className="text-emerald-400 font-bold mb-2">Encrypted Messages</div>
            <p className="text-gray-500 text-sm">Your private conversations are protected and secure.</p>
          </ToolItem>
          <ToolItem>
            <div className="text-emerald-400 font-bold mb-2">AI Filters</div>
            <p className="text-gray-500 text-sm">Filter out sensitive words and offensive language automatically.</p>
          </ToolItem>
        </ToolsGrid>
      </SafetyToolsSection>
    </Container>
    </div>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
  overflow-x: hidden;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const Badge = styled.span`
  background: rgba(16, 185, 129, 0.1);
  color: #6ee7b7;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: inline-block;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 16px;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
`;

const GuidelineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 100px;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 28px;
  padding: 40px;
  height: 100%;
  border-bottom: 4px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 4px solid #10b981;
    transform: translateY(-5px);
  }
`;

const IconCircle = styled.div`
  width: 54px;
  height: 54px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  margin-bottom: 24px;
`;

const SafetyToolsSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  padding: 60px 40px;
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const ToolItem = styled.div`
  text-align: center;
`;

export default SafetyNotice;
