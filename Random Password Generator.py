
import secrets #Library for secure random choices (safer than random for passwords)
import string #Library

# Define character sets (lowercase, uppercase, digits, punctuation or special characters)
lowercase_letters = string.ascii_lowercase
uppercase_letters = string.ascii_uppercase
digits = string.digits
special_characters = string.punctuation

# Combine all characters
all_characters = lowercase_letters + uppercase_letters + digits + special_characters

# Setting password length
password_length = 12

# Generate a random password (characters can repeat, which makes it harder to guess)
password = ''.join(secrets.choice(all_characters) for _ in range(password_length))

# Display the generated password
print("Generated Password:", password)
