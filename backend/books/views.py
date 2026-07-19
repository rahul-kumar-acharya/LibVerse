from rest_framework import viewsets, permissions, filters
from django.db.models import Count
from rest_framework.pagination import PageNumberPagination

from .models import Category, Book
from .serializers import CategorySerializer, BookSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(book_count=Count('books')).order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None # Categories list usually doesn't need pagination, simple list is better

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-id')
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'isbn']

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category', None)
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
            
        status = self.request.query_params.get('status', None)
        if status == 'available':
            queryset = queryset.filter(available_quantity__gt=0)
        elif status == 'out_of_stock':
            queryset = queryset.filter(available_quantity=0)
            
        return queryset
