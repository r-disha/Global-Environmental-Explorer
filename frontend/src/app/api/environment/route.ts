import { NextResponse } from 'next/server';
import axios from 'axios';

const WAQI_TOKEN = process.env.WAQI_TOKEN;
const OWM_TOKEN = process.env.OWM_TOKEN;
const TOMTOM_TOKEN = process.env.TOMTOM_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  try {
    // 1. Get Coordinates using Nominatim
    const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'premium-globe-app/1.0' },
      timeout: 10000
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      return NextResponse.json({ error: 'Could not find that location. Please check the spelling.' }, { status: 404 });
    }

    const lat = parseFloat(geoRes.data[0].lat);
    const lon = parseFloat(geoRes.data[0].lon);
    const displayName = geoRes.data[0].display_name.split(',')[0];

    // 2. Fetch AQI, Weather, Traffic in parallel
    const [aqiRes, weatherRes, trafficRes] = await Promise.allSettled([
      axios.get(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`),
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_TOKEN}&units=metric`),
      axios.get(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${TOMTOM_TOKEN}`)
    ]);

    // Parse AQI
    let aqiData = null;
    let aqiColor = 'rgba(255,255,255,0.2)';
    let aqiPayload = (aqiRes.status === 'fulfilled') ? aqiRes.value.data : null;

    // Fallback to city name search if geo coordinates return an error or N/A
    if (!aqiPayload || aqiPayload.status !== 'ok' || typeof aqiPayload.data?.aqi !== 'number') {
      try {
        const fallbackRes = await axios.get(`https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${WAQI_TOKEN}`);
        if (fallbackRes.data.status === 'ok' && typeof fallbackRes.data.data?.aqi === 'number') {
          aqiPayload = fallbackRes.data;
        }
      } catch (e) {
        // Ignore fallback error
      }
    }

    if (aqiPayload && aqiPayload.status === 'ok') {
      const aqi = aqiPayload.data.aqi;
      if (typeof aqi === 'number') {
        aqiData = aqi;
        if (aqi <= 50) aqiColor = '#00E400';
        else if (aqi <= 100) aqiColor = '#FFFF00';
        else if (aqi <= 150) aqiColor = '#FF7E00';
        else if (aqi <= 200) aqiColor = '#FF0000';
        else if (aqi <= 300) aqiColor = '#8F3F97';
        else aqiColor = '#7E0023';
      }
    }

    // Parse Weather
    let weatherData = null;
    if (weatherRes.status === 'fulfilled') {
      const w = weatherRes.value.data;
      weatherData = {
        temp: Math.round(w.main.temp),
        condition: w.weather[0].description.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        humidity: w.main.humidity
      };
    } else {
      // Mock Weather fallback
      weatherData = {
        temp: Math.round(Math.random() * 15 + 15),
        condition: "Clear (Fallback)",
        humidity: Math.floor(Math.random() * 40 + 40)
      };
    }

    // Parse Traffic
    let trafficData = null;
    if (trafficRes.status === 'fulfilled' && TOMTOM_TOKEN !== "3B9yRdwdjNkMmuNbRnVcHhqi25wDCqoJ") {
      const currentSpeed = trafficRes.value.data.flowSegmentData.currentSpeed;
      const freeFlowSpeed = trafficRes.value.data.flowSegmentData.freeFlowSpeed;
      let status = "Clear";
      if (currentSpeed <= freeFlowSpeed * 0.5) status = "Heavy Traffic";
      else if (currentSpeed <= freeFlowSpeed * 0.8) status = "Moderate Traffic";
      trafficData = { currentSpeed, freeFlowSpeed, status };
    } else {
      // Mock Traffic fallback
      const freeFlowSpeed = Math.floor(Math.random() * 30 + 50);
      const currentSpeed = Math.floor(Math.random() * freeFlowSpeed);
      let status = "Clear";
      if (currentSpeed <= freeFlowSpeed * 0.5) status = "Heavy Traffic";
      else if (currentSpeed <= freeFlowSpeed * 0.8) status = "Moderate Traffic";
      trafficData = { currentSpeed, freeFlowSpeed, status: status };
    }

    return NextResponse.json({
      location: { lat, lon, name: displayName },
      aqi: { value: aqiData, color: aqiColor },
      weather: weatherData,
      traffic: trafficData
    });

  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json({ error: 'Failed to fetch environmental data' }, { status: 500 });
  }
}
