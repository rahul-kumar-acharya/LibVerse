from rest_framework import serializers
from .models import Student
from accounts.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    has_account = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = (
            'id', 'user', 'name', 'roll_number', 
            'department', 'semester', 'phone', 'email', 'has_account'
        )

    def get_has_account(self, obj):
        return obj.user is not None
