#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_balance_checker.settings')
django.setup()

from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Run the migration
    execute_from_command_line(['manage.py', 'migrate'])
