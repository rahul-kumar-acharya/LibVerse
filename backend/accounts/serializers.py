from rest_framework import serializers
from django.contrib.auth import get_user_model
from students.models import Student
from django.db import transaction

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name')
        read_only_fields = ('id', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    # Student specific fields
    name = serializers.CharField(max_length=255, write_only=True)
    roll_number = serializers.CharField(max_length=50, write_only=True)
    department = serializers.CharField(max_length=100, write_only=True)
    semester = serializers.CharField(max_length=20, write_only=True)
    phone = serializers.CharField(max_length=20, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'name', 'roll_number', 'department', 'semester', 'phone')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_roll_number(self, value):
        student = Student.objects.filter(roll_number=value).first()
        if student and student.user is not None:
            raise serializers.ValidationError("A student with this roll number already exists and has an account.")
        return value

    def create(self, validated_data):
        # Extract student details
        student_data = {
            'name': validated_data.pop('name'),
            'roll_number': validated_data.pop('roll_number'),
            'department': validated_data.pop('department'),
            'semester': validated_data.pop('semester'),
            'phone': validated_data.pop('phone'),
            'email': validated_data.get('email', '')
        }

        with transaction.atomic():
            # Create student user
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                role='student' # Default to student
            )
            
            # Check if there is an existing student record with user = None
            existing_student = Student.objects.filter(roll_number=student_data['roll_number'], user__isnull=True).first()
            if existing_student:
                # Link existing profile and update its fields with registered details
                existing_student.user = user
                existing_student.name = student_data['name']
                existing_student.department = student_data['department']
                existing_student.semester = student_data['semester']
                existing_student.phone = student_data['phone']
                existing_student.email = student_data['email']
                existing_student.save()
            else:
                # Create corresponding student profile
                Student.objects.create(user=user, **student_data)
            
        return user
