import { useState, useEffect } from 'react';

export function useTheme() {
  // Always return dark theme for our app's design
  return { theme: 'dark' };
}