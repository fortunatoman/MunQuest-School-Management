// School Code Generation Utility
// Format: LOCALITY_SCHOOL_AREA (and sometimes _001 if needed)
// Example: DU_AMB_ALQ

interface LocalityData {
    id: string;
    name: string;
    code?: string;
}

interface AreaData {
    id: string;
    name: string;
    code?: string;
    locality_id: string;
}

// Common words to omit from school names
const OMIT_WORDS = [
    'school', 'college', 'academy', 'international', 'private', 'high', 
    'primary', 'secondary', 'the', 'al', 'of', 'for', 'and', 'dubai'
];

// Locality code mapping
const LOCALITY_CODES: { [key: string]: string } = {
    'dubai': 'DU',
    'abu dhabi': 'AD', 
    'sharjah': 'SHJ',
    'ajman': 'AJM',
    'rak': 'RAK',
    'fujairah': 'FUJ',
    'umm al quwain': 'UAQ',
    'al ain': 'AAN'
};

// Area code mapping
const AREA_CODES: { [key: string]: string } = {
    'al barsha': 'ALB',
    'al quoz': 'ALQ',
    'nad al sheba': 'NAS',
    'jebel ali': 'JAL',
    'mirdif': 'MRD',
    'umm suqeim': 'UQS',
    'al warqa': 'ALW',
    'al garhoud': 'ALG',
    'oud metha': 'OMT'
};

/**
 * Generate school code based on locality, school name, and area
 * @param schoolName - The name of the school
 * @param localityData - Locality data object
 * @param areaData - Area data object
 * @param existingCodes - Array of existing school codes to check for duplicates
 * @returns Generated school code
 */
export const generateSchoolCode = (
    schoolName: string,
    localityData: LocalityData | null,
    areaData: AreaData | null,
    existingCodes: string[] = []
): string => {
    if (!schoolName || !localityData || !areaData) {
        return '';
    }

    // 1. Get locality code
    const localityName = localityData.name.toLowerCase().trim();
    const localityCode = LOCALITY_CODES[localityName] || localityData.code || 
        localityName.substring(0, 3).toUpperCase();

    // 2. Generate school code from school name
    const schoolCode = generateSchoolCodeFromName(schoolName);

    // 3. Get area code
    const areaName = areaData.name.toLowerCase().trim();
    const areaCode = AREA_CODES[areaName] || areaData.code || 
        areaName.replace(/\s+/g, '').substring(0, 3).toUpperCase();

    // 4. Create base code
    let baseCode = `${localityCode}_${schoolCode}_${areaCode}`;

    // 5. Check for duplicates and add number if needed
    let finalCode = baseCode;
    let counter = 1;
    
    while (existingCodes.includes(finalCode)) {
        finalCode = `${baseCode}_${counter.toString().padStart(3, '0')}`;
        counter++;
    }

    return finalCode;
};

/**
 * Generate 3-letter school code from school name
 * @param schoolName - The name of the school
 * @returns 3-letter school code
 */
const generateSchoolCodeFromName = (schoolName: string): string => {
    if (!schoolName) return '';

    // Convert to lowercase and split into words
    const words = schoolName.toLowerCase().trim().split(/\s+/);
    
    // Filter out common words
    const filteredWords = words.filter(word => 
        !OMIT_WORDS.includes(word.replace(/[^\w]/g, ''))
    );

    if (filteredWords.length === 0) {
        // If all words were filtered out, use first 3 characters
        return schoolName.replace(/[^\w]/g, '').substring(0, 3).toUpperCase();
    }

    // Try to get 3 letters from the first meaningful word
    let firstWord = filteredWords[0].replace(/[^\w]/g, '');
    if (firstWord.length >= 3) {
        return firstWord.substring(0, 3).toUpperCase();
    }

    // If first word is less than 3 characters, combine with next word
    if (filteredWords.length > 1) {
        const secondWord = filteredWords[1].replace(/[^\w]/g, '');
        const combined = firstWord + secondWord;
        return combined.substring(0, 3).toUpperCase();
    }

    // If still less than 3 characters, pad with first letter
    return firstWord.padEnd(3, firstWord[0] || 'X').toUpperCase();
};

/**
 * Get locality code from locality name
 * @param localityName - The name of the locality
 * @returns Locality code
 */
export const getLocalityCode = (localityName: string): string => {
    const name = localityName.toLowerCase().trim();
    return LOCALITY_CODES[name] || name.substring(0, 3).toUpperCase();
};

/**
 * Get area code from area name
 * @param areaName - The name of the area
 * @returns Area code
 */
export const getAreaCode = (areaName: string): string => {
    const name = areaName.toLowerCase().trim();
    return AREA_CODES[name] || name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
};
