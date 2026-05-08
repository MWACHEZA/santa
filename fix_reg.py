import sys
import re

with open('src/components/Register.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r"""      // Prepare registration data
      const registrationData = {
        username: formData.username.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s/g, ''), // Remove spaces
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender as 'male' | 'female') || undefined,
        address: formData.address.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.replace(/\s/g, '') || undefined,
        section: formData.section || undefined,
        association: formData.association || undefined,
        role: 'parishioner' as const // Automatically set as parishioner
      };"""

replacement = """      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('firstName', formData.firstName.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phone', formData.phone.replace(/\\s/g, ''));
      formDataToSend.append('password', formData.password);
      if (formData.dateOfBirth) formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      if (formData.address) formDataToSend.append('address', formData.address.trim());
      if (formData.emergencyContact) formDataToSend.append('emergencyContact', formData.emergencyContact.trim());
      if (formData.emergencyPhone) formDataToSend.append('emergencyPhone', formData.emergencyPhone.replace(/\\s/g, ''));
      if (formData.section) formDataToSend.append('section', formData.section);
      if (formData.association) formDataToSend.append('association', formData.association);
      formDataToSend.append('role', 'parishioner');
      
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }
      
      formDataToSend.append('isBaptized', String(formData.isBaptized));
      if (formData.baptismDate) formDataToSend.append('baptismDate', formData.baptismDate);
      if (formData.baptismVenue) formDataToSend.append('baptismVenue', formData.baptismVenue);
      
      formDataToSend.append('isConfirmed', String(formData.isConfirmed));
      if (formData.confirmationDate) formDataToSend.append('confirmationDate', formData.confirmationDate);
      if (formData.confirmationVenue) formDataToSend.append('confirmationVenue', formData.confirmationVenue);
      
      formDataToSend.append('receivesCommunion', String(formData.receivesCommunion));
      if (formData.firstCommunionDate) formDataToSend.append('firstCommunionDate', formData.firstCommunionDate);
      
      formDataToSend.append('isMarried', String(formData.isMarried));
      if (formData.marriageDate) formDataToSend.append('marriageDate', formData.marriageDate);
      if (formData.marriageVenue) formDataToSend.append('marriageVenue', formData.marriageVenue);
      if (formData.spouseName) formDataToSend.append('spouseName', formData.spouseName);"""

code = code.replace(target, replacement)

with open('src/components/Register.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Replaced")
