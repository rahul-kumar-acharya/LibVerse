from django.db import models
from django.conf import settings

class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile'
    )
    name = models.CharField(max_length=255)
    roll_number = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    semester = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return f"{self.name} ({self.roll_number})"
