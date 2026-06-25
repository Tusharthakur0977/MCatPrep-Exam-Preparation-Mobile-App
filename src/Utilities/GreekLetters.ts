export const replaceGreekLetters = (text: string): string => {
  if (!text) return '';
  const greekLetterMap: { [key: string]: string } = {
    // Uppercase Greek letters

    '|ALPHA|': 'Α',
    '|EPSILON|': 'Ε',
    '|BETA|': 'Β',
    '|ZETA|': 'Ζ',
    '|KAPPA|': 'Κ',
    '|ETA|': 'Η',
    '|LAMBDA|': 'Λ',
    '|OMICRON|': 'Ο',
    '|MU|': 'Μ',
    '|PI|': 'Π',
    '|UPSILON|': 'Υ',
    '|RHO|': 'Ρ',
    '|GAMMA|': 'Γ',
    '|DELTA|': 'Δ',
    '|THETA|': 'Θ',
    '|IOTA|': 'Ι',
    '|NU|': 'Ν',
    '|XI|': 'Ξ',
    '|SIGMA|': 'Σ',
    '|TAU|': 'Τ',
    '|PHI|': 'Φ',
    '|CHI|': 'Χ',
    '|PSI|': 'Ψ',
    '|OMEGA|': 'Ω',
    // Lowercase Greek letters
    '|alpha|': 'α',
    '|epsilon|': 'ε',
    '|beta|': 'β',

    '|zeta|': 'ζ',
    '|kappa|': 'κ',
    '|eta|': 'η',

    '|gamma|': 'γ',
    '|delta|': 'δ',
    // Lowercase Greek letters
    '|theta|': 'θ',
    '|iota|': 'ι',
    '|lambda|': 'λ',
    '|omicron|': 'ο',
    '|pi|': 'π',
    '|upsilon|': 'υ',
    '|phi|': 'φ',

    '|mu|': 'μ',
    '|nu|': 'ν',
    '|xi|': 'ξ',
    '|rho|': 'ρ',
    '|sigma|': 'σ',
    '|tau|': 'τ',
    '|chi|': 'χ',
    '|psi|': 'ψ',
    '|omega|': 'ω',
  };
  let result = text;
  // Replace all Greek letter placeholders
  Object.keys(greekLetterMap).forEach(placeholder => {
    const regex = new RegExp(placeholder.replace(/[|]/g, '\\|'), 'g');
    result = result.replace(regex, greekLetterMap[placeholder]);
  });
  return result;
};
