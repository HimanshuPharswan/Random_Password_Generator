
import random #Libraries
import string #Libraries

# Define character sets (lowercase, uppercase, digits, punctuation or special characters)
lowercase_letters = string.ascii_lowercase
uppercase_letters = string.ascii_uppercase
digits = string.digits
special_characters = string.punctuation

# Combine all characters
all_characters = lowercase_letters + uppercase_letters + digits + special_characters

# Setting password length
password_length = 12

# Generate a random password
password = ''.join(random.sample(all_characters, password_length))

# Display the generated password
print("Generated Password:", password)
