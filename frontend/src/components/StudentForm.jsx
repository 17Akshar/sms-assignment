import { useRef, useState } from 'react';
import Field from './Field.jsx';
import { validateStudent, COURSE_SUGGESTIONS } from '../utils/validators.js';

const EMPTY = {
  name: '',
  course: '',
  year: '',
  date_of_birth: '',
  email: '',
  mobile_number: '',
  gender: '',
  address: '',
};

export default function StudentForm({ initialValues, existingPhotoUrl, onSubmit, submitting, submitLabel = 'Save' }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(existingPhotoUrl || null);
  const fileInputRef = useRef(null);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((e2) => ({ ...e2, photo: 'Only JPEG, PNG or WEBP images are allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e2) => ({ ...e2, photo: 'Photo must be under 5MB' }));
      return;
    }
    setErrors((e2) => ({ ...e2, photo: undefined }));
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateStudent(values);
    setErrors((prev) => ({ ...prev, ...validationErrors }));
    if (Object.keys(validationErrors).length > 0) return;

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => formData.append(key, val));
    if (photoFile) formData.append('photo', photoFile);

    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0">
          <div className="h-32 w-32 rounded-sm border-2 border-dashed border-ink/20 bg-parchment flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Student preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-slate text-center px-2">No photo</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-xs font-medium text-ink underline underline-offset-2 hover:text-sage-dark"
          >
            {preview ? 'Change photo' : 'Upload photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
          {errors.photo && <p className="mt-1 text-xs text-brick">{errors.photo}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 w-full">
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <input
              id="name"
              type="text"
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
              placeholder="e.g. Aarav Sharma"
            />
          </Field>

          <Field label="Course" htmlFor="course" error={errors.course}>
            <input
              id="course"
              list="course-suggestions"
              type="text"
              value={values.course}
              onChange={(e) => update('course', e.target.value)}
              className="input"
              placeholder="e.g. B.Sc. Computer Science"
            />
            <datalist id="course-suggestions">
              {COURSE_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Year" htmlFor="year" error={errors.year}>
            <select id="year" value={values.year} onChange={(e) => update('year', e.target.value)} className="input">
              <option value="">Select year</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date of birth" htmlFor="dob" error={errors.date_of_birth}>
            <input
              id="dob"
              type="date"
              value={values.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
              className="input"
              max={new Date().toISOString().split('T')[0]}
            />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
              placeholder="student@example.com"
            />
          </Field>

          <Field label="Mobile number" htmlFor="mobile" error={errors.mobile_number}>
            <input
              id="mobile"
              type="tel"
              value={values.mobile_number}
              onChange={(e) => update('mobile_number', e.target.value)}
              className="input"
              placeholder="9876543210"
            />
          </Field>

          <Field label="Gender" htmlFor="gender" error={errors.gender}>
            <select id="gender" value={values.gender} onChange={(e) => update('gender', e.target.value)} className="input">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>

          <Field label="Address" htmlFor="address" error={errors.address}>
            <textarea
              id="address"
              rows={1}
              value={values.address}
              onChange={(e) => update('address', e.target.value)}
              className="input"
              placeholder="City, State"
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-ink/10">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
