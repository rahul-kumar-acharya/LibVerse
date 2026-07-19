from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from students.models import Student

User = get_user_model()

class StudentAPITests(APITestCase):
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@test.com",
            password="adminpassword",
            role="admin"
        )
        
        # Create student user and profile
        self.student_user = User.objects.create_user(
            username="student_user",
            email="student@test.com",
            password="studentpassword",
            role="student"
        )
        self.student_profile = Student.objects.create(
            user=self.student_user,
            name="Alice Smith",
            roll_number="STU_ALICE",
            department="CSE",
            semester="4th",
            phone="1234567890",
            email="alice@test.com"
        )
        
        self.list_url = reverse('student-list')
        self.detail_url = reverse('student-detail', args=[self.student_profile.id])

    def test_admin_can_list_students(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)

    def test_admin_can_create_student_profile(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "name": "Bob Jones",
            "roll_number": "STU_BOB",
            "department": "ECE",
            "semester": "2nd",
            "phone": "0987654321",
            "email": "bob@test.com"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Student.objects.filter(roll_number="STU_BOB").exists())

    def test_student_cannot_list_students(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_delete_student_profile(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_student_profile(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Student.objects.filter(roll_number="STU_ALICE").exists())
