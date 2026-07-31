import os
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from books.models import Book, Category
from students.models import Student

User = get_user_model()

# 1. Create Admin User
admin_username = 'lib_admin'
admin_password = 'AdminPassword123!'
admin_email = 'admin@libverse.com'

admin_user, created = User.objects.get_or_create(
    username=admin_username,
    defaults={
        'email': admin_email,
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin_user.set_password(admin_password)
    admin_user.save()
    print(f"Admin created: {admin_username} / {admin_password}")
else:
    print(f"Admin already exists: {admin_username}")

# 2. Create Categories & Books
categories_data = {
    'Science': [
        {'title': 'A Brief History of Time', 'isbn': '9780553380163', 'author': 'Stephen Hawking', 'publisher': 'Bantam Books', 'quantity': 5, 'shelf': 'A-1'},
        {'title': 'The Selfish Gene', 'isbn': '9780199291151', 'author': 'Richard Dawkins', 'publisher': 'Oxford University Press', 'quantity': 3, 'shelf': 'A-2'},
    ],
    'Technology': [
        {'title': 'Clean Code', 'isbn': '9780132350884', 'author': 'Robert C. Martin', 'publisher': 'Prentice Hall', 'quantity': 8, 'shelf': 'T-1'},
        {'title': 'Design Patterns', 'isbn': '9780201633610', 'author': 'Erich Gamma', 'publisher': 'Addison-Wesley', 'quantity': 4, 'shelf': 'T-3'},
    ],
    'Fiction': [
        {'title': 'To Kill a Mockingbird', 'isbn': '9780446310789', 'author': 'Harper Lee', 'publisher': 'Grand Central Publishing', 'quantity': 6, 'shelf': 'F-1'},
        {'title': '1984', 'isbn': '9780451524935', 'author': 'George Orwell', 'publisher': 'Signet Classic', 'quantity': 10, 'shelf': 'F-2'},
    ],
}

for cat_name, books in categories_data.items():
    category, _ = Category.objects.get_or_create(name=cat_name)
    for b in books:
        book, b_created = Book.objects.get_or_create(
            isbn=b['isbn'],
            defaults={
                'title': b['title'],
                'author': b['author'],
                'publisher': b['publisher'],
                'category': category,
                'quantity': b['quantity'],
                'shelf': b['shelf']
            }
        )
        if b_created:
            print(f"Book created: {book.title}")

# 3. Create Students (both Active Student accounts and Pre-authorized profiles)
students_data = [
    {
        'username': 'student_alice',
        'password': 'AlicePassword123!',
        'email': 'alice@libverse.com',
        'name': 'Alice Smith',
        'roll_number': 'CS202601',
        'department': 'Computer Science',
        'semester': 'Semester 4',
        'phone': '9876543210'
    },
    {
        'username': 'student_bob',
        'password': 'BobPassword123!',
        'email': 'bob@libverse.com',
        'name': 'Bob Johnson',
        'roll_number': 'EE202602',
        'department': 'Electrical Engineering',
        'semester': 'Semester 6',
        'phone': '8765432109'
    },
]

for s in students_data:
    user, u_created = User.objects.get_or_create(
        username=s['username'],
        defaults={
            'email': s['email'],
            'role': 'student'
        }
    )
    if u_created:
        user.set_password(s['password'])
        user.save()
        
    student, s_created = Student.objects.get_or_create(
        roll_number=s['roll_number'],
        defaults={
            'user': user,
            'name': s['name'],
            'email': s['email'],
            'department': s['department'],
            'semester': s['semester'],
            'phone': s['phone']
        }
    )
    if s_created:
        print(f"Student active account created: {student.name}")

# Create userless pre-authorized student profiles (for self-registration)
pre_authorized_data = [
    {
        'name': 'Charlie Davis',
        'roll_number': 'ME202603',
        'department': 'Mechanical Engineering',
        'semester': 'Semester 2',
        'phone': '7654321098',
        'email': 'charlie@libverse.com'
    },
    {
        'name': 'Diana Prince',
        'roll_number': 'CE202604',
        'department': 'Civil Engineering',
        'semester': 'Semester 8',
        'phone': '6543210987',
        'email': 'diana@libverse.com'
    }
]

for s in pre_authorized_data:
    student, created = Student.objects.get_or_create(
        roll_number=s['roll_number'],
        defaults={
            'user': None,
            'name': s['name'],
            'email': s['email'],
            'department': s['department'],
            'semester': s['semester'],
            'phone': s['phone']
        }
    )
    if created:
        print(f"Pre-authorized student profile created: {student.name}")
