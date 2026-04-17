import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [animatedChars, setAnimatedChars] = useState([]);
  const fullText = 'Connect. Share. Inspire.';
  const isSignedIn = localStorage.getItem("token") !== null;



  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [testimonialsRef, testimonialsInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [carouselRef, carouselInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Letter-by-letter animation
  useEffect(() => {
    const chars = fullText.split('');
    let index = 0;
    const timer = setInterval(() => {
      if (index <= chars.length) {
        setAnimatedChars(chars.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_POSTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handler for switching to feed/dashboard view
  // Handler for switching to feed/dashboard view
  const handleGoToFeed = () => {
    navigate('/feed');
  };

  return (
    <PageWrapper>
      <FloatingOrbs />

      {/* Enhanced Hero Section */}
      <ContentContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroSection>

          <Title
            initial={{ opacity: 0, letterSpacing: '-10px', filter: 'blur(20px)' }}
            animate={{ opacity: 1, letterSpacing: '-3px', filter: 'blur(0px)' }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {animatedChars.join('')}
            <Cursor>|</Cursor>
          </Title>

          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            Experience the next generation of social interaction. Beautiful, fast, and secure.
          </Subtitle>

          <ButtonGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <PrimaryButton
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 50px rgba(99, 102, 241, 0.6)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={isSignedIn ? handleGoToFeed : () => navigate('/login')}
            >
              🚀 {isSignedIn ? 'Go to Feed' : 'Get Started'}
            </PrimaryButton>
            <SecondaryButton
              whileHover={{
                scale: 1.05,
                borderColor: '#6366f1',
                color: '#fff',
                background: 'rgba(99, 102, 241, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
            >
              Learn More
            </SecondaryButton>
          </ButtonGroup>
        </HeroSection>
      </ContentContainer>

      {/* Live Preview Widget: 3 most recent Liners */}
      <Section>
        <SectionTitle>
          Live Preview
        </SectionTitle>
        <CarouselContainer>
          {CAROUSEL_POSTS.slice(0, 3).map((post, idx) => (
            <CarouselSlide
              key={idx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'block' }}
            >
              <PostPreviewCard>
                <PostHeader>
                  <UserAvatar>{post.user[0]}</UserAvatar>
                  <div>
                    <UserName>{post.user}</UserName>
                    <PostTime>{post.time}</PostTime>
                  </div>
                </PostHeader>
                <PostContent>{post.content}</PostContent>
                {post.image && (
                  <PostImage
                    src={post.image}
                    alt="post"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/500x300/0A0A0A/fff?text=Preview'; }}
                  />
                )}
                <PostStats>
                  <StatItem>❤️ {post.likes} Likes</StatItem>
                  <StatItem>💬 {post.comments} Comments</StatItem>
                  <StatItem>🔖 {post.shares} Shares</StatItem>
                </PostStats>
              </PostPreviewCard>
            </CarouselSlide>
          ))}
        </CarouselContainer>
      </Section>

      {/* Interactive Post Carousel */}
      <Section ref={carouselRef}>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          animate={carouselInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          See What's <GradientText>Trending</GradientText>
        </SectionTitle>
        <CarouselContainer>
          {CAROUSEL_POSTS.map((post, idx) => (
            <CarouselSlide
              key={idx}
              initial={{ opacity: 0, x: 50 }}
              animate={
                idx === currentSlide
                  ? { opacity: 1, x: 0, scale: 1 }
                  : { opacity: 0.5, x: 50, scale: 0.95 }
              }
              transition={{ duration: 0.5 }}
              style={{ display: idx === currentSlide ? 'block' : 'none' }}
            >
              <PostPreviewCard>
                <PostHeader>
                  <UserAvatar>{post.user[0]}</UserAvatar>
                  <div>
                    <UserName>{post.user}</UserName>
                    <PostTime>{post.time}</PostTime>
                  </div>
                </PostHeader>
                <PostContent>{post.content}</PostContent>
                {post.image && (
                  <PostImage src={post.image} alt="post" />
                )}
                <PostStats>
                  <StatItem
                    className="like"
                    title="Like"
                    onClick={() => { }}
                  >
                    <span role="img" aria-label="like">❤️</span> {post.likes} Likes
                  </StatItem>
                  <StatItem title="Comment">
                    <span role="img" aria-label="comment">💬</span> {post.comments} Comments
                  </StatItem>
                  <StatItem title="Share">
                    <span role="img" aria-label="share">🔖</span> {post.shares} Shares
                  </StatItem>
                </PostStats>
              </PostPreviewCard>
            </CarouselSlide>
          ))}
          <CarouselDots>
            {CAROUSEL_POSTS.map((_, idx) => (
              <Dot
                key={idx}
                active={idx === currentSlide}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </CarouselDots>
        </CarouselContainer>
      </Section>

      {/* Enhanced Features Section */}
      <Section ref={featuresRef}>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Why Choose <GradientText>Liners?</GradientText>
        </SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{
                y: -10,
                boxShadow: `0 20px 60px ${feature.color}33`,
                borderColor: feature.color
              }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <FeatureGlow color={feature.color} />
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Section>

      {/* Stats Section */}
      <Section ref={statsRef}>
        <StatsContainer>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={statsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              <StatNumber>
                <AnimatedNumber target={stat.value} inView={statsInView} />
                {stat.suffix}
              </StatNumber>
              <StatLabel>{stat.label}</StatLabel>
              <StatPulse />
            </StatCard>
          ))}
        </StatsContainer>
      </Section>

      {/* Testimonials Section */}
      <Section ref={testimonialsRef}>
        <SectionTitle
          initial={{ opacity: 0, y: 20 }}
          animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          What Users <GradientText>Say</GradientText>
        </SectionTitle>
        <TestimonialsGrid>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Stars>{'⭐'.repeat(testimonial.rating)}</Stars>
              <TestimonialText>"{testimonial.text}"</TestimonialText>
              <TestimonialAuthor>
                <AuthorInitial>{testimonial.author[0]}</AuthorInitial>
                <div>
                  <AuthorName>{testimonial.author}</AuthorName>
                  <AuthorRole>{testimonial.role}</AuthorRole>
                </div>
              </TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </Section>

      {/* Product Showcase */}
      <Section>
        <SectionTitle>
          Powerful <GradientText>Features</GradientText>
        </SectionTitle>
        <ShowcaseGrid>
          {showcaseItems.map((item, index) => (
            <ShowcaseCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <ShowcaseIcon>{item.icon}</ShowcaseIcon>
              <ShowcaseTitle>{item.title}</ShowcaseTitle>
              <ShowcaseDescription>{item.description}</ShowcaseDescription>
            </ShowcaseCard>
          ))}
        </ShowcaseGrid>
      </Section>

      {/* Final CTA */}
      <Section>
        <CTAContainer
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <CTATitle>Ready to Start Your Journey?</CTATitle>
          <CTASubtitle>Join thousands of users already experiencing the future of social media</CTASubtitle>
          <MagneticButton
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 60px rgba(99, 102, 241, 0.8)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(isSignedIn ? '/feed' : '/register')}
          >
            {isSignedIn ? 'Explore Feed' : 'Sign Up Now'}
          </MagneticButton>
        </CTAContainer>
      </Section>
    </PageWrapper >
  );
};

// Animated Number Component
const AnimatedNumber = ({ target, inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target]);

  return <>{count.toLocaleString()}</>;
};

// Data
const features = [
  {
    icon: '�',
    title: 'Post & Share',
    description: 'Share your thoughts, moments, and ideas with rich media support',
    color: '#6366f1'
  },
  {
    icon: '⚡',
    title: 'Real-time Engagement',
    description: 'Like, comment, and interact instantly with your community',
    color: '#a855f7'
  },
  {
    icon: '🔍',
    title: 'Discover Trends',
    description: 'Explore trending posts and discover new creators',
    color: '#ec4899'
  },
  {
    icon: '🔒',
    title: 'Privacy Control',
    description: 'Choose who sees your content and manage your followers',
    color: '#10b981'
  },
  {
    icon: '💬',
    title: 'Direct Messaging',
    description: 'Connect with friends through secure real-time messaging',
    color: '#f59e0b'
  },
  {
    icon: '🎯',
    title: 'Smart Recommendations',
    description: 'Discover content and profiles tailored to your interests',
    color: '#3b82f6'
  }
];

const stats = [
  { value: 50000, suffix: '+', label: 'Active Users' },
  { value: 2500000, suffix: '+', label: 'Posts Created' },
  { value: 15000000, suffix: '+', label: 'Total Interactions' }
];

const CAROUSEL_POSTS = [
  {
    user: 'Alex Johnson',
    content: 'Just launched an amazing new feature on Liners! The real-time messaging is lightning fast. 🚀',
    time: '2 hours ago',
    likes: 342,
    comments: 48,
    shares: 12,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=400&fit=crop'
  },
  {
    user: 'Sarah Chen',
    content: 'The community here is amazing! Found so many talented creators and had great conversations. 💜',
    time: '4 hours ago',
    likes: 521,
    comments: 89,
    shares: 34,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop'
  },
  {
    user: 'Mike Rivera',
    content: 'Privacy-first social media is the future. Liners nailed it! 🔐',
    time: '6 hours ago',
    likes: 289,
    comments: 56,
    shares: 18,
    image: 'https://images.unsplash.com/photo-1611339555312-e607c90352fd?w=500&h=400&fit=crop'
  }
];

const testimonials = [
  {
    rating: 5,
    text: 'Liners has completely changed how I connect with my friends. The interface is beautiful and intuitive!',
    author: 'Emma Wilson',
    role: 'Content Creator'
  },
  {
    rating: 5,
    text: 'Finally a social platform that respects my privacy. Love the security features here.',
    author: 'James Brown',
    role: 'Tech Enthusiast'
  },
  {
    rating: 5,
    text: 'The community is supportive and the engagement is real. Best platform I\'ve been on!',
    author: 'Lisa Garcia',
    role: 'Photographer'
  },
  {
    rating: 5,
    text: 'Amazing real-time features and zero lag. This is how social media should work!',
    author: 'David Park',
    role: 'Software Developer'
  }
];

const showcaseItems = [
  {
    icon: '📸',
    title: 'Rich Media Support',
    description: 'Share high-quality images and videos with your community'
  },
  {
    icon: '🌙',
    title: 'Dark Mode',
    description: 'Beautiful dark theme for comfortable viewing anytime'
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    description: 'Perfect experience on any device - mobile, tablet, desktop'
  },
  {
    icon: '⚙️',
    title: 'Smart Algorithms',
    description: 'Personalized feed showing content you care about most'
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Stay updated with intelligent notification management'
  },
  {
    icon: '🌍',
    title: 'Global Community',
    description: 'Connect with people from around the world'
  }
];

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: var(--color-bg);
  position: relative;
  overflow-x: hidden;
  padding-bottom: 100px;
  font-family: var(--font-mono, 'Fira Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace');
  color: var(--color-headline);
`;

const FloatingOrbs = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: ${keyframes`
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(100px, -100px) scale(1.1); }
      66% { transform: translate(-100px, 100px) scale(0.9); }
    `} 20s ease-in-out infinite;
  }
  
  &::before {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    top: -200px;
    left: -200px;
  }
  
  &::after {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #ec4899, #a855f7);
    bottom: -150px;
    right: -150px;
    animation-delay: -10s;
  }
`;

const ContentContainer = styled(motion.div)`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 24px 80px;
  background: var(--color-glass);
  backdrop-filter: blur(16px);
  border-radius: 32px;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 32px 0 var(--color-blue);
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

// ...existing code...

const Title = styled(motion.h1)`
  font-size: 5rem;
  font-weight: 900;
  color: var(--color-headline);
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -3px;
  font-family: var(--font-display, 'Poppins', 'Montserrat', 'Inter', 'sans-serif');
  text-shadow: 0 0 24px var(--color-purple);
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Cursor = styled.span`
  color: #6366f1;
  animation: ${keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  `} 1s infinite;
  margin-left: 5px;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: var(--color-body);
  max-width: 600px;
  line-height: 1.6;
  font-weight: 500;
  margin-bottom: 40px;
  font-family: var(--font-mono);
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const PrimaryButton = styled(motion.button)`
  background: var(--color-pill-gradient);
  color: var(--color-headline);
  padding: 18px 42px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 18px;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 50px var(--color-purple);
  transition: all 0.3s ease;
  font-family: var(--font-display);
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: var(--color-cyan);
  padding: 18px 42px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 18px;
  border: 2px solid var(--color-cyan);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-display);
  box-shadow: 0 0 24px var(--color-cyan);
`;

const Section = styled.section`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 100px auto;
  padding: 0 24px;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3.5rem;
  font-weight: 900;
  color: #fff;
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: -2px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const GradientText = styled.span`
  background: var(--color-pill-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: var(--font-display);
`;

// Carousel Styles
const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 60px auto;
`;

const CarouselSlide = styled(motion.div)`
  position: relative;
  width: 100%;
`;

const PostPreviewCard = styled.div`
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(8px) saturate(1.05);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 var(--color-blue);
  transition: box-shadow 0.2s, background 0.2s;
  &:hover {
    box-shadow: 0 4px 20px 0 var(--color-purple);
    border-color: var(--color-purple);
    background: rgba(30, 30, 30, 0.85);
  }
`;

const PostHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
`;

const UserName = styled.div`
  color: #fff;
  font-weight: 700;
  font-size: 16px;
`;

const PostTime = styled.div`
  color: #94a3b8;
  font-size: 13px;
`;

const PostContent = styled.p`
  color: #e2e8f0;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const PostImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 16px;
`;

const PostStats = styled.div`
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
`;

const StatItem = styled.div`
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s;
  &.like {
    color: #ec4899;
    text-shadow: 0 0 8px #ec4899;
  }
  &:hover {
    color: #ec4899;
    text-shadow: 0 0 8px #ec4899;
  }
`;

const CarouselDots = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 24px;
`;

const Dot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${props => props.active ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'};
  transition: all 0.3s ease;

  &:hover {
    background: #6366f1;
  }
`;

// Features Grid
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 60px;
`;

const FeatureGlow = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: ${props => props.color};
  opacity: 0;
  filter: blur(40px);
  transition: opacity 0.3s ease;
  z-index: -1;
`;

const FeatureCard = styled(motion.div)`
  position: relative;
  background: var(--color-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.3s ease;
  perspective: 1000px;
  box-shadow: 0 0 32px 0 var(--color-blue);
  &:hover ${FeatureGlow} {
    opacity: 0.15;
    box-shadow: 0 0 32px 0 var(--color-purple);
    border-color: var(--color-purple);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
`;

// Stats
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-top: 60px;
`;

const StatPulse = styled.div`
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  opacity: 0.5;
  filter: blur(20px);
  animation: ${keyframes`
    0%, 100% { opacity: 0.3; transform: scale(0.95); }
    50% { opacity: 0.6; transform: scale(1.05); }
  `} 3s ease-in-out infinite;
  z-index: -1;
`;

const StatCard = styled(motion.div)`
  position: relative;
  background: var(--color-card);
  backdrop-filter: blur(16px);
  border: 2px solid var(--color-border);
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 0 32px 0 var(--color-blue);
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 0 32px 0 var(--color-purple);
    border-color: var(--color-purple);
  }
`;

const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// Testimonials
const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 60px;
`;

const TestimonialCard = styled(motion.div)`
  background: var(--color-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 0 32px 0 var(--color-blue);
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 0 32px 0 var(--color-purple);
    border-color: var(--color-purple);
  }
`;

const Stars = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const TestimonialText = styled.p`
  color: #e2e8f0;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AuthorInitial = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const AuthorName = styled.div`
  color: #fff;
  font-weight: 700;
`;

const AuthorRole = styled.div`
  color: #94a3b8;
  font-size: 13px;
`;

// Showcase Grid
const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 60px;
`;

const ShowcaseCard = styled(motion.div)`
  background: var(--color-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 0 32px 0 var(--color-blue);
  &:hover {
    border-color: var(--color-purple);
    box-shadow: 0 0 32px 0 var(--color-purple);
  }
`;

const ShowcaseIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const ShowcaseTitle = styled.h4`
  color: #fff;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 16px;
`;

const ShowcaseDescription = styled.p`
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
`;

// CTA
const CTAContainer = styled(motion.div)`
  text-align: center;
  padding: 80px 32px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border-radius: 32px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  margin-top: 100px;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: -2px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTASubtitle = styled.p`
  font-size: 1.2rem;
  color: #94a3b8;
  margin-bottom: 40px;
`;

const MagneticButton = styled(motion.button)`
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  background-size: 200% 200%;
  color: white;
  padding: 20px 50px;
  border-radius: 20px;
  font-weight: 900;
  font-size: 20px;
  border: none;
  cursor: pointer;
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.5);
  animation: ${keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  `} 5s ease infinite;
`;

export default Home;
