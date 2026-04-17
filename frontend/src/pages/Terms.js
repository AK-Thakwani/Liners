import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { ShieldCheck, FileText, JournalCheck, Lock } from 'react-bootstrap-icons';

const Terms = () => {
  const sections = [
    {
      icon: <ShieldCheck size={24} />,
      title: "1. Acceptance of Terms",
      content: "By accessing or using Liners, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services."
    },
    {
      icon: <FileText size={24} />,
      title: "2. User Conduct",
      content: "You are responsible for all content you post. Prohibited conduct includes harassment, spamming, and posting illegal or harmful content."
    },
    {
      icon: <JournalCheck size={24} />,
      title: "3. Intellectual Property",
      content: "Liners and its original content, features, and functionality are owned by us and are protected by international copyright and trademark laws."
    },
    {
      icon: <Lock size={24} />,
      title: "4. Privacy & Data",
      content: "Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information."
    }
  ];

  return (
    <PageWrapper>
      <div className="relative z-10 py-32">
        <Container>
          <HeaderSection>
            <Badge>Legal</Badge>
            <Title>Terms of <GradientText>Service</GradientText></Title>
            <LastUpdated>Last Updated: January 30, 2026</LastUpdated>
          </HeaderSection>

          <ContentGrid>
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SectionCard>
                  <IconBox>{section.icon}</IconBox>
                  <SectionTitle>{section.title}</SectionTitle>
                  <SectionContent>{section.content}</SectionContent>
                </SectionCard>
              </motion.div>
            ))}
          </ContentGrid>

          <FooterNotice>
            <p>If you have any questions about these Terms, please contact our legal team at <strong>legal@liners.com</strong></p>
          </FooterNotice>
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
  margin-bottom: 80px;
`;

const Badge = styled.span`
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
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
  font-size: 4rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 12px;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LastUpdated = styled.p`
  color: #64748b;
  font-size: 14px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
`;

const SectionCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 32px;
  padding: 40px;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-5px);
    border-color: rgba(99, 102, 241, 0.3);
  }
`;

const IconBox = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
`;

const SectionContent = styled.p`
  color: #94a3b8;
  line-height: 1.6;
  font-size: 15px;
`;

const FooterNotice = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 14px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

export default Terms;
