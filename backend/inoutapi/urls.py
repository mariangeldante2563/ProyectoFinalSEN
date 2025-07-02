from django.urls import path
from . import views

urlpatterns = [
    path('registro/', views.RegistroUsuarioView.as_view(), name='registro_usuario'),
]
