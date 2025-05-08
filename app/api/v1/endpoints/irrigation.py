from app.db.session import get_db
from sqlalchemy.orm import Session
from app.schemas.irrigation import (
    NRnInput,
    NRnOut,
    EaInput,
    EaOut,
    NRtInput,
    NRtOut,
    DnInput,
    DnOut,
    DtInput,
    DtOut,
)
from app.services.irrigation_service import (
    calculate_NRn,
    calculate_Ea,
    calculate_Dn,
)
from fastapi import APIRouter, Depends

router = APIRouter()

@router.get("/calculateNRn", response_model=NRnOut)
def get_NRn(data: NRnInput, db: Session = Depends(get_db)):
    NRn, Pe, ETc = calculate_NRn(db=db, **dict(data))
    return NRnOut(
        NRn=round(NRn, 2),
        Pe=round(Pe, 2),
        ETc=round(ETc, 2),
    )

@router.get("/calculateEa", response_model=EaOut)
def get_Ea(data: EaInput, db: Session = Depends(get_db)):
    Ea, Rt, RL, FL = calculate_Ea(db=db, **dict(data))

    return EaOut(
        Ea=round(Ea, 2),
        Rt=round(Rt, 2),
        RL=round(RL, 2),
        FL=round(FL, 2),
    )


@router.get("/calculateNRt", response_model=NRtOut)
def get_NRt(data: NRtInput, db: Session = Depends(get_db)):
    NRn, *_ = calculate_NRn(
        db=db,
        crop_name=data.crop_name,
        ET0=data.ET0,
        P=data.P,
    )
    Ea, *_ = calculate_Ea(
        db=db,
        crop_name=data.crop_name,
        CEa=data.CEa,
        EL=data.EL,
        texture=data.texture,
        climate=data.climate,
        CU=data.CU,
    )

    return NRtOut(
        NRt=round(NRn/Ea, 2),
        NRn=round(NRn, 2),
        Ea=round(Ea, 2),
    )

@router.get("/calculateDn", response_model=DnOut)
def get_Dn(data: DnInput, db: Session = Depends(get_db)):
    return DnOut(
        Dn=calculate_Dn(db=db, **dict(data)),
    )

@router.get("/calculateDt", response_model=DtOut)
def get_Dt(data: DtInput, db: Session = Depends(get_db)):
    Dn = calculate_Dn(
        db=db,
        crop_name=data.crop_name,
        Cc=data.Cc,
        Pm=data.Pm,
    )
    Ea, *_ = calculate_Ea(
        db=db,
        crop_name=data.crop_name,
        CEa=data.CEa,
        EL=data.EL,
        texture=data.texture,
        climate=data.climate,
        CU=data.CU,
    )

    return DtOut(
        Dt=round(Dn/Ea, 2),
        Dn=round(Dn, 2),
        Ea=round(Ea, 2),
    )
