from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuPlatoViewSet

router = DefaultRouter()
router.register(r'menu-platos', MenuPlatoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]