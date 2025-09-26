from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.core.paginator import Paginator
from django.db import models
from django.utils import timezone
from .models import Student
import json
import csv
import io
from decimal import Decimal, InvalidOperation

def home(request):
    """Main balance checker page"""
    return render(request, 'balance_checker/home.html')

def signin(request):
    """Sign in page"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('student_list')
        else:
            messages.error(request, 'Invalid credentials')
    return render(request, 'balance_checker/signin.html')

def signout(request):
    """Sign out"""
    logout(request)
    return redirect('home')

@csrf_exempt
def check_balance(request):
    """API endpoint to check student balance by ID or RFID"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student_id = data.get('student_id', '').strip()
            rfid_number = data.get('rfid_number', '').strip()
            
            # Auto-detect input type when both fields have the same value
            if student_id and rfid_number and student_id == rfid_number:
                input_value = student_id
                # Check if input looks like an RFID (starts with RFID)
                if input_value.upper().startswith('RFID'):
                    rfid_number = input_value
                    student_id = ''
                # Check if input looks like a Student ID (starts with STU or contains letters)
                elif input_value.upper().startswith('STU') or not input_value.isdigit():
                    student_id = input_value
                    rfid_number = ''
                # For purely numeric inputs, try both Student ID and RFID
                else:
                    # First try as Student ID
                    try:
                        test_student = Student.objects.get(student_id=input_value, is_active=True)
                        student_id = input_value
                        rfid_number = ''
                    except Student.DoesNotExist:
                        # If not found as Student ID, try as RFID
                        try:
                            test_student = Student.objects.get(rfid_number=input_value, is_active=True)
                            rfid_number = input_value
                            student_id = ''
                        except Student.DoesNotExist:
                            # If neither works, treat as Student ID for error message
                            student_id = input_value
                            rfid_number = ''
            # Auto-detect input type if only one field is provided
            elif student_id and not rfid_number:
                # Check if student_id looks like an RFID (starts with RFID)
                if student_id.upper().startswith('RFID'):
                    rfid_number = student_id
                    student_id = ''
                # For purely numeric inputs, try both Student ID and RFID
                elif student_id.isdigit():
                    # First try as Student ID
                    try:
                        test_student = Student.objects.get(student_id=student_id, is_active=True)
                        # Keep as student_id
                    except Student.DoesNotExist:
                        # If not found as Student ID, try as RFID
                        try:
                            test_student = Student.objects.get(rfid_number=student_id, is_active=True)
                            rfid_number = student_id
                            student_id = ''
                        except Student.DoesNotExist:
                            # If neither works, treat as Student ID for error message
                            pass
            elif rfid_number and not student_id:
                # Check if rfid_number looks like a Student ID (starts with STU or contains letters)
                if rfid_number.upper().startswith('STU') or not rfid_number.isdigit():
                    student_id = rfid_number
                    rfid_number = ''
            
            if not student_id and not rfid_number:
                return JsonResponse({'error': 'Student ID or RFID number is required'}, status=400)
            
            try:
                # Try to find student by student_id first, then by rfid_number
                if student_id:
                    student = Student.objects.get(student_id=student_id, is_active=True)
                else:
                    student = Student.objects.get(rfid_number=rfid_number, is_active=True)
                
                return JsonResponse({
                    'success': True,
                    'student': {
                        'id': student.student_id,
                        'name': f"{student.first_name} {student.last_name}",
                        'balance': float(student.balance),
                        'course': student.course or 'N/A',
                        'rfid_number': student.rfid_number or 'N/A',
                        'balance_updated_at': student.balance_updated_at.isoformat()
                    }
                })
            except Student.DoesNotExist:
                return JsonResponse({'error': 'Student not found'}, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def update_balance(request):
    """Update student balance via AJAX"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student_id = data.get('student_id')
            new_balance = data.get('balance')
            
            if not student_id or new_balance is None:
                return JsonResponse({'error': 'Student ID and balance are required'}, status=400)
            
            try:
                # Convert balance to Decimal
                balance_decimal = Decimal(str(new_balance))
            except (ValueError, TypeError, InvalidOperation):
                return JsonResponse({'error': 'Invalid balance format'}, status=400)
            
            try:
                student = Student.objects.get(student_id=student_id, is_active=True)
                student.balance = balance_decimal
                student.balance_updated_at = timezone.now()
                student.save()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Balance updated successfully',
                    'new_balance': float(student.balance)
                })
                
            except Student.DoesNotExist:
                return JsonResponse({'error': 'Student not found'}, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def delete_student(request):
    """Delete student via AJAX"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            student_id = data.get('student_id')
            
            if not student_id:
                return JsonResponse({'error': 'Student ID is required'}, status=400)
            
            try:
                student = Student.objects.get(student_id=student_id, is_active=True)
                student.is_active = False  # Soft delete
                student.save()
                
                return JsonResponse({
                    'success': True,
                    'message': f'Student {student.first_name} {student.last_name} has been deleted successfully'
                })
                
            except Student.DoesNotExist:
                return JsonResponse({'error': 'Student not found'}, status=404)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def student_list(request):
    """Student list dashboard"""
    # Get all students (including inactive for filter options)
    all_students = Student.objects.all().order_by('last_name', 'first_name')
    
    # Get filter parameters
    search_query = request.GET.get('search', '').strip()
    course_filter = request.GET.get('course', '')
    status_filter = request.GET.get('status', 'active')
    per_page = int(request.GET.get('per_page', 20))
    
    # Apply filters
    students = all_students
    
    # Search filter
    if search_query:
        students = students.filter(
            models.Q(student_id__icontains=search_query) |
            models.Q(first_name__icontains=search_query) |
            models.Q(last_name__icontains=search_query) |
            models.Q(course__icontains=search_query)
        )
    
    # Course filter
    if course_filter:
        students = students.filter(course=course_filter)
    
    # Status filter
    if status_filter == 'active':
        students = students.filter(is_active=True)
    elif status_filter == 'inactive':
        students = students.filter(is_active=False)
    # 'all' shows both active and inactive
    
    # Get unique courses for filter dropdown
    courses = Student.objects.values_list('course', flat=True).distinct().exclude(course__isnull=True).exclude(course='').order_by('course')
    
    # Pagination
    paginator = Paginator(students, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'students': page_obj,
        'courses': courses,
        'search_query': search_query,
        'course_filter': course_filter,
        'status_filter': status_filter,
        'per_page': per_page,
        'total_students': students.count(),
        'total_pages': paginator.num_pages,
    }
    return render(request, 'balance_checker/dashboard_enhanced.html', context)

@login_required
def import_data(request):
    """Import data page"""
    if request.method == 'POST':
        csv_file = request.FILES.get('csv_file')
        
        if not csv_file:
            messages.error(request, 'Please select a CSV file to upload.')
            return render(request, 'balance_checker/import_data.html')
        
        if not csv_file.name.endswith('.csv'):
            messages.error(request, 'Please upload a valid CSV file.')
            return render(request, 'balance_checker/import_data.html')
        
        try:
            # Read the CSV file with proper encoding detection
            file_data = csv_file.read()
            
            # Try to detect encoding and decode
            encodings_to_try = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-1']
            decoded_data = None
            
            for encoding in encodings_to_try:
                try:
                    decoded_data = file_data.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            
            if decoded_data is None:
                # If all encodings fail, use 'replace' to handle problematic characters
                decoded_data = file_data.decode('utf-8', errors='replace')
                messages.warning(request, 'Some characters in the CSV file could not be properly decoded and were replaced.')
            
            csv_data = io.StringIO(decoded_data)
            
            # Parse CSV
            reader = csv.DictReader(csv_data)
            
            # Required columns
            required_columns = ['student_id', 'fullname']
            optional_columns = ['rfid_number', 'course', 'balance']
            
            # Check if required columns exist
            if not all(col in reader.fieldnames for col in required_columns):
                missing_cols = [col for col in required_columns if col not in reader.fieldnames]
                messages.error(request, f'Missing required columns: {", ".join(missing_cols)}')
                return render(request, 'balance_checker/import_data.html')
            
            # Process each row
            imported_count = 0
            updated_count = 0
            errors = []
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 because of header
                try:
                    # Get required fields
                    student_id = row['student_id'].strip()
                    fullname = row['fullname'].strip()
                    
                    # Split fullname into first and last name
                    name_parts = fullname.split(' ', 1)  # Split on first space only
                    if len(name_parts) == 2:
                        first_name = name_parts[0].strip()
                        last_name = name_parts[1].strip()
                    else:
                        # If only one name part, use it as first name and leave last name empty
                        first_name = name_parts[0].strip()
                        last_name = ''
                    
                    # Get optional fields
                    rfid_number = row.get('rfid_number', '').strip() or None
                    course = row.get('course', '').strip() or None
                    balance = row.get('balance', '0').strip()
                    
                    # Validate balance
                    try:
                        balance_decimal = Decimal(balance) if balance else Decimal('0')
                    except (ValueError, TypeError):
                        balance_decimal = Decimal('0')
                    
                    # Validate required fields
                    if not all([student_id, fullname]):
                        errors.append(f'Row {row_num}: Missing required data (student_id, fullname)')
                        continue
                    
                    # Create or update student
                    student, created = Student.objects.get_or_create(
                        student_id=student_id,
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'rfid_number': rfid_number,
                            'course': course,
                            'balance': balance_decimal,
                        }
                    )
                    
                    if created:
                        imported_count += 1
                    else:
                        # Update existing student
                        student.first_name = first_name
                        student.last_name = last_name
                        if rfid_number:
                            student.rfid_number = rfid_number
                        if course:
                            student.course = course
                        student.balance = balance_decimal
                        student.save()
                        updated_count += 1
                        
                except Exception as e:
                    errors.append(f'Row {row_num}: {str(e)}')
                    continue
            
            # Show results
            if imported_count > 0 or updated_count > 0:
                success_msg = f'Successfully imported {imported_count} new students and updated {updated_count} existing students.'
                messages.success(request, success_msg)
            
            if errors:
                error_msg = f'Encountered {len(errors)} errors during import. Please check your data.'
                messages.warning(request, error_msg)
                # Log first few errors for debugging
                for error in errors[:5]:
                    messages.warning(request, error)
                if len(errors) > 5:
                    messages.warning(request, f'... and {len(errors) - 5} more errors.')
            
            if imported_count == 0 and updated_count == 0 and not errors:
                messages.info(request, 'No data was imported. Please check your CSV file format.')
                
        except UnicodeDecodeError as e:
            messages.error(request, f'Error processing CSV file: Unable to decode file. The file may contain characters that are not properly encoded. Please ensure your CSV file is saved with UTF-8 encoding or try converting it to UTF-8 format.')
        except Exception as e:
            messages.error(request, f'Error processing CSV file: {str(e)}')
    
    return render(request, 'balance_checker/import_data.html')
