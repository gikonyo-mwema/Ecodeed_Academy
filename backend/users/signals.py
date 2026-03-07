"""Signal Handlers for User Model Events."""

# NOTE: DRF Token auto-creation was removed.
# This project uses SimpleJWT for authentication — DRF authtoken rows
# were being created on every user signup but never used.
# rest_framework.authtoken remains in INSTALLED_APPS because
# dj_rest_auth lists it as a dependency.
