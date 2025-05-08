from sqlalchemy import Column, String, Float, Integer
from app.db.base_class import Base

class Crop(Base):
    __tablename__ = "crops"

    name = Column(String, primary_key=True, index=True)
    Kc = Column(Float, nullable=False)
    CEemax = Column(Float, nullable=False)
    H = Column(Integer, nullable=False)
    f = Column(Float, nullable=False)
