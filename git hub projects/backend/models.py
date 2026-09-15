from pydantic import BaseModel
from datetime import datetime

class SensorData(BaseModel):
    timestamp: datetime
    node_id: str
    wind_speed: float
    wind_direction: float
    temperature: float
    humidity: float
    pressure: float
    precipitation: float

class AircraftData(BaseModel):
    timestamp: datetime
    aircraft_id: str
    latitude: float
    longitude: float
    altitude: float
    ias: float
    vertical_speed: float
    heading: float
