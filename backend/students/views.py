from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Student
from .serializers import StudentSerializer

class StudentResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('name')
    serializer_class = StudentSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StudentResultsPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'roll_number', 'department']
