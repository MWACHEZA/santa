import sys

with open('src/components/EnhancedProfile.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = """    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',"""

replacement = """    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      profilePicture: null as File | null,
      email: user?.email || '',"""

if target in code:
    code = code.replace(target, replacement)
    with open('src/components/EnhancedProfile.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed")
else:
    print("Not found")
