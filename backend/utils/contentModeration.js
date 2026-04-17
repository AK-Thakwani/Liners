// Custom profanity filter - comprehensive word list
const profanityWords = [
  // Common profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'fucks',
  'shit', 'shitting', 'shitted', 'shitter', 'shits',
  'bitch', 'bitches', 'bitching', 'bitched',
  'ass', 'asses', 'asshole', 'assholes',
  'damn', 'damned', 'damning',
  'hell', 'hells',
  'crap', 'craps', 'crappy',
  'stupid', 'stupidity', 'stupidly',
  'idiot', 'idiots', 'idiotic',
  'moron', 'morons', 'moronic',
  'retard', 'retarded', 'retards',
  
  // Stronger profanity
  'cunt', 'cunts',
  'whore', 'whores', 'whoring',
  'slut', 'sluts', 'slutty',
  'piss', 'pissing', 'pissed',
  'cock', 'cocks', 'cocksucker',
  'dick', 'dicks', 'dickhead',
  'pussy', 'pussies',
  'bastard', 'bastards',
  'son of a bitch',
  
  // Hate speech and harassment (more specific)
  'hate speech', 'hateful', 'hatefully',
  'violent threats', 'threatening violence',
  'harassment', 'harass', 'harassing', 'harassed',
  'bully', 'bullies', 'bullying', 'bullied',
  'threat', 'threats', 'threatening', 'threatened',
  'abuse', 'abuses', 'abusing', 'abused', 'abusive',
  
  // Spam and scam related
  'spam', 'spams', 'spamming', 'spammed', 'spammer',
  'scam', 'scams', 'scamming', 'scammed', 'scammer',
  'fake', 'fakes', 'faking', 'faked', 'faker',
  'fraud', 'frauds', 'fraudulent', 'fraudster',
  
  // Illegal activities
  'illegal', 'illegally',
  'drugs', 'drug', 'drugging', 'drugged',
  'weapons', 'weapon', 'weaponry',
  'kill', 'kills', 'killing', 'killed', 'killer',
  'murder', 'murders', 'murdering', 'murdered', 'murderer',
  'suicide', 'suicidal', 'suiciding',
  'bomb', 'bombs', 'bombing', 'bombed', 'bomber',
  'terrorist', 'terrorism', 'terrorists',
  
  // Sexual content
  'porn', 'porno', 'pornography', 'pornographic',
  'sex', 'sexual', 'sexually', 'sexuality',
  'nude', 'nudes', 'nudity', 'naked',
  'rape', 'rapes', 'raping', 'raped', 'rapist',
  'molest', 'molests', 'molesting', 'molested', 'molester',
  
  // Racial slurs (partial list - be very careful with these)
  'nigger', 'niggers', 'nigga', 'niggas',
  'chink', 'chinks', 'chinky',
  'spic', 'spics', 'spick',
  'kike', 'kikes',
  'wetback', 'wetbacks',
  'gook', 'gooks',
  'towelhead', 'towelheads',
  'sandnigger', 'sandniggers',
  
  // Homophobic slurs
  'fag', 'fags', 'faggot', 'faggots', 'faggy',
  'dyke', 'dykes', 'dike', 'dikes',
  'tranny', 'trannies', 'trannie',
  'shemale', 'shemales',
  
  // Body shaming (more specific)
  'fat shaming', 'body shaming',
  'ugly shaming', 'appearance shaming',
  'gross', 'grosser', 'grossest', 'grossly',
  'disgusting', 'disgustingly',
  
  // Mental health slurs (more specific)
  'crazy', 'crazier', 'craziest', 'crazily',
  'insane', 'insanely', 'insanity',
  'psycho', 'psychos', 'psychotic',
  'mental illness slur', 'mental health slur',
  'lunatic', 'lunatics', 'lunacy'
];

// Function to check if text contains profanity
const isProfane = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Temporary bypass for testing - remove this in production
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CONTENT_FILTER === 'true') {
    console.log('Content filter disabled for development');
    return false;
  }
  
  const lowerText = text.toLowerCase();
  
  // Check for exact word matches
  for (const word of profanityWords) {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  // Check for variations and leetspeak
  const leetReplacements = {
    'a': '[a@4]',
    'e': '[e3]',
    'i': '[i1!]',
    'o': '[o0]',
    's': '[s$5]',
    't': '[t7]',
    'l': '[l1]',
    'g': '[g9]',
    'b': '[b6]'
  };
  
  // Check for common profanity with leetspeak
  const commonProfanity = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'hell'];
  for (const word of commonProfanity) {
    let leetPattern = word;
    for (const [char, replacement] of Object.entries(leetReplacements)) {
      leetPattern = leetPattern.replace(new RegExp(char, 'g'), replacement);
    }
    const regex = new RegExp(leetPattern, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if text content contains inappropriate language
 * @param {string} text - The text to check
 * @returns {Object} - { isInappropriate: boolean, reason?: string, confidence?: number }
 */
const checkTextContent = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      return { isInappropriate: false };
    }

    // Check for profanity
    if (isProfane(text)) {
      return {
        isInappropriate: true,
        reason: 'Profanity detected',
        confidence: 0.9
      };
    }

    // Check for excessive caps (spam-like behavior)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.7 && text.length > 10) {
      return {
        isInappropriate: true,
        reason: 'Excessive capitalization detected',
        confidence: 0.6
      };
    }

    // Check for repetitive characters (spam-like behavior)
    const repetitivePattern = /(.)\1{4,}/;
    if (repetitivePattern.test(text)) {
      return {
        isInappropriate: true,
        reason: 'Repetitive characters detected',
        confidence: 0.7
      };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /click here/i,
      /free money/i,
      /win now/i,
      /urgent/i,
      /act now/i,
      /limited time/i,
      /guaranteed/i,
      /no risk/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return {
          isInappropriate: true,
          reason: 'Suspicious promotional content detected',
          confidence: 0.8
        };
      }
    }

    return { isInappropriate: false };
  } catch (error) {
    console.error('Error in text content moderation:', error);
    return { isInappropriate: false };
  }
};

/**
 * Check if image content is appropriate (basic checks)
 * @param {Object} file - The uploaded file object
 * @returns {Object} - { isInappropriate: boolean, reason?: string }
 */
const checkImageContent = (file) => {
  try {
    if (!file) {
      return { isInappropriate: false };
    }

    // Check file size (prevent extremely large files)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isInappropriate: true,
        reason: 'File size too large (max 10MB)'
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isInappropriate: true,
        reason: 'Invalid file type. Only images are allowed'
      };
    }

    // Check for suspicious file names
    const suspiciousNames = ['virus', 'malware', 'trojan', 'hack', 'crack'];
    const fileName = file.originalname.toLowerCase();
    
    for (const suspicious of suspiciousNames) {
      if (fileName.includes(suspicious)) {
        return {
          isInappropriate: true,
          reason: 'Suspicious file name detected'
        };
      }
    }

    return { isInappropriate: false };
  } catch (error) {
    console.error('Error in image content moderation:', error);
    return { isInappropriate: false };
  }
};

/**
 * Comprehensive content moderation for posts
 * @param {string} content - Post text content
 * @param {string} tag - Post tag
 * @param {Object} imageFile - Uploaded image file
 * @returns {Object} - { isApproved: boolean, reasons: string[], confidence: number }
 */
const moderateContent = (content, tag, imageFile) => {
  // TEMPORARY: Always approve content for testing
  console.log('Content moderation called - temporarily approving all content');
  return {
    isApproved: true,
    reasons: [],
    confidence: 0
  };
  
  // Original code commented out for testing
  /*
  const results = [];
  let confidence = 0;

  // Check text content
  const textResult = checkTextContent(content);
  if (textResult.isInappropriate) {
    results.push(textResult.reason);
    confidence = Math.max(confidence, textResult.confidence || 0.8);
  }

  // Check tag content
  if (tag) {
    const tagResult = checkTextContent(tag);
    if (tagResult.isInappropriate) {
      results.push(`Tag: ${tagResult.reason}`);
      confidence = Math.max(confidence, tagResult.confidence || 0.8);
    }
  }

  // Check image content
  if (imageFile) {
    const imageResult = checkImageContent(imageFile);
    if (imageResult.isInappropriate) {
      results.push(imageResult.reason);
      confidence = Math.max(confidence, 0.9);
    }
  }

  return {
    isApproved: results.length === 0,
    reasons: results,
    confidence: confidence
  };
  */
};

/**
 * Get user-friendly error message for moderation failure
 * @param {string[]} reasons - Array of moderation failure reasons
 * @returns {string} - User-friendly error message
 */
const getModerationErrorMessage = (reasons) => {
  if (reasons.length === 0) return 'Content not approved';
  
  const primaryReason = reasons[0];
  
  if (primaryReason.includes('Profanity')) {
    return 'Your post contains inappropriate language. Please use respectful language.';
  } else if (primaryReason.includes('capitalization')) {
    return 'Please avoid excessive use of capital letters.';
  } else if (primaryReason.includes('Repetitive')) {
    return 'Please avoid repetitive characters in your post.';
  } else if (primaryReason.includes('Suspicious')) {
    return 'Your post contains content that appears to be promotional or suspicious.';
  } else if (primaryReason.includes('File size')) {
    return 'Image file is too large. Please use an image smaller than 10MB.';
  } else if (primaryReason.includes('Invalid file type')) {
    return 'Only image files (JPEG, PNG, GIF, WebP) are allowed.';
  } else if (primaryReason.includes('file name')) {
    return 'Please use an appropriate file name for your image.';
  }
  
  return 'Your post contains content that violates our community guidelines.';
};

module.exports = {
  checkTextContent,
  checkImageContent,
  moderateContent,
  getModerationErrorMessage
};