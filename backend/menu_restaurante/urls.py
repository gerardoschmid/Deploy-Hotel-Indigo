from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuRestauranteViewSet

router = DefaultRouter()
router.register(r'menus', MenuRestauranteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]