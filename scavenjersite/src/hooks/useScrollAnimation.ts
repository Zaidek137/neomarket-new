import { useEffect } from 'react';

// Viewport height calculation for mobile
export function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);
}

// Text scramble animation
export function useTextScramble(
  setText: (text: string) => void,
  originalText: string,
  delay: number = 0
) {
  useEffect(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;
    let interval: NodeJS.Timeout;
    
    const scrambleText = () => {
      iteration = 0;
      interval = setInterval(() => {
        setText(
          originalText.split("")
            .map((letter, index) => {
              if (letter === " " || letter === "?") return letter;
              if (iteration > 15) return originalText[index];
              return Math.random() < 0.4 ? "" : letters[Math.floor(Math.random() * 26)];
            })
            .join("")
        );

        iteration += 0.4;
        if (iteration >= 20) {
          clearInterval(interval);
          setTimeout(scrambleText, 4000);
        }
      }, 80);
    };

    const timeout = setTimeout(scrambleText, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [setText, originalText, delay]);
}