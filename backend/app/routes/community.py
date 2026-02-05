"""Community content routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import CoffeeStory, CoffeeTip, Event
from pydantic import BaseModel

router = APIRouter()


class ContentListItem(BaseModel):
    id: int
    title: str
    content: str
    thumbnail_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class EventListItem(BaseModel):
    id: int
    title: str
    content: str | None = None
    thumbnail_url: str | None = None
    status: str
    push_on_publish: bool
    reward_points: int
    reward_coupon_id: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/coffee-stories", response_model=List[ContentListItem])
async def list_coffee_stories(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    return (
        db.query(CoffeeStory)
        .order_by(CoffeeStory.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/coffee-stories/{story_id}", response_model=ContentListItem)
async def get_coffee_story(
    story_id: int,
    db: Session = Depends(get_db)
):
    story = db.query(CoffeeStory).filter(CoffeeStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="커피스토리를 찾을 수 없습니다.")
    return story


@router.get("/coffee-tips", response_model=List[ContentListItem])
async def list_coffee_tips(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    return (
        db.query(CoffeeTip)
        .order_by(CoffeeTip.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/coffee-tips/{tip_id}", response_model=ContentListItem)
async def get_coffee_tip(
    tip_id: int,
    db: Session = Depends(get_db)
):
    tip = db.query(CoffeeTip).filter(CoffeeTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="커피 꿀팁을 찾을 수 없습니다.")
    return tip


@router.get("/events", response_model=List[EventListItem])
async def list_events(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    return (
        db.query(Event)
        .order_by(Event.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/events/{event_id}", response_model=EventListItem)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="이벤트를 찾을 수 없습니다.")
    return event
