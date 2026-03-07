import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def enviar_verificacion(destinatario: str, nombre: str, token: str):
    """Send email verification link to the new user."""
    url_verificacion = f"{settings.frontend_url}/auth/verify?token={token}"

    html = f"""
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #09090B; color: #FAFAF9; padding: 48px 40px; border: 1px solid #27272A;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 40px;">
            <div style="width: 18px; height: 18px; border: 1px solid #E8FF47; display: flex; align-items: center; justify-content: center;">
                <div style="width: 7px; height: 7px; background: #E8FF47;"></div>
            </div>
            <span style="font-size: 11px; letter-spacing: 0.35em; font-weight: 700;">FINTRACK</span>
        </div>

        <h1 style="font-size: 24px; font-weight: 300; margin: 0 0 16px; letter-spacing: -0.02em;">Confirma tu email</h1>
        <p style="color: #71717A; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
            Hola <strong style="color: #E4E4E7;">{nombre}</strong>, gracias por registrarte en FinTrack.
            Haz clic en el botón para verificar tu dirección de correo electrónico.
        </p>

        <a href="{url_verificacion}"
           style="display: inline-block; background: #E8FF47; color: #000; padding: 14px 32px; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.15em;">
            VERIFICAR EMAIL
        </a>

        <p style="color: #3F3F46; font-size: 11px; margin-top: 40px; line-height: 1.5;">
            Si no has creado una cuenta en FinTrack, puedes ignorar este mensaje.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1C1C1F;">
            <span style="font-size: 9px; letter-spacing: 0.2em; color: #27272A;">© 2026 FINTRACK · CIFRADO AES-256 · DATOS 100% PRIVADOS</span>
        </div>
    </div>
    """

    _enviar(destinatario, "Confirma tu email — FinTrack", html)


def notificar_admin(nombre: str, apellidos: str, email: str):
    """Notify admin about a new user registration."""
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="margin: 0 0 16px;">🚀 Nuevo registro en FinTrack</h2>
        <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nombre</td><td style="padding: 8px; border: 1px solid #ddd;">{nombre} {apellidos}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">{email}</td></tr>
        </table>
    </div>
    """

    try:
        _enviar(settings.admin_email, f"Nuevo usuario: {nombre} {apellidos}", html)
    except Exception:
        pass  # Don't block registration if admin email fails


def _enviar(destinatario: str, asunto: str, html: str):
    """Low-level SMTP send via Gmail."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = asunto
    msg["From"] = f"FinTrack <{settings.smtp_email}>"
    msg["To"] = destinatario
    msg.attach(MIMEText(html, "html"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as server:
        server.login(settings.smtp_email, settings.smtp_password)
        server.sendmail(settings.smtp_email, destinatario, msg.as_string())
