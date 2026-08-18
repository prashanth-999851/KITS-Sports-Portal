import React, { useState, useEffect } from 'react';
import { ButtonSpinner } from './LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { X, CheckCircle2, Trophy, Send } from 'lucide-react';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  validateRollNumber, 
  sanitizeInput 
} from '../utils/sanitize';
import { 
  PUBLIC_ACADEMIC_YEARS, 
  getAvailableDepartments, 
  getAvailableSections 
} from '../constants/academicRules';

export default function RegistrationModal({ sportName, eventName, isOpen, onClose, onAddApplication }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    year: "2nd Year",
    department: "CSE",
    gender: "Male",
    section: "Section 1",
    email: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock background body scroll when popup modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle || 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetName = sportName || eventName || "Sports Club";

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Student name is required.";
        } else if (!validateName(value)) {
          error = "Please enter a valid full name.";
        }
        break;
      case "rollNumber":
        if (!value.trim()) {
          error = "Roll number is required.";
        } else if (!validateRollNumber(value)) {
          error = "Enter a valid KITS roll number (e.g. 24JR1A0501, 25JR1A05A0).";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email address is required.";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address.";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone number is required.";
        } else if (!validatePhone(value)) {
          error = "Please enter a valid 10-digit mobile number.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (field, value) => {
    let processedValue = value;
    if (field === "rollNumber") {
      processedValue = value.toUpperCase().trim();
    }
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (touched[field]) {
      const err = validateField(field, processedValue);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleYearChange = (newYear) => {
    const availableDepts = getAvailableDepartments(newYear);
    const newDept = availableDepts.includes(formData.department) ? formData.department : availableDepts[0];
    const availableSecs = getAvailableSections(newYear, newDept);
    const curSecNum = (formData.section || '').replace('Section ', '');
    const newSecNum = availableSecs.includes(curSecNum) ? curSecNum : availableSecs[0];
    
    setFormData(prev => ({
      ...prev,
      year: newYear,
      department: newDept,
      section: `Section ${newSecNum}`
    }));
  };

  const handleDepartmentChange = (newDept) => {
    const availableSecs = getAvailableSections(formData.year, newDept);
    const curSecNum = (formData.section || '').replace('Section ', '');
    const newSecNum = availableSecs.includes(curSecNum) ? curSecNum : availableSecs[0];

    setFormData(prev => ({
      ...prev,
      department: newDept,
      section: `Section ${newSecNum}`
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      rollNumber: validateField("rollNumber", formData.rollNumber),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      rollNumber: true,
      email: true,
      phone: true,
    });

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showToast("Please correct the form errors.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = await onAddApplication({
        name: sanitizeInput(formData.name.trim()),
        rollNumber: sanitizeInput(formData.rollNumber.trim().toUpperCase()),
        department: formData.department,
        year: formData.year,
        gender: formData.gender || "Male",
        section: formData.section || "Section 1",
        email: sanitizeInput(formData.email.trim().toLowerCase()),
        phone: sanitizeInput(formData.phone.trim()),
        preferredSports: [targetName],
      });
      setTrackingId(generatedId || `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
      showToast(`Registration submitted for ${targetName}!`, 'success');
    } catch (err) {
      console.error("Registration error:", err);
      showToast('Registration failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: "", rollNumber: "", year: "2nd Year", department: "CSE", gender: "Male", section: "Section 1", email: "", phone: "" });
    setErrors({});
    setTouched({});
    onClose();
  };

  const getInputClass = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border text-slate-800 text-xs focus:bg-white focus:outline-none transition-colors ${
      hasError 
        ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
        : 'border-slate-200 focus:border-[#0b2e5b]'
    }`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="p-4 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800">Registration Confirmed!</h3>
            <p className="text-xs text-slate-600">
              You are now registered for <strong className="text-[#0b2e5b]">{targetName}</strong>.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[#0b2e5b] text-lg font-bold">
              ID: {trackingId}
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors cursor-pointer shadow-sm"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b2e5b]">Register for {targetName}</h3>
                <span className="text-[11px] text-slate-500 font-medium">KKR & KSR Official Trials 2026</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={getInputClass("name")}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Year of Study *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className={getInputClass("year")}
                  >
                    {PUBLIC_ACADEMIC_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className={getInputClass("department")}
                  >
                    {getAvailableDepartments(formData.year).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter college roll number"
                    value={formData.rollNumber}
                    onChange={(e) => handleChange("rollNumber", e.target.value)}
                    onBlur={() => handleBlur("rollNumber")}
                    className={getInputClass("rollNumber")}
                  />
                  {touched.rollNumber && errors.rollNumber && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.rollNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Gender *</label>
                  <select
                    value={formData.gender || "Male"}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className={getInputClass("gender")}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Section *</label>
                  <select
                    value={formData.section || "Section 1"}
                    onChange={(e) => handleChange("section", e.target.value)}
                    className={getInputClass("section")}
                  >
                    {getAvailableSections(formData.year, formData.department).map(sec => (
                      <option key={sec} value={`Section ${sec}`}>Section {sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    maxLength={13}
                    placeholder="Enter contact phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={getInputClass("phone")}
                  />
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={getInputClass("email")}
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] disabled:opacity-50 text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <ButtonSpinner text="Registering..." />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
