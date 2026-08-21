import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import electionService from '../services/electionService';
import { PlusCircle, ArrowLeft, AlertCircle, CheckCircle2, Building2, HelpCircle } from 'lucide-react';

const AVAILABLE_DEPARTMENTS = [
  { id: 'dept-cse-01', code: 'CSE', name: 'Computer Science & Engineering' },
  { id: 'dept-it-02', code: 'IT', name: 'Information Technology' },
  { id: 'dept-ece-03', code: 'ECE', name: 'Electronics & Communication' },
  { id: 'dept-me-04', code: 'ME', name: 'Mechanical Engineering' },
  { id: 'dept-ee-05', code: 'EE', name: 'Electrical Engineering' },
  { id: 'dept-mba-06', code: 'MBA', name: 'School of Management Studies' },
];

export default function CreateElection() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isDepartmentRestricted: false,
  });

  const [selectedDeptIds, setSelectedDeptIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleDeptToggle = (deptId) => {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Election title is required.');
      return;
    }

    if (!formData.startDate) {
      setErrorMsg('Start date & time is required.');
      return;
    }

    if (!formData.endDate) {
      setErrorMsg('End date & time is required.');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setErrorMsg('End date & time must be strictly after the start date & time.');
      return;
    }

    if (formData.isDepartmentRestricted && selectedDeptIds.length === 0) {
      setErrorMsg('Please select at least one academic department for restriction.');
      return;
    }

    setIsSubmitting(true);
    try {
      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: startIso,
        endDate: endIso,
        startTime: startIso,
        endTime: endIso,
        isDepartmentRestricted: formData.isDepartmentRestricted,
        departmentIds: formData.isDepartmentRestricted ? selectedDeptIds : [],
      };

      const res = await electionService.createElection(payload);

      if (res?.success || res?.data) {
        setSuccessMsg('Election created successfully as DRAFT! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/elections');
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create election.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <Link
          to="/elections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Elections Hub
        </Link>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create New Election</h1>
            <p className="text-xs text-slate-400">Set up parameters for a new college election event</p>
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
          {/* Election Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Election Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Student Council Presidential Election 2026"
              required
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description / Instructions
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide context, candidate guidelines, or voting criteria for students..."
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Start & End Dates with explicit format helper */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Time Format: Standard 12-hour (AM/PM) or 24-hour local datetime format</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Start Schedule (Date & Time) *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  End Schedule (Date & Time) *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Department Restriction Checkbox & Selector */}
          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="isDepartmentRestricted"
                checked={formData.isDepartmentRestricted}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-300">
                Restrict voting eligibility to specific academic departments
              </span>
            </label>

            {/* Department Multi-select Checklist */}
            {formData.isDepartmentRestricted && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Building2 className="w-4 h-4" />
                  <span>Select Eligible Departments:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_DEPARTMENTS.map((dept) => {
                    const isChecked = selectedDeptIds.includes(dept.id);
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleDeptToggle(dept.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 text-xs transition-all ${
                          isChecked
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-950 text-indigo-600"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white mr-1.5">{dept.code}</span>
                          <span className="text-[11px] text-slate-400">{dept.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              to="/elections"
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Election...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Election</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
