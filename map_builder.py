import plotly.graph_objects as go

def create_globe(lat, lon, city_name, aqi_value, marker_color):
    """Generates an interactive 3D globe centered on the requested location."""
    
    fig = go.Figure(data=go.Scattergeo(
        lon=[lon],
        lat=[lat],
        text=[f"<b>{city_name.title()}</b><br>AQI: {aqi_value}"],
        hoverinfo="text",
        mode='markers',
        marker=dict(
            size=20,
            color=marker_color,
            line=dict(width=3, color='rgba(255,255,255,0.8)'),
            opacity=0.9
        )
    ))

    # Configure the map to render as a 3D globe (orthographic projection)
    fig.update_geos(
        projection_type="orthographic",
        resolution=50,
        showcoastlines=True,
        coastlinecolor="#2c3e50",
        showcountries=True,
        countrycolor="#34495e",
        showocean=True,
        oceancolor="#154360", # Deep realistic ocean blue
        showland=True,
        landcolor="#196F3D",  # Natural earth green
        showlakes=True,
        lakecolor="#154360",
        center=dict(lat=lat, lon=lon), # Centers the globe on the searched city
        projection_rotation=dict(lon=lon, lat=lat, roll=0),
        bgcolor="rgba(0,0,0,0)"
    )

    # Style the layout
    fig.update_layout(
        margin={"r": 0, "t": 0, "l": 0, "b": 0},
        paper_bgcolor="rgba(0,0,0,0)", # Transparent background
        plot_bgcolor="rgba(0,0,0,0)",
        height=350 # Reduced height so everything fits without scrolling
    )
    
    return fig