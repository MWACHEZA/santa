const fs = require('fs');

let code = fs.readFileSync('src/components/Register.tsx', 'utf8');

code = code.replace(/import \{ useAuth \} from '\.\.\/contexts\/AuthContext';/, 
  "import { useAuth } from '../contexts/AuthContext';\nimport { api } from '../services/api';");

code = code.replace(/agreeToTerms: boolean;\n}/, `agreeToTerms: boolean;
  profilePicture?: File | null;
  isBaptized?: boolean;
  baptismDate?: string;
  baptismVenue?: string;
  isConfirmed?: boolean;
  confirmationDate?: string;
  confirmationVenue?: string;
  receivesCommunion?: boolean;
  firstCommunionDate?: string;
  isMarried?: boolean;
  marriageDate?: string;
  marriageVenue?: string;
  spouseName?: string;
}`);

code = code.replace(/agreeToTerms: false\n  }\);/, `agreeToTerms: false,
    profilePicture: null,
    isBaptized: false,
    baptismDate: '',
    baptismVenue: '',
    isConfirmed: false,
    confirmationDate: '',
    confirmationVenue: '',
    receivesCommunion: false,
    firstCommunionDate: '',
    isMarried: false,
    marriageDate: '',
    marriageVenue: '',
    spouseName: ''
  });`);

code = code.replace(/agreeToTerms: false\n        }\);/, `agreeToTerms: false,
          profilePicture: null,
          isBaptized: false,
          baptismDate: '',
          baptismVenue: '',
          isConfirmed: false,
          confirmationDate: '',
          confirmationVenue: '',
          receivesCommunion: false,
          firstCommunionDate: '',
          isMarried: false,
          marriageDate: '',
          marriageVenue: '',
          spouseName: ''
        });`);

code = code.replace(/const \[errors, setErrors\] = useState/, `
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

  const [errors, setErrors] = useState`);

code = code.replace(/const handleInputChange =/, `const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePicture: e.target.files![0]
      }));
    }
  };

  const handleInputChange =`);

code = code.replace(/const registrationData = \{[\s\S]*?role: 'parishioner' as const \/\/ Automatically set as parishioner\n      \};/, `
      const formDataToSend = new FormData();
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
      if (formData.spouseName) formDataToSend.append('spouseName', formData.spouseName);`);

code = code.replace(/const result = await register\(registrationData\);/, 'const result = await register(formDataToSend);');

code = code.replace(/<option value="">Select Section<\/option>\s*(<option[\s\S]*?)<\/select>/, `<option value="">Select Section</option>
                  {sectionsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>`);

code = code.replace(/<option value="">Select Association<\/option>\s*(<option[\s\S]*?)<\/select>/, `<option value="">Select Association</option>
                  {associationsList.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>`);

code = code.replace(/<h3>Personal Information<\/h3>/, `<h3>Profile Photo</h3>
            <div className="form-group">
              <label htmlFor="profilePicture">Upload Photo</label>
              <input type="file" id="profilePicture" name="profilePicture" accept="image/*" onChange={handleFileChange} />
            </div>

            <h3>Personal Information</h3>`);

code = code.replace(/{\/\* Emergency Contact \*\/}/, `{/* Sacramental Information */}
          <div className="form-section">
            <h3>Sacramental Information (Optional)</h3>
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isBaptized" checked={formData.isBaptized} onChange={handleInputChange} />
                  <span className="checkmark"></span>
                  Baptized?
                </label>
              </div>
            </div>
            {formData.isBaptized && (
              <div className="form-row">
                <div className="form-group">
                  <label>Baptism Date</label>
                  <input type="date" name="baptismDate" value={formData.baptismDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Baptism Venue</label>
                  <input type="text" name="baptismVenue" value={formData.baptismVenue} onChange={handleInputChange} placeholder="Parish Name" />
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isConfirmed" checked={formData.isConfirmed} onChange={handleInputChange} />
                  <span className="checkmark"></span>
                  Confirmed?
                </label>
              </div>
            </div>
            {formData.isConfirmed && (
              <div className="form-row">
                <div className="form-group">
                  <label>Confirmation Date</label>
                  <input type="date" name="confirmationDate" value={formData.confirmationDate} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Confirmation Venue</label>
                  <input type="text" name="confirmationVenue" value={formData.confirmationVenue} onChange={handleInputChange} />
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="receivesCommunion" checked={formData.receivesCommunion} onChange={handleInputChange} />
                  <span className="checkmark"></span>
                  Receives Holy Communion?
                </label>
              </div>
            </div>
            {formData.receivesCommunion && (
              <div className="form-row">
                <div className="form-group">
                  <label>First Communion Date</label>
                  <input type="date" name="firstCommunionDate" value={formData.firstCommunionDate} onChange={handleInputChange} />
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isMarried" checked={formData.isMarried} onChange={handleInputChange} />
                  <span className="checkmark"></span>
                  Married?
                </label>
              </div>
            </div>
            {formData.isMarried && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Marriage Date</label>
                    <input type="date" name="marriageDate" value={formData.marriageDate} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Marriage Venue</label>
                    <input type="text" name="marriageVenue" value={formData.marriageVenue} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Spouse Name</label>
                    <input type="text" name="spouseName" value={formData.spouseName} onChange={handleInputChange} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Emergency Contact */}`);

fs.writeFileSync('src/components/Register.tsx', code);
console.log('Register.tsx updated');
