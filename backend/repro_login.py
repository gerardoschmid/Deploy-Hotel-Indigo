import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from usuarios.serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

# 1. Get a user to test with
print("--- Existing Users ---")
for u in User.objects.all():
    print(f"Username: '{u.username}', Email: '{u.email}', Active: {u.is_active}")

# Pick the first user for testing generally, or create one if none exist
if not User.objects.exists():
    print("No users found. Creating test user.")
    user = User.objects.create_user('testuser', 'test@example.com', 'password123')
else:
    user = User.objects.first()
    # Reset password to known value for testing
    user.set_password('password123')
    user.save()
    print(f"\nResetted password for user '{user.username}' to 'password123' for testing.")

# 2. Test Serializer with USERNAME
print(f"\n--- Testing Login with Username: {user.username} ---")
attrs_username = {'username': user.username, 'password': 'password123'}
serializer = MyTokenObtainPairSerializer(data=attrs_username)
try:
    if serializer.is_valid():
        print("SUCCESS: Valid with username")
    else:
        print(f"FAILURE: Invalid with username. Errors: {serializer.errors}")
except Exception as e:
    print(f"EXCEPTION with username: {e}")

# 3. Test Serializer with EMAIL
print(f"\n--- Testing Login with Email: {user.email} ---")
attrs_email = {'username': user.email, 'password': 'password123'}
# Note: The view normally passes context={'request': request}, but simplejwt might need it or not depending on settings. 
# Usually TokenObtainPairSerializer doesn't strictly need request for basic auth unless checks are enabled.
serializer_email = MyTokenObtainPairSerializer(data=attrs_email)
try:
    if serializer_email.is_valid():
         print("SUCCESS: Valid with email")
    else:
         print(f"FAILURE: Invalid with email. Errors: {serializer_email.errors}")
except Exception as e:
     print(f"EXCEPTION with email: {e}")

