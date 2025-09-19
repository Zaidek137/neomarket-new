import { motion } from "framer-motion";
import { WorldMap } from "./world-map";

export function WorldMapDemo() {
  return (
    <div className="py-40 w-full">
      <div className="max-w-7xl mx-auto text-center">
        <p className="font-bold text-xl md:text-4xl text-white">
          Global{" "}
          <span className="text-[#2DD4BF]">
            {"Community".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>
        <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
          Join our worldwide network of Scavenjers, exploring and collecting across the globe.
         
        </p>
      </div>
      <WorldMap
        lineColor="#2DD4BF"
        dots={[
          // Trans-Pacific Connection
          {
            start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
            end: { lat: 35.6762, lng: 139.6503 }, // Tokyo
            animationDuration: 3,
            animationDelay: 0
          },
          
          // Europe-Asia Connection
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.2090 }, // New Delhi
            animationDuration: 3.5,
            animationDelay: 0.8
          },
          
          // Americas-Africa Connection
          {
            start: { lat: -23.5505, lng: -46.6333 }, // São Paulo
            end: { lat: -33.9249, lng: 18.4241 }, // Cape Town
            animationDuration: 4,
            animationDelay: 1.6
          },
          
          // Asia-Oceania Connection
          {
            start: { lat: 22.3193, lng: 114.1694 }, // Hong Kong
            end: { lat: -33.8688, lng: 151.2093 }, // Sydney
            animationDuration: 3.2,
            animationDelay: 2.4
          }
        ]}
      />
    </div>
  );
}