# 🌍 Global Environmental Explorer

A premium, full-stack web application that provides real-time Air Quality Index (AQI), weather conditions, and traffic status for cities worldwide, visualized on a stunning 3D WebGL Earth.

## ✨ Features

- **Real-Time Data Aggregation:** Instantly fetches and aggregates live data from WAQI (Air Quality), OpenWeatherMap (Weather), and TomTom (Traffic).
- **Interactive 3D Globe:** Features a hardware-accelerated WebGL globe (`react-globe.gl`) with high-resolution satellite imagery, atmospheric glow, and dynamic cinematic camera zooming.
- **Premium Glassmorphism UI:** Built with Tailwind CSS, the dashboard features a frosted-glass aesthetic, smooth micro-animations, and responsive design.
- **Smart Fallbacks:** Gracefully handles API rate limits or missing geospatial data with mocked fallbacks and secondary city-name lookups to ensure the UI never breaks.
- **Secure Architecture:** Built on Next.js Server Routes, ensuring all API tokens are processed securely on the backend and never exposed to the client browser.

## 🛠️ Technology Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide-React (Icons)
- **Visualization:** React Globe GL (WebGL / Three.js)
- **Backend (API Routes):** Next.js API Routes, Axios
- **External APIs:** Nominatim (Geocoding), WAQI (Air Quality), OpenWeatherMap, TomTom (Traffic)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Global-Environmental-Explorer.git
   cd Global-Environmental-Explorer
   cd frontend
