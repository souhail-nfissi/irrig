from sqlalchemy import Column, Integer, String
from app.db.base_class import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    role = Column(String, default="user")       # e.g. "admin", "moderator", "user"

    crops = relationship("Crop", back_populates="user")
