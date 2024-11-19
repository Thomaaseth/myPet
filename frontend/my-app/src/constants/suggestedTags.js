export const SUGGESTED_TAGS = [
    'medical_records',
    'lab_results',
    'vaccinations',
    'prescriptions', 
    'insurance',
    'surgical_records',
    'dental_records',
    'x_rays',
    'medications',
    'allergies',
    'wellness_exam',
    'emergency_visit',
    'behavior_notes',
    'nutrition_plan',
    'grooming',
    'training',
    'microchip',
    'registration',
    'invoice',
    'other'
  ];
  
  export const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };
  
  export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB