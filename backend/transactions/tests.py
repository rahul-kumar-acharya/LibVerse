from decimal import Decimal
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from books.models import Book, Category
from students.models import Student
from transactions.models import Transaction

User = get_user_model()

class TransactionAPITests(APITestCase):
    def setUp(self):
        # Create category and book for testing stock management
        self.category = Category.objects.create(name="Science Fiction")
        self.book = Book.objects.create(
            title="Dune",
            author="Frank Herbert",
            isbn="9780441172719",
            category=self.category,
            quantity=5,
            available_quantity=5,
            publisher="Test Publisher"
        )

        # Create admin role user
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@test.com",
            password="adminpassword",
            role="admin",
            first_name="Admin"
        )

        # Create student role user and profile
        self.student_user = User.objects.create_user(
            username="student_user",
            email="student@test.com",
            password="studentpassword",
            role="student",
            first_name="Student"
        )
        self.student_profile = Student.objects.create(
            user=self.student_user,
            name="Test Student",
            roll_number="STU1001",
            department="CSE",
            semester="5th"
        )

        self.issue_url = reverse('transaction-issue')

    def test_admin_can_issue_book_decrements_stock(self):
        self.client.force_authenticate(user=self.admin_user)
        
        return_date = timezone.localdate() + timezone.timedelta(days=10)
        data = {
            "student_id": self.student_profile.id,
            "book_id": self.book.id,
            "return_date": str(return_date)
        }

        response = self.client.post(self.issue_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify book stock decremented
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_quantity, 4)

        # Verify transaction record created
        self.assertEqual(Transaction.objects.count(), 1)
        transaction = Transaction.objects.first()
        self.assertEqual(transaction.status, 'issued')
        self.assertEqual(transaction.student, self.student_profile)

    def test_student_role_cannot_issue_book(self):
        self.client.force_authenticate(user=self.student_user)
        
        return_date = timezone.localdate() + timezone.timedelta(days=10)
        data = {
            "student_id": self.student_profile.id,
            "book_id": self.book.id,
            "return_date": str(return_date)
        }

        response = self.client.post(self.issue_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify stock remains unchanged
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_quantity, 5)

    def test_cannot_issue_out_of_stock_book(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Set book out of stock
        self.book.available_quantity = 0
        self.book.save()

        return_date = timezone.localdate() + timezone.timedelta(days=10)
        data = {
            "student_id": self.student_profile.id,
            "book_id": self.book.id,
            "return_date": str(return_date)
        }

        response = self.client.post(self.issue_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_can_return_book_and_calculates_fine(self):
        # Create an existing transaction that is late (due 5 days ago)
        due_date = timezone.localdate() - timezone.timedelta(days=5)
        transaction = Transaction.objects.create(
            student=self.student_profile,
            book=self.book,
            return_date=due_date,
            status='issued'
        )
        self.book.available_quantity = 4
        self.book.save()

        self.client.force_authenticate(user=self.admin_user)
        
        return_url = reverse('transaction-return-book', args=[transaction.id])
        response = self.client.post(return_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify stock incremented
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_quantity, 5)

        # Verify transaction status
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'returned')
        self.assertIsNotNone(transaction.actual_return_date)
        
        # Late fine: 5 days * ₹10 = ₹50
        self.assertEqual(transaction.fine, Decimal('50.00'))

    def test_cannot_issue_more_than_5_books(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Create 5 existing issued transactions for this student
        for i in range(5):
            book = Book.objects.create(
                title=f"Book {i}",
                isbn=f"ISBN-TEST-{i}",
                author="Author",
                publisher="Pub",
                category=self.category,
                quantity=1,
                available_quantity=0
            )
            Transaction.objects.create(
                student=self.student_profile,
                book=book,
                return_date=timezone.localdate() + timezone.timedelta(days=7),
                status='issued'
            )

        # Attempt to issue 6th book
        return_date = timezone.localdate() + timezone.timedelta(days=10)
        data = {
            "student_id": self.student_profile.id,
            "book_id": self.book.id,
            "return_date": str(return_date)
        }
        response = self.client.post(self.issue_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("student_id", response.data)

    def test_cannot_issue_duplicate_book_to_same_student(self):
        self.client.force_authenticate(user=self.admin_user)
        
        # Issue book to student first
        Transaction.objects.create(
            student=self.student_profile,
            book=self.book,
            return_date=timezone.localdate() + timezone.timedelta(days=7),
            status='issued'
        )
        self.book.available_quantity = 4
        self.book.save()

        # Attempt to issue the exact same book to student again
        return_date = timezone.localdate() + timezone.timedelta(days=10)
        data = {
            "student_id": self.student_profile.id,
            "book_id": self.book.id,
            "return_date": str(return_date)
        }
        response = self.client.post(self.issue_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("book_id", response.data)
