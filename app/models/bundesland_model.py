from pydantic import BaseModel

class Bundesland(BaseModel):
    id: int | None
    bundesland: str
    area: float
    geometry: bytes
    
    
    class Config:
        orm_mode = True
    