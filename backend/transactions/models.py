from django.db import models
from django.utils import timezone
from decimal import Decimal
from books.models import Book
from students.models import Student

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('issued', 'Issued'),
        ('returned', 'Returned'),
    )

    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name='transactions')
    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name='transactions')
    issue_date = models.DateField(default=timezone.localdate)
    return_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='issued')
    fine = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def calculate_potential_fine(self):
        """Calculates the fine dynamically based on the current date if not returned yet."""
        if self.status == 'returned':
            return self.fine
        
        today = timezone.localdate()
        if today > self.return_date:
            days_late = (today - self.return_date).days
            return Decimal(days_late * 10)
        return Decimal('0.00')

    def __str__(self):
        return f"{self.book.title} issued to {self.student.name} ({self.status})"
