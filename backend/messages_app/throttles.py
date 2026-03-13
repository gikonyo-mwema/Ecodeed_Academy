"""
Rate-limit classes for public-facing messages endpoints.

These protect the contact form and newsletter subscribe endpoints from
spam bots and abuse.  Rates are intentionally low because legitimate
visitors rarely submit these forms more than once per session.
"""

from rest_framework.throttling import AnonRateThrottle


class ContactFormThrottle(AnonRateThrottle):
    """5 contact-form submissions per IP per hour."""
    rate = "5/hour"
    scope = "contact_form"


class NewsletterSubscribeThrottle(AnonRateThrottle):
    """5 newsletter subscriptions per IP per hour."""
    rate = "5/hour"
    scope = "newsletter_subscribe"
