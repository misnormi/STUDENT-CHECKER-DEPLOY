from django.core.management.base import BaseCommand
from balance_checker.models import Student
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Populate the database with sample student data'

    def handle(self, *args, **options):
        # Sample student data
        students_data = [
            {'student_id': 'STU001', 'fullname': 'John Doe', 'rfid_number': 'RFID123001', 'course': 'Computer Science'},
            {'student_id': 'STU002', 'fullname': 'Jane Smith', 'rfid_number': 'RFID123002', 'course': 'Business Administration'},
            {'student_id': 'STU003', 'fullname': 'Mike Johnson', 'rfid_number': 'RFID123003', 'course': 'Engineering'},
            {'student_id': 'STU004', 'fullname': 'Sarah Williams', 'rfid_number': 'RFID123004', 'course': 'Psychology'},
            {'student_id': 'STU005', 'fullname': 'David Brown', 'rfid_number': 'RFID123005', 'course': 'Mathematics'},
            {'student_id': 'STU006', 'fullname': 'Emily Davis', 'rfid_number': 'RFID123006', 'course': 'Biology'},
            {'student_id': 'STU007', 'fullname': 'Chris Wilson', 'rfid_number': 'RFID123007', 'course': 'Economics'},
            {'student_id': 'STU008', 'fullname': 'Lisa Anderson', 'rfid_number': 'RFID123008', 'course': 'Art History'},
        ]

        created_count = 0
        for student_data in students_data:
            # Generate random balance between $0 and $500
            balance = Decimal(str(round(random.uniform(0, 500), 2)))
            
            # Split fullname into first and last name
            fullname = student_data['fullname']
            name_parts = fullname.split(' ', 1)  # Split on first space only
            if len(name_parts) == 2:
                first_name = name_parts[0].strip()
                last_name = name_parts[1].strip()
            else:
                # If only one name part, use it as first name and leave last name empty
                first_name = name_parts[0].strip()
                last_name = ''
            
            student, created = Student.objects.get_or_create(
                student_id=student_data['student_id'],
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'rfid_number': student_data['rfid_number'],
                    'course': student_data['course'],
                    'balance': balance,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created student: {student.first_name} {student.last_name} (ID: {student.student_id}) - Balance: ${student.balance}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Student already exists: {student.first_name} {student.last_name} (ID: {student.student_id})')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new students')
        )
