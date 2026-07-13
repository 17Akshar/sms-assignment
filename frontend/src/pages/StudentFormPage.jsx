import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { StudentsAPI, extractErrorMessage } from '../api/client.js';
import { useToast } from '../components/Toast.jsx';
import StudentForm from '../components/StudentForm.jsx';

export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const showToast = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    StudentsAPI.get(id)
      .then((res) => {
        const s = res.data;
        setInitialValues({
          name: s.name,
          course: s.course,
          year: s.year,
          date_of_birth: s.date_of_birth?.split('T')[0],
          email: s.email,
          mobile_number: s.mobile_number,
          gender: s.gender,
          address: s.address,
        });
        setExistingPhotoUrl(s.photo_url);
        setAdmissionNumber(s.admission_number);
      })
      .catch((err) => {
        showToast(extractErrorMessage(err), 'error');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate, showToast]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await StudentsAPI.update(id, formData);
        showToast('Student record updated.');
      } else {
        await StudentsAPI.create(formData);
        showToast('Student admitted successfully.');
      }
      navigate('/');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Link to="/" className="text-xs font-medium text-slate hover:text-ink">
        ← Back to register
      </Link>

      <div className="mt-3 mb-8 flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {isEdit ? 'Edit Student Record' : 'Admit New Student'}
        </h1>
        {admissionNumber && (
          <span className="font-mono text-xs px-2 py-1 rounded-sm border border-gold/40 text-gold bg-gold/5">
            {admissionNumber}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate">Loading record…</p>
      ) : (
        <div className="bg-paper border border-ink/10 rounded-sm shadow-card p-6 sm:p-8">
          <StudentForm
            initialValues={initialValues || undefined}
            existingPhotoUrl={existingPhotoUrl}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={isEdit ? 'Save changes' : 'Admit student'}
          />
        </div>
      )}
    </div>
  );
}
