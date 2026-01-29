# hotel_indigo_web/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Incluimos las URLs de nuestra app 'website' (el frontend)
    path('', include('website.urls')), 
]