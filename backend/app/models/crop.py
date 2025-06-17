from sqlalchemy import Column, String, Float, Integer, ForeignKey, PrimaryKeyConstraint
from app.db.base_class import Base
from sqlalchemy.orm import relationship

class Crop(Base):
    __tablename__ = "crops"

    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    Kc = Column(Float, nullable=False)
    CEemax = Column(Float, nullable=False)
    H = Column(Integer, nullable=False)
    f = Column(Float, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("name", "user_id"),
    )

    user = relationship("User", back_populates="crops")
