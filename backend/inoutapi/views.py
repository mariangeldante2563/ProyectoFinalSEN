from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

class RegistroUsuarioView(APIView):
    def post(self, request):
        # Aquí se procesarían los datos del registro
        # Por ahora solo retorna éxito simulado
        return Response({'mensaje': 'Registro recibido correctamente'}, status=status.HTTP_201_CREATED)
