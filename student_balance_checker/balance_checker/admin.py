from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'first_name', 'last_name', 'course', 'balance', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'course')
    search_fields = ('student_id', 'first_name', 'last_name', 'course')
    ordering = ('last_name', 'first_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student_id', 'first_name', 'last_name', 'course')
        }),
        ('Financial Information', {
            'fields': ('balance',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
