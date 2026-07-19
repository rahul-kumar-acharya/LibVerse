from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=255)
    isbn = models.CharField(max_length=50, unique=True)
    author = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='books')
    quantity = models.PositiveIntegerField(default=0)
    available_quantity = models.PositiveIntegerField(default=0)
    shelf = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='book_covers/', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            # When creating a new book, default the available quantity to the total quantity
            self.available_quantity = self.quantity
        else:
            try:
                original = Book.objects.get(pk=self.pk)
                if original.quantity != self.quantity:
                    difference = self.quantity - original.quantity
                    self.available_quantity = max(0, self.available_quantity + difference)
            except Book.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.isbn})"
