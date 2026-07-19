from rest_framework import serializers
from .models import Category, Book

class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = ('id', 'name', 'book_count')

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Book
        fields = (
            'id', 'title', 'isbn', 'author', 'publisher', 
            'category_id', 'category', 'category_name', 
            'quantity', 'available_quantity', 'shelf', 
            'description', 'cover_image'
        )
        read_only_fields = ('available_quantity',)
