import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Instagram,
  Twitter,
  Github,
  Linkedin,
  StarFill
} from 'react-bootstrap-icons';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Home', path: '/home' },
      { name: 'Explore', path: '/feed' },
      { name: 'About Us', path: '/about' },
      { name: 'Moderation', path: '/moderation' }
    ],
    support: [
      { name: 'Help Center', path: '#' },
      { name: 'Safety Notice', path: '/safety' },
      { name: 'Community Guidelines', path: '#' },
      { name: 'Contact Us', path: '/about' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '#' }
    ]
  };

  return (
    <FooterWrapper>
      <Container>
        <TopSection>
          <BrandSection>
            <LogoArea as={Link} to="/">
              <LogoImg src={logo} alt="Liners Logo" />
              <LogoText>Liners</LogoText>
            </LogoArea>
            <MissionText>
              Connecting people through authentic conversations. Join the world's most vibrant community of creators and thinkers.
            </MissionText>
            <SocialLinks>
              <SocialIcon href="#" whileHover={{ y: -5, color: '#ec4899' }}><Instagram /></SocialIcon>
              <SocialIcon href="#" whileHover={{ y: -5, color: '#1da1f2' }}><Twitter /></SocialIcon>
              <SocialIcon href="#" whileHover={{ y: -5, color: '#6366f1' }}><Github /></SocialIcon>
              <SocialIcon href="#" whileHover={{ y: -5, color: '#0077b5' }}><Linkedin /></SocialIcon>
            </SocialLinks>
          </BrandSection>

          <LinksGrid>
            <LinkGroup>
              <GroupTitle>Platform</GroupTitle>
              {footerLinks.platform.map(link => (
                <FooterLink key={link.name} as={Link} to={link.path}>{link.name}</FooterLink>
              ))}
            </LinkGroup>
            <LinkGroup>
              <GroupTitle>Support</GroupTitle>
              {footerLinks.support.map(link => (
                <FooterLink key={link.name} as={Link} to={link.path}>{link.name}</FooterLink>
              ))}
            </LinkGroup>
            <LinkGroup>
              <GroupTitle>Legal</GroupTitle>
              {footerLinks.legal.map(link => (
                <FooterLink key={link.name} as={Link} to={link.path}>{link.name}</FooterLink>
              ))}
            </LinkGroup>
          </LinksGrid>
        </TopSection>

        <Divider />

        <BottomSection>
          <Copyright>© {currentYear} Liners. All rights reserved.</Copyright>
          <Signature>
            Made with <HeartIcon><StarFill size={10} /></HeartIcon> for the community
          </Signature>
        </BottomSection>
      </Container>
    </FooterWrapper>
  );
};

const FooterWrapper = styled.footer`
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 80px 0 30px;
  position: relative;
  overflow: hidden;
  z-index: 50;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 60px;
  margin-bottom: 60px;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const BrandSection = styled.div`
  flex: 1;
  max-width: 400px;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  margin-bottom: 24px;
`;

const LogoImg = styled.img`
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  padding: 4px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1) rotate(-5deg);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 12px 30px rgba(99, 102, 241, 0.3);
  }
`;

const LogoText = styled.span`
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  font-family: 'Poppins', sans-serif;
`;

const MissionText = styled.p`
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
  font-size: 15px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const SocialIcon = styled(motion.a)`
  color: #64748b;
  font-size: 20px;
  transition: color 0.3s ease;
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;

  @media (max-width: 1200px) {
    gap: 40px;
  }

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GroupTitle = styled.h4`
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
`;

const FooterLink = styled.div`
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #fff;
    transform: translateX(5px);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  margin-bottom: 30px;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
  font-size: 13px;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const Copyright = styled.div``;

const Signature = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeartIcon = styled.span`
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Footer;
