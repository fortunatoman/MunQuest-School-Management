/**
 * Normalizes a string by removing spaces, punctuation, and accents
 */
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, '') // Remove spaces
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove accent marks
};

/**
 * Generates a random 4-digit number
 */
const generateRandomDigits = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generates a random lowercase letter
 */
const generateRandomLetter = (): string => {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
};

/**
 * Generates a username based on the provided rules:
 * 1. Take first name and normalize it
 * 2. If ≥ 4 characters: take first 4 characters
 * 3. If < 4 characters: borrow from last name until 4 characters total
 * 4. If still < 4: fill with random lowercase letters
 * 5. Append 4 random digits
 * 6. Convert to lowercase
 */
export const generateUsername = (fullName: string): string => {
  if (!fullName || fullName.trim() === '') {
    return '';
  }

  // Split the full name into parts
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join('') || '';

  // Normalize first name
  const normalizedFirstName = normalizeString(firstName);
  
  let username = '';
  
  // Rule 2: If ≥ 4 characters, take first 4 characters
  if (normalizedFirstName.length >= 4) {
    username = normalizedFirstName.substring(0, 4);
  } else {
    // Rule 3: If < 4 characters, borrow from last name
    const normalizedLastName = normalizeString(lastName);
    username = normalizedFirstName + normalizedLastName;
    
    // Rule 4: If still < 4, fill with random letters
    while (username.length < 4) {
      username += generateRandomLetter();
    }
    
    // Take only first 4 characters
    username = username.substring(0, 4);
  }

  // Rule 5: Append 4 random digits
  username += generateRandomDigits();

  // Rule 6: Convert to lowercase (already done in normalizeString)
  return username.toLowerCase();
};

/**
 * Examples for testing:
 * - "Iman Praveesh Hassan" → "iman4729"
 * - "Ava Lee" → "aval8341" 
 * - "Li Na" → "lina1023"
 * - "Li" → "liqx5381"
 * - "O'Neil" → "onei9307"
 * - "José María" → "jose4821"
 */
