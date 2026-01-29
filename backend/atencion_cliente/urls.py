from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AtencionClienteViewSet

router = DefaultRouter()
router.register(r'atenciones', AtencionClienteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]