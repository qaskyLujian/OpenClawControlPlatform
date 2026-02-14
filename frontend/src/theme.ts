// Cyberpunk Color Palette - Optimized for Comfort
export const colors = {
  // Primary Colors
  blue: '#4dd0e1',
  pink: '#f48fb1',
  purple: '#ce93d8',
  green: '#81c784',
  yellow: '#fff176',
  red: '#ef5350',
  
  // Background
  bg: '#0d1117',
  bgLight: '#161b22',
  bgCard: 'rgba(22, 27, 34, 0.95)',
  
  // Text
  text: '#c9d1d9',
  textDim: '#8b949e',
  textBright: '#ffffff',
  
  // Status
  online: '#81c784',
  offline: '#8b949e',
  error: '#ef5350',
  warning: '#fff176',
  
  // Borders
  border: 'rgba(77, 208, 225, 0.3)',
  borderBright: 'rgba(77, 208, 225, 0.6)',
};

// Helper function for glow effect
export const glow = (color: string, intensity: number = 0.3) => {
  return `0 0 ${intensity * 10}px ${color}`;
};

// Helper function for text shadow
export const textGlow = (color: string) => {
  return `0 0 3px ${color}, 0 0 6px ${color}`;
};
