"""
Brevo (Sendinblue) email utility module.

Provides helper functions that call the Brevo HTTP API to send
transactional and marketing emails. Works on DigitalOcean where
SMTP ports (25, 465, 587) are blocked.

Usage:
    from messages_app.email_utils import send_transactional_email, send_bulk_email
"""

import logging
from typing import Dict, List, Optional
from django.conf import settings

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

logger = logging.getLogger(__name__)


def _get_api_instance():
    """Return a configured Brevo TransactionalEmailsApi instance."""
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY
    return sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )


def _get_contacts_api():
    """Return a configured Brevo ContactsApi instance."""
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY
    return sib_api_v3_sdk.ContactsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )


# ────────────────────────────────────────────────────────────────────
# Transactional emails (one-to-one: welcome, confirmation, notification)
# ────────────────────────────────────────────────────────────────────

def send_transactional_email(
    to_email: str,
    to_name: str,
    subject: str,
    html_content: str,
    text_content: str = '',
    reply_to_email: Optional[str] = None,
) -> bool:
    """
    Send a single transactional email via the Brevo API.

    Args:
        to_email: Recipient email address.
        to_name: Recipient display name.
        subject: Email subject line.
        html_content: HTML body of the email.
        text_content: Optional plain-text fallback.
        reply_to_email: Optional reply-to address.

    Returns:
        True if the email was accepted by Brevo, False otherwise.
    """
    if not settings.BREVO_API_KEY:
        logger.warning('BREVO_API_KEY is not set — email not sent to %s', to_email)
        # In DEBUG mode, log the email content for development
        if settings.DEBUG:
            logger.info(
                '[DEV EMAIL] To: %s <%s> | Subject: %s\n%s',
                to_name, to_email, subject, html_content[:500],
            )
        return False

    api_instance = _get_api_instance()

    sender = {
        'name': settings.BREVO_SENDER_NAME,
        'email': settings.BREVO_SENDER_EMAIL,
    }
    to = [{'email': to_email, 'name': to_name}]

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        sender=sender,
        to=to,
        subject=subject,
        html_content=html_content,
        text_content=text_content or None,
    )

    if reply_to_email:
        send_smtp_email.reply_to = {'email': reply_to_email}

    try:
        api_instance.send_transac_email(send_smtp_email)
        logger.info('Email sent to %s: %s', to_email, subject)
        return True
    except ApiException as exc:
        logger.error('Brevo API error sending to %s: %s', to_email, exc)
        return False


# ────────────────────────────────────────────────────────────────────
# Bulk / broadcast emails
# ────────────────────────────────────────────────────────────────────

def send_bulk_email(
    recipients: List[Dict],
    subject: str,
    html_content: str,
    text_content: str = '',
) -> Dict:
    """
    Send the same email to multiple recipients via the Brevo API.

    Brevo's transactional endpoint supports up to 99 BCC per call.
    This function chunks the recipient list into batches and sends
    each batch as a separate API call.

    Args:
        recipients: List of dicts, each with 'email' and optionally 'name'.
        subject: Email subject line.
        html_content: HTML body.
        text_content: Optional plain-text fallback.

    Returns:
        Dict with 'sent' (int) and 'failed' (int) counts.
    """
    if not settings.BREVO_API_KEY:
        logger.warning('BREVO_API_KEY not set — bulk email aborted (%d recipients)', len(recipients))
        return {'sent': 0, 'failed': len(recipients)}

    api_instance = _get_api_instance()
    sender = {
        'name': settings.BREVO_SENDER_NAME,
        'email': settings.BREVO_SENDER_EMAIL,
    }

    BATCH_SIZE = 50  # keep batches small to avoid rate limits
    sent = 0
    failed = 0

    for i in range(0, len(recipients), BATCH_SIZE):
        batch = recipients[i:i + BATCH_SIZE]
        bcc_list = [
            {'email': r['email'], 'name': r.get('name', '')}
            for r in batch
        ]

        # Send to self (sender) and BCC all recipients so no one
        # can see other recipients' email addresses.
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            sender=sender,
            to=[{'email': sender['email'], 'name': sender['name']}],
            bcc=bcc_list,
            subject=subject,
            html_content=html_content,
            text_content=text_content or None,
        )

        try:
            api_instance.send_transac_email(send_smtp_email)
            sent += len(batch)
            logger.info('Bulk email batch sent: %d recipients', len(batch))
        except ApiException as exc:
            failed += len(batch)
            logger.error('Brevo bulk email batch failed: %s', exc)

    return {'sent': sent, 'failed': failed}


def send_bulk_email_tracked(
    recipients: List[Dict],
    subject: str,
    html_content: str,
    text_content: str = '',
) -> Dict:
    """
    Like send_bulk_email but returns per-batch detail for delivery logging.

    Returns:
        Dict with keys:
          'sent'    — total successful recipient count
          'failed'  — total failed recipient count
          'batches' — list of {'emails': [...], 'success': bool, 'error': str}
    """
    if not settings.BREVO_API_KEY:
        logger.warning('BREVO_API_KEY not set — bulk email aborted (%d recipients)', len(recipients))
        all_emails = [r['email'] for r in recipients]
        return {
            'sent': 0,
            'failed': len(recipients),
            'batches': [{'emails': all_emails, 'success': False, 'error': 'BREVO_API_KEY not configured'}],
        }

    api_instance = _get_api_instance()
    sender = {
        'name': settings.BREVO_SENDER_NAME,
        'email': settings.BREVO_SENDER_EMAIL,
    }

    BATCH_SIZE = 50
    sent = 0
    failed = 0
    batches = []

    for i in range(0, len(recipients), BATCH_SIZE):
        batch = recipients[i:i + BATCH_SIZE]
        batch_emails = [r['email'] for r in batch]
        bcc_list = [
            {'email': r['email'], 'name': r.get('name', '')}
            for r in batch
        ]

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            sender=sender,
            to=[{'email': sender['email'], 'name': sender['name']}],
            bcc=bcc_list,
            subject=subject,
            html_content=html_content,
            text_content=text_content or None,
        )

        try:
            api_instance.send_transac_email(send_smtp_email)
            sent += len(batch)
            batches.append({'emails': batch_emails, 'success': True, 'error': ''})
            logger.info('Bulk email batch sent: %d recipients', len(batch))
        except ApiException as exc:
            failed += len(batch)
            batches.append({'emails': batch_emails, 'success': False, 'error': str(exc)[:500]})
            logger.error('Brevo bulk email batch failed: %s', exc)

    return {'sent': sent, 'failed': failed, 'batches': batches}


# ────────────────────────────────────────────────────────────────────
# Brevo Contact Management (for newsletter list sync)
# ────────────────────────────────────────────────────────────────────

def add_contact_to_brevo_list(email: str, attributes: Optional[Dict] = None) -> bool:
    """
    Add or update a contact in Brevo and assign them to the newsletter list.

    Args:
        email: The contact's email address.
        attributes: Optional dict of Brevo contact attributes (e.g. FIRSTNAME).

    Returns:
        True if successful, False otherwise.
    """
    list_id = settings.BREVO_NEWSLETTER_LIST_ID
    if not settings.BREVO_API_KEY or not list_id:
        logger.warning('Brevo API key or list ID not configured — contact not synced')
        return False

    api_instance = _get_contacts_api()

    create_contact = sib_api_v3_sdk.CreateContact(
        email=email,
        list_ids=[list_id],
        attributes=attributes or {},
        update_enabled=True,  # update if contact already exists
    )

    try:
        api_instance.create_contact(create_contact)
        logger.info('Contact added/updated in Brevo: %s', email)
        return True
    except ApiException as exc:
        logger.error('Brevo contact sync failed for %s: %s', email, exc)
        return False


def remove_contact_from_brevo_list(email: str) -> bool:
    """
    Remove a contact from the Brevo newsletter list (does not delete the contact).

    Args:
        email: The contact's email address.

    Returns:
        True if successful, False otherwise.
    """
    list_id = settings.BREVO_NEWSLETTER_LIST_ID
    if not settings.BREVO_API_KEY or not list_id:
        return False

    api_instance = _get_contacts_api()

    contact_emails = sib_api_v3_sdk.RemoveContactFromList(emails=[email])

    try:
        api_instance.remove_contact_from_list(list_id, contact_emails)
        logger.info('Contact removed from Brevo list: %s', email)
        return True
    except ApiException as exc:
        logger.error('Brevo list removal failed for %s: %s', email, exc)
        return False
