const fs = require('fs');
let code = fs.readFileSync('src/components/EnhancedProfile.tsx', 'utf8');

// We need to completely replace handleSubmit.
// Find the index of "const handleSubmit ="
const startIndex = code.indexOf('const handleSubmit =');
// Find the index of "const handleCancel ="
const endIndex = code.indexOf('const handleCancel =');

if (startIndex !== -1 && endIndex !== -1) {
  const newHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      if (!updateUser) {
        throw new Error('Update function not available');
      }

      let updatedRole = formData.role;
      if (formData.committeePosition === 'Treasurer') updatedRole = 'treasurer';
      else if (formData.committeePosition === 'Secretary') updatedRole = 'secretary';
      else if (formData.committeePosition === 'Vice Secretary') updatedRole = 'vice_secretary';
      else if (formData.committeePosition === 'Chairperson' || formData.committeePosition === 'Vice Chairperson') updatedRole = 'admin';
      else if (!formData.committeePosition) updatedRole = 'parishioner';

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'profilePicture') {
          if (val) formDataToSend.append('profilePicture', val as File);
        } else if (val !== null && val !== undefined && val !== '') {
          formDataToSend.append(key, String(val));
        }
      });
      formDataToSend.append('isCommitteeMember', String(!!formData.committeePosition && formData.committeePosition !== ''));
      formDataToSend.append('role', updatedRole as string);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      formDataToSend.append('updatedAt', new Date().toISOString());

      const result = await updateUser(user.id, formDataToSend);

      if (result && result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        throw new Error(result?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  `;

  code = code.substring(0, startIndex) + newHandleSubmit + code.substring(endIndex);
  fs.writeFileSync('src/components/EnhancedProfile.tsx', code);
  console.log('Fixed EnhancedProfile.tsx');
} else {
  console.log('Could not find boundaries');
}
