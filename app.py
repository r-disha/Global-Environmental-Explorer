import streamlit as st
import importlib
from api_helper import get_coordinates, get_aqi_data
from map_builder import create_globe
import weather_component
import traffic_component
importlib.reload(weather_component)
importlib.reload(traffic_component)
from weather_component import get_weather_data
from traffic_component import get_traffic_data

# --- UI Setup ---
st.set_page_config(page_title="Global Environmental Explorer", page_icon="🌍", layout="wide")

# Reduce top gap
st.markdown("""
    <style>
        .block-container {
            padding-top: 1.5rem;
            padding-bottom: 0rem;
        }
    </style>
""", unsafe_allow_html=True)

st.title("🌍 Global Environmental Explorer")
st.write("Check the real-time AQI, Weather and Traffic conditions for any location.")

# --- User Input ---
city_input = st.text_input("Enter a city name:", placeholder="e.g., Tokyo, London, Delhi")

if city_input:
    with st.spinner(f"Analyzing {city_input.title()}..."):
        
        # 1. Get coordinates
        lat, lon = get_coordinates(city_input)
        
        if lat is None or lon is None:
            st.error("Could not find that location. Please check the spelling.")
        else:
            # 2. Fetch Data from Independent Components
            aqi, color, aqi_error = get_aqi_data(lat, lon, city_input)
            temp, condition, humidity, weather_error = get_weather_data(lat, lon)
            current_speed, free_flow, traffic_status, traffic_error = get_traffic_data(lat, lon)
            
            # --- Dashboard Display ---
            st.markdown("### 🌍 Real-time Data")
            col1, col2, col3, col4, col5 = st.columns(5)
            
            col1.metric("Location", city_input.title())
            col2.metric("Current AQI", aqi if not aqi_error else "N/A")
            
            if not weather_error:
                col3.metric("Temp", f"{temp}°C")
                col4.metric("Weather", f"{condition} ({humidity}%)")
            else:
                col3.error("No Weather")
                
            if not traffic_error:
                speed_diff = current_speed - free_flow
                col5.metric("Traffic", traffic_status, delta=f"{speed_diff} km/h", delta_color="inverse")
            else:
                col5.error("No Traffic")
                
            st.markdown("---")
            
            # 3. Build and display the 3D globe
            fig = create_globe(lat, lon, city_input, aqi, color)
            st.plotly_chart(fig, use_container_width=True)

else:
    st.info("Awaiting input...")
    fig = create_globe(20.0, 0.0, "Start", "-", "gray") 
    st.plotly_chart(fig, use_container_width=True)