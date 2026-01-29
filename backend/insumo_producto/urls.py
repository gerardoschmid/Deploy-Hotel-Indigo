from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsumoProductoViewSet

router = DefaultRouter()
router.register(r'insumos', InsumoProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]