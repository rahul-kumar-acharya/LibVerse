from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from students.models import Student

User = get_user_model()

class AccountRegistrationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        
    def test_student_self_registration_creates_profile(self):
        data = {
            "username": "new_student",
            "email": "new@student.com",
            "password": "strongpassword123",
            "name": "New Student",
            "roll_number": "STU_NEW_999",
            "department": "IT",
            "semester": "3rd",
            "phone": "9876543210"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user account created
        self.assertTrue(User.objects.filter(username="new_student").exists())
        user = User.objects.get(username="new_student")
        self.assertEqual(user.role, 'student')
        
        # Verify student profile created
        self.assertTrue(Student.objects.filter(roll_number="STU_NEW_999").exists())
        profile = Student.objects.get(roll_number="STU_NEW_999")
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.name, "New Student")
        
    def test_student_registration_claims_userless_profile(self):
        # Create userless student profile pre-registered by librarian
        unlinked_profile = Student.objects.create(
            name="Jane Doe",
            roll_number="JANE_ROLL_100",
            department="CSE",
            semester="4th",
            phone="1111111111",
            email="jane@college.edu",
            user=None
        )
        
        data = {
            "username": "jane_doe",
            "email": "jane_updated@college.edu",
            "password": "strongpassword123",
            "name": "Jane Doe Updated",
            "roll_number": "JANE_ROLL_100",
            "department": "CSE",
            "semester": "5th",
            "phone": "2222222222"
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user created
        self.assertTrue(User.objects.filter(username="jane_doe").exists())
        user = User.objects.get(username="jane_doe")
        
        # Verify profile updated and linked
        unlinked_profile.refresh_from_db()
        self.assertEqual(unlinked_profile.user, user)
        self.assertEqual(unlinked_profile.name, "Jane Doe Updated")
        self.assertEqual(unlinked_profile.semester, "5th")
        self.assertEqual(unlinked_profile.phone, "2222222222")
        self.assertEqual(unlinked_profile.email, "jane_updated@college.edu")

    def test_student_registration_fails_if_roll_number_has_user_linked(self):
        # Create student profile that already has an account
        existing_user = User.objects.create_user(
            username="existing_student",
            email="exist@student.com",
            password="pwd"
        )
        Student.objects.create(
            user=existing_user,
            name="Existing Student",
            roll_number="ROLL_EXIST_999",
            department="ECE",
            semester="6th",
            phone="123456"
        )
        
        data = {
            "username": "new_student_try",
            "email": "newtry@student.com",
            "password": "strongpassword123",
            "name": "Try Student",
            "roll_number": "ROLL_EXIST_999",
            "department": "ECE",
            "semester": "7th",
            "phone": "999999"
        }
        
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("roll_number", response.data)
