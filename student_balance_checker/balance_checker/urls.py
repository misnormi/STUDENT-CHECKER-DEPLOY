from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signin/', views.signin, name='signin'),
    path('signout/', views.signout, name='signout'),
    path('api/check-balance/', views.check_balance, name='check_balance'),
    path('api/update-balance/', views.update_balance, name='update_balance'),
    path('api/delete-student/', views.delete_student, name='delete_student'),
    path('dashboard/', views.student_list, name='student_list'),
    path('import-data/', views.import_data, name='import_data'),
]
