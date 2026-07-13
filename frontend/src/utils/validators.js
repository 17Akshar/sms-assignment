export function validateStudent(values) {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Name is required';
  else if (values.name.length > 120) errors.name = 'Name is too long';

  if (!values.course?.trim()) errors.course = 'Course is required';

  if (!values.year) errors.year = 'Year is required';
  else if (values.year < 1 || values.year > 6) errors.year = 'Year must be between 1 and 6';

  if (!values.date_of_birth) errors.date_of_birth = 'Date of birth is required';
  else if (new Date(values.date_of_birth) > new Date()) errors.date_of_birth = 'Date of birth cannot be in the future';

  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address';

  if (!values.mobile_number?.trim()) errors.mobile_number = 'Mobile number is required';
  else if (!/^[0-9+\-\s]{7,15}$/.test(values.mobile_number)) errors.mobile_number = 'Enter a valid mobile number';

  if (!values.gender) errors.gender = 'Gender is required';

  if (!values.address?.trim()) errors.address = 'Address is required';
  else if (values.address.length > 500) errors.address = 'Address is too long';

  return errors;
}

export const COURSE_SUGGESTIONS = [
  'B.Sc. Computer Science',
  'B.Tech Computer Science',
  'B.Tech Electronics',
  'B.Com',
  'BBA',
  'BA English',
  'M.Sc. Computer Science',
  'MBA',
];
