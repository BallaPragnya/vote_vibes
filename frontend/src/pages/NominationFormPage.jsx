import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import candidateService from '../services/candidateService';
import electionService from '../services/electionService';
import FileUploadField from '../components/FileUploadField';
import useAuth from '../hooks/useAuth';
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';

export default function NominationFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);

  const [formData, setFormData] = useState({
    electionId: '',
    fullName: user?.name || '',
    manifesto: '',
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [manifestoFile, setManifestoFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadElections() {
      try {
        const res = await electionService.getAllElections();
        let items = [];
        if (res?.data) {
          if (Array.isArray(res.data)) items = res.data;
          else if (Array.isArray(res.data.elections)) items = res.data.elections;
          else if (Array.isArray(res.data.data)) items = res.data.data;
        } else if (Array.isArray(res)) {
          items = res;
        }
        setElections(items);
        if (items.length > 0) {
          setFormData((prev) => ({ ...prev, electionId: items[0].id }));
        }
      } catch (err) {
        setErrorMsg('Failed to load active elections.');
      } finally {
        setLoadingElections(false);
      }
    }
    loadElections();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.electionId) {
      setErrorMsg('Please select an election.');
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (!formData.manifesto.trim()) {
      setErrorMsg('Manifesto text is required.');
      return;
    }

    if (formData.manifesto.trim().length < 10) {
      setErrorMsg('Manifesto must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('electionId', formData.electionId);
      data.append('userId', user?.id);
      data.append('fullName', formData.fullName.trim());
      data.append('manifesto', formData.manifesto.trim());

      if (profileImageFile) {
        data.append('profileImage', profileImageFile);
      }

      if (manifestoFile) {
        data.append('manifestoDocument', manifestoFile);
      }

      const res = await candidateService.createCandidate(data);

      if (res?.success || res?.data) {
        setSuccessMsg('Candidate nomination submitted successfully! Pending Election Commission approval.');
        setTimeout(() => {
          navigate('/candidates/status');
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit candidate nomination.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates Directory
        </Link>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Candidate Nomination Application</h1>
            <p className="text-xs text-slate-400">Submit your profile credentials and manifesto for upcoming elections</p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Election Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Election *
            </label>
            {loadingElections ? (
              <div className="text-xs text-slate-500 py-2">Loading active elections...</div>
            ) : (
              <select
                name="electionId"
                value={formData.electionId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              >
                {elections.map((elec) => (
                  <option key={elec.id} value={elec.id} className="bg-slate-900 text-white">
                    {elec.title} ({elec.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Jane Student"
              required
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Profile Image Upload */}
          <FileUploadField
            label="Candidate Profile Photo (Optional)"
            name="profileImage"
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={10}
            file={profileImageFile}
            onFileSelect={(file) => setProfileImageFile(file)}
            helpText="Allowed: JPEG, PNG, WEBP images (Max 10MB)"
            icon={ImageIcon}
          />

          {/* Campaign Manifesto Document PDF */}
          <FileUploadField
            label="Attached Manifesto PDF Document (Optional)"
            name="manifestoDocument"
            accept="application/pdf"
            maxSizeMB={10}
            file={manifestoFile}
            onFileSelect={(file) => setManifestoFile(file)}
            helpText="Allowed: PDF document (Max 10MB)"
            icon={FileText}
          />

          {/* Campaign Manifesto Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Campaign Manifesto Text * (Min 10 characters)
            </label>
            <textarea
              name="manifesto"
              value={formData.manifesto}
              onChange={handleChange}
              rows={6}
              minLength={10}
              maxLength={5000}
              placeholder="Write your campaign goals, key policy promises, and vision..."
              required
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              to="/candidates"
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Submit Nomination</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
