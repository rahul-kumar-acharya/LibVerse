from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from books.models import Book, Category

User = get_user_model()

class BookPermissionTests(APITestCase):
    def setUp(self):
        # Create category and book
        self.category = Category.objects.create(name="Reference")
        self.book = Book.objects.create(
            title="Introduction to Algorithms",
            author="Thomas H. Cormen",
            isbn="9780262033848",
            category=self.category,
            quantity=10,
            available_quantity=10,
            publisher="MIT Press"
        )

        # Create admin
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@test.com",
            password="adminpassword",
            role="admin",
            first_name="Admin"
        )

        # Create student
        self.student_user = User.objects.create_user(
            username="student_user",
            email="student@test.com",
            password="studentpassword",
            role="student",
            first_name="Student"
        )

        self.list_url = reverse('book-list')
        self.detail_url = reverse('book-detail', args=[self.book.id])

    def test_student_can_list_books(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_student_cannot_create_book(self):
        self.client.force_authenticate(user=self.student_user)
        data = {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "isbn": "9780132350884",
            "category_id": self.category.id,
            "quantity": 5,
            "publisher": "Prentice Hall"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_book(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "isbn": "9780132350884",
            "category_id": self.category.id,
            "quantity": 5,
            "publisher": "Prentice Hall"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_delete_book(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_book(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_model_level_quantity_update_adjusts_available_quantity(self):
        # 1. Create a book with quantity 10. Available should be 10.
        book = Book.objects.create(
            title="Model Save Test Book",
            isbn="978-0131102217",
            author="Author",
            publisher="Pub",
            category=self.category,
            quantity=10,
        )
        self.assertEqual(book.available_quantity, 10)

        # 2. Simulate borrowing: decrement available_quantity directly to 7
        book.available_quantity = 7
        book.save()
        self.assertEqual(book.available_quantity, 7)

        # 3. Simulate editing quantity: change quantity to 15 (increase of 5)
        book.quantity = 15
        book.save()
        
        book.refresh_from_db()
        # available_quantity should increase by 5 (7 + 5 = 12)
        self.assertEqual(book.available_quantity, 12)

        # 4. Simulate decreasing quantity: change quantity to 8 (decrease of 7)
        book.quantity = 8
        book.save()
        
        book.refresh_from_db()
        # available_quantity should decrease by 7 (12 - 7 = 5)
        self.assertEqual(book.available_quantity, 5)
