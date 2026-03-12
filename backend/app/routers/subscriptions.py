from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import stripe
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.usuario import Usuario
from app.models.processed_webhook import WebhookEvent
from app.routers.deps import get_current_user
from app.config import settings

router = APIRouter()

stripe.api_key = settings.stripe_secret_key

class CreateCheckoutSessionRequest(BaseModel):
    plan: str # "pro" or "enterprise"

@router.post("/create-checkout-session")
async def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe no está configurado")

    if payload.plan == "pro":
        price_id = settings.stripe_pro_price_id
    elif payload.plan == "enterprise":
        price_id = settings.stripe_enterprise_price_id
    else:
        raise HTTPException(status_code=400, detail="Plan inválido")

    if not price_id:
        raise HTTPException(status_code=500, detail="Price ID de Stripe no configurado")

    try:
        # Check if user already has a Stripe customer ID
        customer_id = current_user.stripe_customer_id

        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=f"{current_user.nombre} {current_user.apellidos}",
                metadata={"user_id": current_user.id_usuario}
            )
            customer_id = customer.id
            current_user.stripe_customer_id = customer_id
            db.commit()

        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{settings.frontend_url}/dashboard?session_id={{CHECKOUT_SESSION_ID}}&success=true",
            cancel_url=f"{settings.frontend_url}/pricing?canceled=true",
            client_reference_id=str(current_user.id_usuario),
            subscription_data={
                 "metadata": {
                     "user_id": current_user.id_usuario
                 }
            }
        )
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(
    current_user: Usuario = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene un método de pago guardado.")
    
    try:
        session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url=f"{settings.frontend_url}/dashboard/settings",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Idempotency check 
    if db.query(WebhookEvent).filter(WebhookEvent.event_id == event.id).first():
        return {"status": "success", "message": "Already processed"}
        
    db.add(WebhookEvent(event_id=event.id))
    db.commit()

    # Handle the event
    data = event.data.object

    try:
        if event.type == 'checkout.session.completed':
            _handle_checkout_completed(data, db)
        elif event.type in ['customer.subscription.updated', 'customer.subscription.deleted']:
            _handle_subscription_changed(data, db)
        elif event.type == 'invoice.payment_failed':
            _handle_payment_failed(data, db)
        
        return {"status": "success"}
    except Exception as e:
        # We don't want stripe to retry if our code has a permanent bug, but logging is good
        print(f"Error handling webhook {event.type}: {e}")
        return {"status": "error", "message": "Server error processing webhook"}


def _handle_checkout_completed(session_obj, db: Session):
    customer_id = session_obj.get("customer")
    subscription_id = session_obj.get("subscription")
    client_reference_id = session_obj.get("client_reference_id")

    if not customer_id or not subscription_id:
        return

    # Find the user
    user = db.query(Usuario).filter(Usuario.stripe_customer_id == customer_id).first()
    if not user and client_reference_id:
         user = db.query(Usuario).filter(Usuario.id_usuario == int(client_reference_id)).first()

    if user:
        user.stripe_subscription_id = subscription_id
        user.subscription_status = "active"
        
        # We need to fetch the subscription details to know if it's pro or enterprise
        try:
           sub = stripe.Subscription.retrieve(subscription_id)
           price_id = sub.items.data[0].price.id
           if price_id == settings.stripe_pro_price_id:
               user.subscription_tier = "pro"
           elif price_id == settings.stripe_enterprise_price_id:
               user.subscription_tier = "enterprise"
        except:
           pass

        if not user.stripe_customer_id:
           user.stripe_customer_id = customer_id
           
        db.commit()


def _handle_subscription_changed(subscription_obj, db: Session):
    customer_id = subscription_obj.get("customer")
    subscription_id = subscription_obj.id

    user = db.query(Usuario).filter(Usuario.stripe_customer_id == customer_id).first()
    if user:
        user.subscription_status = subscription_obj.status # active, past_due, canceled, unpaid
        user.stripe_subscription_id = subscription_id
        
        try:
           price_id = subscription_obj.items.data[0].price.id
           if price_id == settings.stripe_pro_price_id:
               user.subscription_tier = "pro"
           elif price_id == settings.stripe_enterprise_price_id:
               user.subscription_tier = "enterprise"
        except:
           pass
           
        db.commit()


def _handle_payment_failed(invoice_obj, db: Session):
    customer_id = invoice_obj.get("customer")
    user = db.query(Usuario).filter(Usuario.stripe_customer_id == customer_id).first()
    if user:
        # Let's mark them as past_due. The subscription.updated webhook will also likely fire.
        user.subscription_status = "past_due"
        db.commit()
