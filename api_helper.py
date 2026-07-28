import requests
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

WAQI_TOKEN = "870c768a169596c94ef7d5c77bf8800cd264966b"

def get_coordinates(city_name):
    """Converts a city name into Latitude and Longitude."""
    # We must provide a custom user_agent to Nominatim as per their usage policy
    geolocator = Nominatim(user_agent="aqi_globe_app")
    
    try:
        location = geolocator.geocode(city_name, timeout=10)
        if location:
            return location.latitude, location.longitude
        else:
            return None, None
    except (GeocoderTimedOut, GeocoderUnavailable):
        return None, None

def get_aqi_data(lat, lon, city_name=None):
    """Fetches AQI data for specific coordinates using the WAQI API."""
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_TOKEN}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'ok' and city_name:
            # Fallback to city name search if geo coordinates return an error
            fallback_url = f"https://api.waqi.info/feed/{city_name}/?token={WAQI_TOKEN}"
            response_fallback = requests.get(fallback_url)
            if response_fallback.status_code == 200:
                data_fallback = response_fallback.json()
                if data_fallback.get('status') == 'ok':
                    data = data_fallback
                    
        if data.get('status') == 'ok':
            aqi = data['data']['aqi']
            
            # Sometimes AQI is returned as a string '-' if sensors are offline
            if not isinstance(aqi, (int, float)):
                return None, None, "No data available at this location."
            
            # Determine marker color based on AQI severity
            if aqi <= 50:
                color = "#00E400" # Green (Good)
            elif aqi <= 100:
                color = "#FFFF00" # Yellow (Moderate)
            elif aqi <= 150:
                color = "#FF7E00" # Orange (Unhealthy for Sensitive)
            elif aqi <= 200:
                color = "#FF0000" # Red (Unhealthy)
            elif aqi <= 300:
                color = "#8F3F97" # Purple (Very Unhealthy)
            else:
                color = "#7E0023" # Maroon (Hazardous)
                
            return aqi, color, None
        else:
            return None, None, "API Error: Could not fetch data."
            
    except requests.exceptions.RequestException as e:
        return None, None, f"Network Error: {e}"