from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalonEventoViewSet

router = DefaultRouter()
router.register(r'salones', SalonEventoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]