import React from 'react';
import Image from "next/image";
import { WaterTank } from '@/app/data/tanks';
import { getTankColor } from '@/lib/tankUtils';

interface TankMapProps {
  level: string;
  tanksData: Record<string, WaterTank>;
  onTankClick: (tankId: string) => void;
}

const TankMap: React.FC<TankMapProps> = ({ level, tanksData, onTankClick }) => {
  // Function to get scaled position for tank overlay
  const getScaledPosition = (top: number, left: number) => {
    // Since we're now using images that are already correctly sized (1280x900),
    // we don't need to scale coordinates
    return {
      top,
      left
    };
  };
  
  // Get the image source based on the level
  const getImageSource = () => {
    switch(level) {
      case 'N00':
        return '/images/n00.jpg';
      case 'N10':
        return '/images/n10.jpg';
      case 'N20':
        return '/images/n20.jpg';
      case 'N30':
        return '/images/n30.jpg';
      default:
        return '/images/n00.jpg';
    }
  };
  
  return (
    <div className="relative" style={{ width: "1280px", height: "900px" }}>
      <Image
        src={getImageSource()}
        alt={`${level} Level Map`}
        width={1280}
        height={900}
        className="w-full h-auto"
        style={{ maxWidth: "none" }}
      />
      
      {/* Render clickable boxes for each tank */}
      {Object.values(tanksData).map((tank) => {
        const position = getScaledPosition(tank.coordinates.top, tank.coordinates.left);
        return (
          <div
            key={tank.id}
            className="absolute"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div
              className={`${getTankColor(tank)} cursor-pointer rounded-full`}
              style={{
                width: `${tank.coordinates.width}px`,
                height: `${tank.coordinates.height}px`,
              }}
              onClick={() => onTankClick(tank.id)}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default TankMap; 