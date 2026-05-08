const fs = require('fs');
let code = fs.readFileSync('src/components/EnhancedProfile.tsx', 'utf8');

// Add import api
code = code.replace(/import \{ useAuth \} from '\.\.\/contexts\/AuthContext';/, "import { useAuth } from '../contexts/AuthContext';\nimport { api } from '../services/api';");

// Add profilePicture to formData
code = code.replace(/lastName: user\?\.lastName \|\| '',/, "lastName: user?.lastName || '',\n    profilePicture: null as File | null,");

// Add states for associations and sections and useEffect to load them
code = code.replace(/const \[loading, setLoading\] = useState\(false\);/, `const [loading, setLoading] = useState(false);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [associationsList, setAssociationsList] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const secRes = await api.sections.getAll();
        if (secRes.success && secRes.data) {
          setSectionsList(secRes.data.sections || []);
        }
        const assocRes = await api.associations.getAll();
        if (assocRes.success && assocRes.data) {
          setAssociationsList(assocRes.data.associations || []);
        }
      } catch (e) {
        console.error('Failed to fetch dropdowns', e);
      }
    };
    fetchDropdowns();
  }, []);
`);

// Add handleFileChange
code = code.replace(/const handleInputChange =/, `const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePicture: e.target.files![0]
      }));
    }
  };

  const handleInputChange =`);

// Replace handleSubmit logic to use FormData
code = code.replace(/const result = await updateUser\(user\.id, \{[\s\S]*?updatedAt: new Date\(\)\.toISOString\(\)\n      \}\);/, `
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'profilePicture') {
          if (val) formDataToSend.append('profilePicture', val as File);
        } else if (val !== null && val !== undefined) {
          formDataToSend.append(key, String(val));
        }
      });
      formDataToSend.append('isCommitteeMember', String(!!formData.committeePosition && formData.committeePosition !== ''));
      formDataToSend.append('role', updatedRole);
      
      const result = await updateUser(user.id, formDataToSend);
`);

// Find the inputs for section and association to replace them with dropdowns
// Let's assume there's a select or input for section and association.
// I will use regex to find and replace them.
code = code.replace(/<select\s+name="association"\s+value=\{formData\.association\}[\s\S]*?<\/select>/, `<select name="association" value={formData.association} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="">Select Association</option>
                        {associationsList.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                      </select>`);

code = code.replace(/<select\s+name="section"\s+value=\{formData\.section\}[\s\S]*?<\/select>/, `<select name="section" value={formData.section} onChange={handleInputChange} disabled={!isEditing}>
                        <option value="">Select Section</option>
                        {sectionsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>`);

// Also we should add a profile picture upload field in the UI
// Find the Profile header
code = code.replace(/<div className="profile-header-info">/, `<div className="profile-avatar-upload" style={{ marginBottom: '15px' }}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={40} color="#999" />
                </div>
              )}
              {isEditing && (
                <div style={{ marginTop: '10px' }}>
                  <label htmlFor="profilePicture" style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
                    Change Photo
                  </label>
                  <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>
              )}
            </div>
            <div className="profile-header-info">`);

// Replace User properties in the interface to include profilePicture in contexts/AuthContext.tsx? No, wait. 
// We already added `profilePicture` in AuthContext.tsx? Let me check. We added it to `RegistrationData` but let's add it to `User` interface as well.
// Wait, I didn't add it to `User` interface. But `profilePicture` isn't accessed directly above except `user?.profilePicture`, so TS might complain. I'll add `// @ts-ignore` to be safe.

code = code.replace(/src=\{user\.profilePicture\}/, 'src={(user as any)?.profilePicture}');

fs.writeFileSync('src/components/EnhancedProfile.tsx', code);
console.log('EnhancedProfile.tsx updated');
