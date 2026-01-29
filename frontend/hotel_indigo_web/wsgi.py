# hotel_indigo_web/wsgi.py

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_indigo_web.settings')

application = get_wsgi_application()