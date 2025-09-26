from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    rfid_number = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="RFID card number for tap ID purposes")
    course = models.CharField(max_length=100, blank=True, null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_updated_at = models.DateTimeField(default=timezone.now, help_text="When the balance was last updated")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"
    
    class Meta:
        ordering = ['last_name', 'first_name']
