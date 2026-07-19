from rest_framework import serializers
from .models import Transaction
from books.models import Book
from students.models import Student
from books.serializers import BookSerializer
from students.serializers import StudentSerializer

class TransactionSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    book = BookSerializer(read_only=True)
    potential_fine = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = (
            'id', 'student', 'book', 'issue_date', 
            'return_date', 'actual_return_date', 'status', 
            'fine', 'potential_fine'
        )

    def get_potential_fine(self, obj):
        return obj.calculate_potential_fine()

class TransactionIssueSerializer(serializers.ModelSerializer):
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source='student',
        write_only=True
    )
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source='book',
        write_only=True
    )

    class Meta:
        model = Transaction
        fields = ('student_id', 'book_id', 'return_date')

    def validate_book_id(self, value):
        if value.available_quantity <= 0:
            raise serializers.ValidationError("This book is currently out of stock / unavailable.")
        return value

    def validate(self, data):
        student = data.get('student')
        book = data.get('book')
        issue_date = data.get('issue_date', timezone_now_date())
        return_date = data.get('return_date')
        
        if return_date and return_date < issue_date:
            raise serializers.ValidationError({"return_date": "Return date cannot be before issue date."})
            
        # 1. Check borrowing limits: maximum of 5 concurrent issues
        active_issues_count = Transaction.objects.filter(student=student, status='issued').count()
        if active_issues_count >= 5:
            raise serializers.ValidationError({"student_id": "This student has reached the maximum borrowing limit of 5 books."})
            
        # 2. Check for active loan of the exact same book
        existing_active_loan = Transaction.objects.filter(student=student, book=book, status='issued').exists()
        if existing_active_loan:
            raise serializers.ValidationError({"book_id": "This student already has an active issue record for this book."})
            
        return data

def timezone_now_date():
    from django.utils import timezone
    return timezone.localdate()
