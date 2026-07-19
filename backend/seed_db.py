import os
import sys
import django
from datetime import date, timedelta
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from books.models import Category, Book
from students.models import Student
from transactions.models import Transaction

User = get_user_model()

def seed():
    print("Starting database seeding...")

    # 1. Create Users
    print("Creating admin and student accounts...")
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@library.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created or not admin_user.check_password('admin123'):
        admin_user.set_password('admin123')
        admin_user.save()
        print("Admin user created/updated (username: admin, password: admin123)")

    student_user, created = User.objects.get_or_create(
        username='student',
        defaults={
            'email': 'student@college.edu',
            'role': 'student'
        }
    )
    if created or not student_user.check_password('student123'):
        student_user.set_password('student123')
        student_user.save()
        print("Student user created/updated (username: student, password: student123)")

    # 2. Create Categories
    print("Creating categories...")
    categories_data = ["Programming", "Database", "AI", "Networking", "Mathematics", "Fiction"]
    categories = {}
    for name in categories_data:
        cat, created = Category.objects.get_or_create(name=name)
        categories[name] = cat
    print(f"Created {len(categories)} categories.")

    # 3. Create Books
    print("Creating books...")
    books_data = [
        {
            "title": "Clean Code",
            "isbn": "978-0132350884",
            "author": "Robert C. Martin",
            "publisher": "Prentice Hall",
            "category": categories["Programming"],
            "quantity": 10,
            "shelf": "A-1",
            "description": "A Handbook of Agile Software Craftsmanship."
        },
        {
            "title": "Introduction to Algorithms",
            "isbn": "978-0262033848",
            "author": "Thomas H. Cormen",
            "publisher": "MIT Press",
            "category": categories["Programming"],
            "quantity": 5,
            "shelf": "A-2",
            "description": "Comprehensive introduction to the modern study of computer algorithms."
        },
        {
            "title": "Database System Concepts",
            "isbn": "978-0073523323",
            "author": "Abraham Silberschatz",
            "publisher": "McGraw Hill",
            "category": categories["Database"],
            "quantity": 8,
            "shelf": "B-1",
            "description": "Fundamental concepts of database management and design."
        },
        {
            "title": "Artificial Intelligence: A Modern Approach",
            "isbn": "978-0136086208",
            "author": "Stuart Russell",
            "publisher": "Pearson",
            "category": categories["AI"],
            "quantity": 6,
            "shelf": "C-1",
            "description": "The leading textbook in Artificial Intelligence."
        },
        {
            "title": "Computer Networking: A Top-Down Approach",
            "isbn": "978-0133594140",
            "author": "James Kurose",
            "publisher": "Pearson",
            "category": categories["Networking"],
            "quantity": 7,
            "shelf": "D-3",
            "description": "Modern overview of computer networking principles and protocols."
        },
        {
            "title": "Calculus",
            "isbn": "978-0534393397",
            "author": "James Stewart",
            "publisher": "Cengage Learning",
            "category": categories["Mathematics"],
            "quantity": 12,
            "shelf": "M-2",
            "description": "Standard university textbook for single and multivariable calculus."
        },
        {
            "title": "Design Patterns",
            "isbn": "978-0201633610",
            "author": "Erich Gamma",
            "publisher": "Addison-Wesley",
            "category": categories["Programming"],
            "quantity": 4,
            "shelf": "A-4",
            "description": "Elements of Reusable Object-Oriented Software."
        },
        {
            "title": "The Hobbit",
            "isbn": "978-0261102217",
            "author": "J.R.R. Tolkien",
            "publisher": "George Allen & Unwin",
            "category": categories["Fiction"],
            "quantity": 15,
            "shelf": "F-1",
            "description": "Classic fantasy novel set in Middle-earth."
        }
    ]

    books = []
    for b_data in books_data:
        book, created = Book.objects.get_or_create(
            isbn=b_data["isbn"],
            defaults=b_data
        )
        if not created:
            # Update quantities
            book.quantity = b_data["quantity"]
            book.available_quantity = b_data["quantity"]
            book.save()
        books.append(book)
    print(f"Created/updated {len(books)} books.")

    # 4. Create Students
    print("Creating students...")
    students_data = [
        {
            "name": "Rahul Sharma",
            "roll_number": "CS202301",
            "department": "Computer Science",
            "semester": "6th",
            "phone": "9876543210",
            "email": "rahul.sharma@college.edu",
            "user": student_user # Connect the test student user to this profile
        },
        {
            "name": "Aanya Patel",
            "roll_number": "IT202315",
            "department": "Information Technology",
            "semester": "6th",
            "phone": "8765432109",
            "email": "aanya.patel@college.edu"
        },
        {
            "name": "Vikram Singh",
            "roll_number": "EE202208",
            "department": "Electrical Engineering",
            "semester": "8th",
            "phone": "7654321098",
            "email": "vikram.singh@college.edu"
        },
        {
            "name": "Sneha Gupta",
            "roll_number": "ME202412",
            "department": "Mechanical Engineering",
            "semester": "4th",
            "phone": "6543210987",
            "email": "sneha.gupta@college.edu"
        },
        {
            "name": "Amit Verma",
            "roll_number": "CS202305",
            "department": "Computer Science",
            "semester": "6th",
            "phone": "9898989898",
            "email": "amit.verma@college.edu"
        }
    ]

    students = []
    for s_data in students_data:
        student, created = Student.objects.get_or_create(
            roll_number=s_data["roll_number"],
            defaults=s_data
        )
        if not created and "user" in s_data and s_data["user"] is not None:
            student.user = s_data["user"]
            student.save()
        students.append(student)
    print(f"Created {len(students)} students.")

    # 5. Create Transactions
    print("Creating transaction history...")
    # Clear existing to avoid double decrement issues on repeat runs
    Transaction.objects.all().delete()
    
    # Reset book available quantities
    for book in Book.objects.all():
        book.available_quantity = book.quantity
        book.save()

    today = date.today()

    # Transaction 1: Returned book (No Fine)
    t1 = Transaction.objects.create(
        student=students[0],
        book=books[0], # Clean Code (Qty: 10)
        issue_date=today - timedelta(days=12),
        return_date=today - timedelta(days=2),
        actual_return_date=today - timedelta(days=3),
        status='returned',
        fine=Decimal('0.00')
    )

    # Transaction 2: Returned book (Late Return, Fine: 3 days late * 10 = ₹30)
    t2 = Transaction.objects.create(
        student=students[1],
        book=books[1], # Algorithms (Qty: 5)
        issue_date=today - timedelta(days=15),
        return_date=today - timedelta(days=5),
        actual_return_date=today - timedelta(days=2),
        status='returned',
        fine=Decimal('30.00')
    )

    # Transaction 3: Issued (Within time limit)
    t3 = Transaction.objects.create(
        student=students[2],
        book=books[2], # Database Systems
        issue_date=today - timedelta(days=3),
        return_date=today + timedelta(days=7),
        status='issued'
    )
    books[2].available_quantity -= 1
    books[2].save()

    # Transaction 4: Issued (Overdue, late by 4 days)
    t4 = Transaction.objects.create(
        student=students[3],
        book=books[3], # AI A Modern Approach
        issue_date=today - timedelta(days=14),
        return_date=today - timedelta(days=4),
        status='issued'
    )
    books[3].available_quantity -= 1
    books[3].save()

    # Transaction 5: Issued (Issued today)
    t5 = Transaction.objects.create(
        student=students[0], # Rahul Sharma
        book=books[4], # Computer Networking
        issue_date=today,
        return_date=today + timedelta(days=10),
        status='issued'
    )
    books[4].available_quantity -= 1
    books[4].save()

    # Transaction 6: Issued (Issued today)
    t6 = Transaction.objects.create(
        student=students[4], # Amit Verma
        book=books[0], # Clean Code
        issue_date=today,
        return_date=today + timedelta(days=10),
        status='issued'
    )
    books[0].available_quantity -= 1
    books[0].save()

    print("Transaction history seeded successfully!")
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed()
