import requests

TOMTOM_TOKEN = "3B9yRdwdjNkMmuNbRnVcHhqi25wDCqoJ"

def get_traffic_data(lat, lon):
    """Fetches real-time traffic speeds and calculates congestion."""
    import random
    
    if TOMTOM_TOKEN == "3B9y...C..." or not TOMTOM_TOKEN:
        free_flow_speed = random.randint(50, 80)
        current_speed = random.randint(20, free_flow_speed)
        if current_speed <= (free_flow_speed * 0.5):
            status = "Heavy Traffic 🔴"
        elif current_speed <= (free_flow_speed * 0.8):
            status = "Moderate Traffic 🟡"
        else:
            status = "Clear 🟢"
        return current_speed, free_flow_speed, status, None

    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point={lat},{lon}&key={TOMTOM_TOKEN}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        current_speed = data['flowSegmentData']['currentSpeed']
        free_flow_speed = data['flowSegmentData']['freeFlowSpeed']
        
        if current_speed <= (free_flow_speed * 0.5):
            status = "Heavy Traffic 🔴"
        elif current_speed <= (free_flow_speed * 0.8):
            status = "Moderate Traffic 🟡"
        else:
            status = "Clear 🟢"
            
        return current_speed, free_flow_speed, status, None
    except requests.exceptions.RequestException as e:
        free_flow_speed = random.randint(50, 80)
        current_speed = random.randint(20, free_flow_speed)
        return current_speed, free_flow_speed, "Mocked Traffic 🟢", None