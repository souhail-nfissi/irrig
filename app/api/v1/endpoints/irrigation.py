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
    calculate_ETc,
    calculate_Pe,
    calculate_NRn,
    calculate_RL,
    calculate_FL,
    calculate_Rt,
    calculate_Ea,
    calculate_Dn,
)
from fastapi import APIRouter

router = APIRouter()

@router.get("/calculateNRn", response_model=NRnOut)
def get_NRn(data: NRnInput):
    etc = calculate_ETc(data.Kc, data.ET0)
    pe = calculate_Pe(data.P)
    nrn = calculate_NRn(etc, pe)
    return NRnOut(
        ETc=round(etc, 2),
        Pe=round(pe, 2),
        NRn=round(nrn, 2),
    )

@router.get("/calculateEa", response_model=EaOut)
def get_Ea(data: EaInput):
    RL = calculate_RL(CEa=data.CEa, CEemax=data.CEemax)
    FL = calculate_FL(EL=data.EL, RL=RL)
    Rt = calculate_Rt(H=data.H, climate=data.climate, texture=data.texture)
    Ea = calculate_Ea(Rt=Rt, CU=data.CU, FL=FL)

    return EaOut(
        Ea=round(Ea, 2),
        Rt=round(Rt, 2),
        RL=round(RL, 2),
        FL=round(FL, 2),
    )


@router.get("/calculateNRt", response_model=NRtOut)
def get_NRt(data: NRtInput):
    NRnOut = get_NRn(NRnInput(**dict(data)))
    EaOut = get_Ea(EaInput(**dict(data)))

    return NRtOut(
        NRt=round(NRnOut.NRn/EaOut.Ea, 2),
        NRn=round(NRnOut.NRn, 2),
        Ea=round(EaOut.Ea, 2),
    )

@router.get("/calculateDn", response_model=DnOut)
def get_Dn(data: DnInput):
    return DnOut(
        Dn=calculate_Dn(**dict(data)),
    )

@router.get("/calculateDt", response_model=DtOut)
def get_Dt(data: DtInput):
    DnOut = get_Dn(DnInput(**dict(data)))
    EaOut = get_Ea(EaInput(**dict(data)))

    return DtOut(
        Dt=round(DnOut.Dn/EaOut.Ea, 2),
        Dn=round(DnOut.Dn, 2),
        Ea=round(EaOut.Ea, 2),
    )
