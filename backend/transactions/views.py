from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction as db_transaction
from django.utils import timezone
from decimal import Decimal
from datetime import date

from .models import Transaction
from .serializers import TransactionSerializer, TransactionIssueSerializer
from books.models import Book
from students.models import Student

class IsAdminOrStudentReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.user.role == 'admin':
                return True
            # Students can only perform read actions and can't issue/return books
            if request.method in permissions.SAFE_METHODS:
                return True
        return False

from rest_framework.pagination import PageNumberPagination

class TransactionResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    permission_classes = [IsAdminOrStudentReadOnly]
    serializer_class = TransactionSerializer
    pagination_class = TransactionResultsPagination

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Transaction.objects.none()
        
        # If the user is a student, filter to show only their own transactions
        if user.role == 'student':
            if hasattr(user, 'student_profile'):
                return Transaction.objects.filter(student=user.student_profile).order_by('-id')
            return Transaction.objects.none()
        
        # Admins see all transactions
        queryset = Transaction.objects.all().order_by('-id')
        
        # Optional query parameters to filter transactions
        status_param = self.request.query_params.get('status', None)
        if status_param in ['issued', 'returned']:
            queryset = queryset.filter(status=status_param)
            
        overdue_param = self.request.query_params.get('overdue', None)
        if overdue_param == 'true':
            today = timezone.localdate()
            queryset = queryset.filter(status='issued', return_date__lt=today)
            
        return queryset

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def issue(self, request):
        # Only admin is allowed to issue books
        if request.user.role != 'admin':
            return Response(
                {"detail": "Only administrators can issue books."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TransactionIssueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        student = serializer.validated_data['student']
        book = serializer.validated_data['book']
        return_date = serializer.validated_data['return_date']

        with db_transaction.atomic():
            # Double check stock
            # Refresh from DB with select_for_update to avoid race conditions
            book_db = Book.objects.select_for_update().get(pk=book.pk)
            if book_db.available_quantity <= 0:
                return Response(
                    {"book_id": ["This book is currently out of stock."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Decrement book available_quantity
            book_db.available_quantity -= 1
            book_db.save()

            # Create Transaction
            transaction_record = Transaction.objects.create(
                student=student,
                book=book_db,
                return_date=return_date,
                status='issued'
            )

        output_serializer = TransactionSerializer(transaction_record)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def return_book(self, request, pk=None):
        # Only admin is allowed to process returns
        if request.user.role != 'admin':
            return Response(
                {"detail": "Only administrators can process book returns."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            transaction_record = Transaction.objects.get(pk=pk)
        except Transaction.DoesNotExist:
            return Response(
                {"detail": "Transaction record not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if transaction_record.status == 'returned':
            return Response(
                {"detail": "This book has already been returned."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():
            # Mark book as returned
            book = Book.objects.select_for_update().get(pk=transaction_record.book.pk)
            book.available_quantity += 1
            book.save()

            # Update Transaction
            today = timezone.localdate()
            transaction_record.actual_return_date = today
            transaction_record.status = 'returned'

            # Calculate Fine: ₹10 per day late
            fine_amount = Decimal('0.00')
            if today > transaction_record.return_date:
                days_late = (today - transaction_record.return_date).days
                fine_amount = Decimal(days_late * 10)
            
            transaction_record.fine = fine_amount
            transaction_record.save()

        output_serializer = TransactionSerializer(transaction_record)
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def issued(self, request):
        """Returns all currently issued books with pagination."""
        queryset = self.get_queryset().filter(status='issued')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def returned(self, request):
        """Returns all returned books with pagination."""
        queryset = self.get_queryset().filter(status='returned')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Returns all overdue books with pagination."""
        today = timezone.localdate()
        queryset = self.get_queryset().filter(status='issued', return_date__lt=today)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard_stats(self, request):
        """Returns statistics and charts data for the dashboard."""
        from django.db.models import Sum, Count
        from books.models import Category
        today = timezone.localdate()
        
        # 1. Base counts
        total_copies = Book.objects.aggregate(total=Sum('quantity'))['total'] or 0
        available_copies = Book.objects.aggregate(total=Sum('available_quantity'))['total'] or 0
        issued_copies = Transaction.objects.filter(status='issued').count()
        total_students = Student.objects.count()
        
        today_issues = Transaction.objects.filter(issue_date=today).count()
        today_returns = Transaction.objects.filter(actual_return_date=today, status='returned').count()
        
        # 2. Category distribution
        categories_data = Category.objects.annotate(book_count=Count('books')).values('name', 'book_count')
        category_distribution = [
            {'category': item['name'], 'count': item['book_count']} 
            for item in categories_data if item['book_count'] > 0
        ]
        
        # 3. Recent lists
        user = request.user
        if user.role == 'student' and hasattr(user, 'student_profile'):
            recent_issues_qs = Transaction.objects.filter(student=user.student_profile, status='issued').order_by('-id')[:5]
            recent_returns_qs = Transaction.objects.filter(student=user.student_profile, status='returned').order_by('-id')[:5]
        else:
            recent_issues_qs = Transaction.objects.filter(status='issued').order_by('-id')[:5]
            recent_returns_qs = Transaction.objects.filter(status='returned').order_by('-id')[:5]
            
        recent_issues = TransactionSerializer(recent_issues_qs, many=True).data
        recent_returns = TransactionSerializer(recent_returns_qs, many=True).data
        
        return Response({
            'books_count': total_copies,
            'available_count': available_copies,
            'issued_count': issued_copies,
            'students_count': total_students,
            'today_issue_count': today_issues,
            'today_return_count': today_returns,
            'category_distribution': category_distribution,
            'recent_issues': recent_issues,
            'recent_returns': recent_returns
        })
