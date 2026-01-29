from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlatoViewSet, AlergenoViewSet

router = DefaultRouter()
router.register(r'platos', PlatoViewSet)
router.register(r'alergenos', AlergenoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]