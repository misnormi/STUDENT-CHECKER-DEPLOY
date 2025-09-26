from django.apps import AppConfig
from django.db import connection


class BalanceCheckerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'balance_checker'
    
    def ready(self):
        # Configure SQLite with WAL mode when the app is ready
        try:
            with connection.cursor() as cursor:
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.execute("PRAGMA cache_size=10000")
                cursor.execute("PRAGMA temp_store=MEMORY")
        except Exception:
            # Ignore errors during startup
            pass
