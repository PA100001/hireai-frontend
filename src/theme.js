// LinkedIn palette (approximate)
// Light:
// Primary Blue: #0A66C2
// Background: #F3F2EF (off-white/light grey)
// Card Background: #FFFFFF
// Text: #000000 (opacity variants)
// Secondary/Accent: #0073B1 (another blue), #3875A6
// Borders: #E0DFDC

// Dark:
// Primary Blue: #70B5F9 (lighter blue for dark bg)
// Background: #1D2226 (very dark grey/blue)
// Card Background: #2A2E31 (slightly lighter than bg)
// Text: #FFFFFF (opacity variants)
// Borders: #404345

const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 500 },
  h6: { fontWeight: 500 },
  button: {
    textTransform: 'none', // LinkedIn buttons are often not all caps
    fontWeight: 600,
  },
};

const shape = {
  borderRadius: 8, // Slightly more rounded than default
};

const commonComponents = (mode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '20px', // Pill-shaped buttons like LI
        padding: '8px 20px',
      },
      containedPrimary: {
        '&:hover': {
          backgroundColor: mode === 'light' ? '#004182' : '#A8D4FF',
        },
      },
      outlinedPrimary: {
         borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        }
      }
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        // Add styles if needed
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.2)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: `1px solid ${mode === 'light' ? '#E0DFDC' : '#404345'}`,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove gradient from paper in dark mode by default
      }
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        // borderRadius: '20px', // If you want text fields to also be pill-shaped
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
      }
    }
  }
});

export const lightThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#0A66C2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0073B1', // Or a more distinct accent like a green or orange if desired
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F3F2EF',
      paper: '#FFFFFF',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.9)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: '#E0DFDC', // A bit lighter than default MUI divider in light mode
    action: { // Subtle hover/active states
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    }
  },
  typography,
  shape,
  components: {
    ...commonComponents('light'),
    MuiContainer: { // Default max widths for consistency
      defaultProps: {
        // maxWidth: 'lg', // You can set a default max width for all containers if you wish
      }
    },
   MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Ensure no accidental gradients on Paper
        },
      },
    },
    MuiButton: { // Example: More LinkedIn like button shapes
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          borderRadius: ownerState.variant === 'text' ? shape.borderRadius : '20px', // Pill for contained/outlined
          padding: '8px 20px',
          fontWeight: 600,
          textTransform: 'none',
        }),
        // ... (other button styles)
      }
    }
  },
};

export const darkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#70B5F9',
      contrastText: '#000000',
    },
    secondary: {
      main: '#A8D4FF',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Standard dark theme background
      paper: '#1E1E1E',   // Slightly lighter for cards/papers
    },
    text: {
      primary: '#E1E3E6',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Standard dark mode divider
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    }
  },
  typography,
  shape,
  components: {
    ...commonComponents('dark'),
    MuiContainer: {
      defaultProps: {
        // maxWidth: 'lg',
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: { // Example: More LinkedIn like button shapes
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          borderRadius: ownerState.variant === 'text' ? shape.borderRadius : '20px', // Pill for contained/outlined
          padding: '8px 20px',
          fontWeight: 600,
          textTransform: 'none',
        }),
        // ... (other button styles)
      }
    }
  },
};