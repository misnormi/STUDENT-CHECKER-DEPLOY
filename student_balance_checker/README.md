# Student Balance Checker

A Django web application that allows students to check their account balance by tapping their student ID.

## Features

- **Clean, Modern UI**: Dark green interface with intuitive design
- **Student Balance Checking**: Enter or tap student ID to check balance
- **Admin Interface**: Manage student data through Django admin
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Balance Display**: Instant balance checking with visual feedback

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd student_balance_checker
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create a superuser**:
   ```bash
   python manage.py createsuperuser
   ```

5. **Populate sample data** (optional):
   ```bash
   python manage.py populate_students
   ```

6. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

7. **Access the application**:
   - Main app: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

## Usage

### For Students
1. Open the application in your browser
2. Enter your student ID in the input field or click the tap circle
3. Your balance will be displayed instantly
4. Double-click the tap circle for a demo with sample data

### For Administrators
1. Go to the admin panel at `/admin/`
2. Sign in with your superuser credentials
3. Manage student records, including balances and account status

## Sample Student IDs

The application comes with sample data. Try these student IDs:
- STU001
- STU002
- STU003
- STU004
- STU005

## Project Structure

```
student_balance_checker/
├── balance_checker/
│   ├── management/
│   │   └── commands/
│   │       └── populate_students.py
│   ├── templates/
│   │   └── balance_checker/
│   │       ├── home.html
│   │       └── signin.html
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── main.js
│   ├── admin.py
│   ├── models.py
│   ├── views.py
│   └── urls.py
├── student_balance_checker/
│   ├── settings.py
│   └── urls.py
├── requirements.txt
└── README.md
```

## API Endpoints

- `GET /` - Main balance checker interface
- `GET /signin/` - Admin sign-in page
- `POST /api/check-balance/` - API endpoint to check student balance

## Technologies Used

- **Backend**: Django 4.2+
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Database**: SQLite (default) or any Django-supported database
- **Styling**: Custom CSS with modern design principles

## Customization

### Adding New Features
1. Modify the `Student` model in `models.py`
2. Update views in `views.py`
3. Create new templates in `templates/balance_checker/`
4. Add new URL patterns in `urls.py`

### Styling Changes
- Edit `static/css/style.css` for visual modifications
- The design uses CSS custom properties for easy color scheme changes

## License

This project is open source and available under the MIT License.
