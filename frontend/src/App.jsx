import { Routes, Route } from 'react-router-dom';
import Masthead from './components/Masthead.jsx';
import { ToastProvider } from './components/Toast.jsx';
import StudentListPage from './pages/StudentListPage.jsx';
import StudentFormPage from './pages/StudentFormPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper">
        <Masthead />
        <Routes>
          <Route path="/" element={<StudentListPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}
