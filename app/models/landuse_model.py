from pydantic import BaseModel
from typing import Optional

class LanduseByH3(BaseModel):
    id: str 
    osm_id : str
    name: str
    landuse_type: str
    leisure: str
    city: str
    area: str
    geometry: bytes
    created_at: Optional[str] = None
    
    class Config:
        orm_mode = True
