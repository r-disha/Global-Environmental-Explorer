"use client";
import { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

export default function Earth({ location, aqiColor }: { location: any, aqiColor: string }) {
  const globeEl = useRef<any>(null);

  useEffect(() => {
    if (globeEl.current && location) {
      // Smoothly animate the globe to the searched location and stop rotating
      globeEl.current.pointOfView({ lat: location.lat, lng: location.lon, altitude: 0.8 }, 2500);
      globeEl.current.controls().autoRotate = false;
    } else if (globeEl.current) {
      // Default slow spin if no location
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1;
    }
  }, [location]);

  // Create a glowing marker for the location
  const ringsData = location ? [{
    lat: location.lat,
    lng: location.lon,
    maxR: 5,
    propagationSpeed: 2,
    repeatPeriod: 1000,
    color: aqiColor
  }] : [];

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      ringsData={ringsData}
      ringColor="color"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      atmosphereColor="lightskyblue"
      atmosphereAltitude={0.15}
    />
  );
}
