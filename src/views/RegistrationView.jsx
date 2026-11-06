import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useConvexState } from '../context/ConvexStateContext';
import { useToast } from '../context/ToastContext';
import { ButtonSpinner } from '../components/LoadingSkeleton';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  Search, 
  Clock,
  Upload, 
  Trash2, 
  ExternalLink, 
  Loader2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  validateName, 
  validateEmail, 
  validatePhone, 
  validateRollNumber, 
  sanitizeInput 
} from '../utils/sanitize';
import { 
  getPublicAcademicYears, 
  getAvailableDepartments, 
  getAvailableSections 
} from '../constants/academicRules';

const DEFAULT_SPORTS = [
  "Cricket", "Volleyball", "Basketball", "Badminton",
  "Football", "Kabaddi", "Table Tennis", "Throwball", "Kho-Kho"
];

const EXCLUDED_REGISTRATION_SPORTS = ['athletics', 'athletic', 'chess'];

const EXPERIENCE_OPTIONS = [
  "No Previous Experience",
  "Have Playing Experience"
];

export default function RegistrationView({ onBack }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { 
    sports: rawSports = [], 
    applications = [], 
    students = [], 
    addStudentApplication,
    uploadExperienceCertificate,
    yearRegistrationStatus = {},
    enabledAcademicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'],
  } = useConvexState();

  const availableAcademicYears = enabledAcademicYears.length > 0
    ? enabledAcademicYears
    : getPublicAcademicYears(yearRegistrationStatus);

  const isAllRegistrationsClosed = availableAcademicYears.length === 0;

  const initialTab = searchParams.get('tab') === 'track' || searchParams.get('code') || searchParams.get('trackingId')
    ? "Track"
    : "Apply";
  const initialTrackingCode = searchParams.get('code') || searchParams.get('trackingId') || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [searchedCode, setSearchedCode] = useState(initialTrackingCode.trim().length >= 3 ? initialTrackingCode.trim() : null);
  const [trackError, setTrackError] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(initialTrackingCode.trim().length >= 3);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);
  const [submittedCode, setSubmittedCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live reactive query to Convex backend (accessible publicly)
  const backendTrackResult = useQuery(
    api.registrations.getByTrackingId,
    searchedCode ? { trackingId: searchedCode } : "skip"
  );
  const isTrackingLoading = searchedCode !== null && backendTrackResult === undefined;

  const preselectedSport = searchParams.get('sport') || "";
  const initialSport = preselectedSport && !EXCLUDED_REGISTRATION_SPORTS.includes(preselectedSport.trim().toLowerCase())
    ? preselectedSport
    : "";

  const availableSports = (rawSports.length > 0 
    ? rawSports.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
    : DEFAULT_SPORTS
  ).filter(sport => !EXCLUDED_REGISTRATION_SPORTS.includes(String(sport).trim().toLowerCase()));

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    year: "2nd Year",
    department: "CSE",
    gender: "Male",
    section: "Section 1",
    email: "",
    phone: "",
    selectedSport: initialSport,
    playingExperience: "",
    experienceCertificateFileId: ""
  });

  const [_certificateFile, setCertificateFile] = useState(null);
  const [certificateFileName, setCertificateFileName] = useState("");
  const [certificateFileSize, setCertificateFileSize] = useState("");
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState(null);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [certificateUploadError, setCertificateUploadError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (preselectedSport && !EXCLUDED_REGISTRATION_SPORTS.includes(preselectedSport.trim().toLowerCase())) {
      setFormData(prev => ({ ...prev, selectedSport: preselectedSport }));
    }
  }, [preselectedSport]);

  const handleYearChange = useCallback((newYear) => {
    setFormData(prev => {
      const availableDepts = getAvailableDepartments(newYear);
      const newDept = availableDepts.includes(prev.department) ? prev.department : availableDepts[0];
      const availableSecs = getAvailableSections(newYear, newDept);
      const curSecNum = (prev.section || '').replace('Section ', '');
      const newSecNum = availableSecs.includes(curSecNum) ? curSecNum : availableSecs[0];
      return {
        ...prev,
        year: newYear,
        department: newDept,
        section: `Section ${newSecNum}`
      };
    });
  }, []);

  useEffect(() => {
    if (availableAcademicYears.length > 0 && !availableAcademicYears.includes(formData.year)) {
      handleYearChange(availableAcademicYears[0]);
    }
  }, [availableAcademicYears, formData.year, handleYearChange]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Student full name is required.";
        } else if (!validateName(value)) {
          error = "Please enter a valid name (2-60 letters, spaces, or standard prefixes).";
        }
        break;
      case "rollNumber":
        if (!value.trim()) {
          error = "College roll number is required.";
        } else if (!validateRollNumber(value)) {
          error = "Enter a valid KITS roll number (e.g. 24JR1A0501, 25JR1A05A0, or 26JR5A0401).";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email address is required.";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address (e.g. student@kits.ac.in).";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Contact phone number is required.";
        } else if (!validatePhone(value)) {
          error = "Please enter a valid 10-digit mobile number (e.g. 9876543210).";
        }
        break;
      case "selectedSport":
        if (!value) {
          error = "Please select a preferred sport discipline.";
        }
        break;
      case "playingExperience":
        if (!value) {
          error = "Please select your playing experience.";
        } else if (value !== "No Previous Experience" && value !== "Have Playing Experience") {
          error = "Please select your playing experience.";
        }
        break;
      case "experienceCertificateFileId":
        if (formData.playingExperience === "Have Playing Experience" && !value) {
          error = "Please upload your playing experience certificate.";
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

  const handleExperienceSelect = (opt) => {
    setFormData(prev => ({
      ...prev,
      playingExperience: opt,
      experienceCertificateFileId: opt === "No Previous Experience" ? "" : prev.experienceCertificateFileId,
    }));
    setTouched(prev => ({ ...prev, playingExperience: true }));
    setErrors(prev => {
      const next = { ...prev };
      delete next.playingExperience;
      if (opt === "No Previous Experience") {
        delete next.experienceCertificateFileId;
      }
      return next;
    });

    if (opt === "No Previous Experience") {
      if (certificatePreviewUrl) {
        URL.revokeObjectURL(certificatePreviewUrl);
      }
      setCertificateFile(null);
      setCertificateFileName("");
      setCertificateFileSize("");
      setCertificatePreviewUrl(null);
      setCertificateUploadError("");
      setFileInputKey(prev => prev + 1);
    }
  };

  const handleCertificateFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertificateUploadError("");
    setTouched(prev => ({ ...prev, experienceCertificateFileId: true }));

    // Validate PDF only
    const isPdfMime = file.type === "application/pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfExt) {
      const err = "Only PDF files are allowed.";
      setCertificateUploadError(err);
      setErrors(prev => ({ ...prev, experienceCertificateFileId: err }));
      setFileInputKey(prev => prev + 1);
      return;
    }

    // Validate size <= 2 MB (2,097,152 bytes)
    const MAX_BYTES = 2097152;
    if (file.size > MAX_BYTES) {
      const err = "Certificate file size must be less than or equal to 2 MB.";
      setCertificateUploadError(err);
      setErrors(prev => ({ ...prev, experienceCertificateFileId: err }));
      setFileInputKey(prev => prev + 1);
      return;
    }

    const formattedSize = file.size < 1048576 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    setIsUploadingCertificate(true);
    try {
      const storageId = await uploadExperienceCertificate(file);
      setFormData(prev => ({ ...prev, experienceCertificateFileId: storageId }));
      setCertificateFile(file);
      setCertificateFileName(file.name);
      setCertificateFileSize(formattedSize);
      const previewUrl = URL.createObjectURL(file);
      setCertificatePreviewUrl(previewUrl);
      setCertificateUploadError("");
      setErrors(prev => {
        const next = { ...prev };
        delete next.experienceCertificateFileId;
        return next;
      });
      showToast("Certificate uploaded successfully!", "success");
    } catch (err) {
      console.error("Certificate upload error:", err);
      const msg = err.message || "Failed to upload certificate. Please try again.";
      setCertificateUploadError(msg);
      setErrors(prev => ({ ...prev, experienceCertificateFileId: msg }));
      showToast(msg, "error");
    } finally {
      setIsUploadingCertificate(false);
    }
  };

  const handleRemoveCertificate = () => {
    if (certificatePreviewUrl) {
      URL.revokeObjectURL(certificatePreviewUrl);
    }
    setCertificateFile(null);
    setCertificateFileName("");
    setCertificateFileSize("");
    setCertificatePreviewUrl(null);
    setCertificateUploadError("");
    setFormData(prev => ({ ...prev, experienceCertificateFileId: "" }));
    setFileInputKey(prev => prev + 1);
    if (touched.experienceCertificateFileId) {
      setErrors(prev => ({ ...prev, experienceCertificateFileId: "Please upload your playing experience certificate." }));
    }
  };

  const validateAll = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      rollNumber: validateField("rollNumber", formData.rollNumber),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      selectedSport: validateField("selectedSport", formData.selectedSport),
      playingExperience: validateField("playingExperience", formData.playingExperience),
      ...(formData.playingExperience === "Have Playing Experience" 
        ? { experienceCertificateFileId: validateField("experienceCertificateFileId", formData.experienceCertificateFileId) }
        : {}),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      rollNumber: true,
      email: true,
      phone: true,
      selectedSport: true,
      playingExperience: true,
      ...(formData.playingExperience === "Have Playing Experience" ? { experienceCertificateFileId: true } : {}),
    });

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAllRegistrationsClosed) {
      showToast("Registrations are currently closed for all academic years.", "error");
      return;
    }

    if (!validateAll()) {
      showToast("Please correct the highlighted form errors before submitting.", "warning");
      return;
    }

    if (isUploadingCertificate) {
      showToast("Please wait for your certificate to finish uploading.", "warning");
      return;
    }

    if (formData.playingExperience === "Have Playing Experience" && !formData.experienceCertificateFileId) {
      showToast("Please upload your playing experience certificate.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const trackingId = await addStudentApplication({
        name: sanitizeInput(formData.name.trim()),
        rollNumber: sanitizeInput(formData.rollNumber.trim().toUpperCase()),
        department: formData.department,
        year: formData.year,
        gender: formData.gender || "Male",
        section: formData.section || "Section 1",
        email: sanitizeInput(formData.email.trim().toLowerCase()),
        phone: sanitizeInput(formData.phone.trim()),
        preferredSports: [formData.selectedSport],
        playingExperience: formData.playingExperience,
        experienceCertificateFileId: formData.playingExperience === "Have Playing Experience" ? formData.experienceCertificateFileId : undefined,
      });
      const finalCode = trackingId || `KKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedCode(finalCode);
      showToast(`Registration submitted successfully for ${formData.selectedSport}!`, 'success');
      setFormData({
        name: "",
        rollNumber: "",
        year: "2nd Year",
        department: "CSE",
        gender: "Male",
        section: "Section 1",
        email: "",
        phone: "",
        selectedSport: "",
        playingExperience: "",
        experienceCertificateFileId: ""
      });
      setCertificateFile(null);
      setCertificateFileName("");
      setCertificateFileSize("");
      if (certificatePreviewUrl) URL.revokeObjectURL(certificatePreviewUrl);
      setCertificatePreviewUrl(null);
      setCertificateUploadError("");
      setFileInputKey(prev => prev + 1);
      setErrors({});
      setTouched({});
    } catch (err) {
      console.error("Submission error:", err);
      showToast('Registration failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const trackedApp = useMemo(() => {
    if (!searchedCode) return null;
    if (backendTrackResult) return backendTrackResult;

    // Fallback: check applications or students from context if available
    const code = searchedCode.toLowerCase().trim();
    const foundApp = applications.find(a => 
      (a.id && a.id.toLowerCase().trim() === code) || 
      (a.rollNumber && a.rollNumber.toLowerCase().trim() === code)
    );

    if (foundApp) return foundApp;

    const foundStudent = students.find(s => 
      (s.rollNumber && s.rollNumber.toLowerCase().trim() === code) ||
      (s.studentId && s.studentId.toLowerCase().trim() === code)
    );

    if (foundStudent) {
      return {
        id: foundStudent.studentId || foundStudent.rollNumber,
        trackingId: foundStudent.rollNumber,
        name: foundStudent.name,
        rollNumber: foundStudent.rollNumber,
        department: foundStudent.department,
        year: foundStudent.year,
        preferredSports: [foundStudent.sport || 'Campus Sports'],
        status: foundStudent.status || 'Active Member',
        remarks: 'Official Registered Sports Directorate Member',
        appliedDate: foundStudent.createdAt ? foundStudent.createdAt.split('T')[0] : ''
      };
    }

    return null;
  }, [searchedCode, backendTrackResult, applications, students]);

  const handleTrackSearch = (e) => {
    if (e) e.preventDefault();
    setTrackError("");
    const code = trackingCode.trim();

    if (!code || code.length < 3) {
      setTrackError("Please enter at least 3 characters of your Tracking Code or Roll Number.");
      return;
    }

    setSearchAttempted(true);
    setSearchedCode(code);
  };

  const handleClearTrack = () => {
    setTrackingCode("");
    setSearchedCode(null);
    setSearchAttempted(false);
    setTrackError("");
  };

  const handleCopyTrackingId = (codeToCopy) => {
    if (!codeToCopy) return;
    navigator.clipboard?.writeText(codeToCopy).then(() => {
      setCopiedTrackingId(true);
      showToast("Tracking ID copied to clipboard!", "success");
      setTimeout(() => setCopiedTrackingId(false), 2000);
    }).catch(() => {
      showToast("Failed to copy Tracking ID", "error");
    });
  };

  const getInputClass = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border text-slate-800 text-sm font-medium focus:bg-white focus:outline-none transition-colors ${
      hasError 
        ? 'border-red-400 focus:border-red-500 bg-red-50/30' 
        : 'border-slate-200 focus:border-[#0b2e5b]'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans transition-colors duration-300">
      <SEO
        title="Sports Registration & Membership Portal"
        description="Register for college sports trials, join varsity teams, apply for sports memberships, and track your application status at KKR & KSR Institute of Technology & Sciences."
        canonicalPath="/register"
      />
      
      {/* Unified Top Navbar */}
      <Navbar
        activeSection="membership"
        onOpenMembership={() => setActiveTab("Apply")}
      />

      {/* Main Registration Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[116px] sm:pt-[124px] lg:pt-40 pb-8 sm:pb-12 space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-2.5">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-[#0b2e5b]/10 text-[#0b2e5b] tracking-wider uppercase">
            Official Student Enrollment
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b2e5b] tracking-tight">
            Sports Registration & Status Tracker
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Submit your official player application for inter-collegiate tournaments, university selections, and team practice trials.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="p-1 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-1 max-w-md w-full">
            <button
              onClick={() => setActiveTab("Apply")}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "Apply"
                  ? 'bg-[#0b2e5b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0b2e5b] hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>New Registration</span>
            </button>

            <button
              onClick={() => setActiveTab("Track")}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "Track"
                  ? 'bg-[#0b2e5b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#0b2e5b] hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Application</span>
            </button>
          </div>
        </div>

        {/* TAB 1: APPLY FORM */}
        {activeTab === "Apply" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {submittedCode ? (
              <div className="p-6 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-slate-800">Registration Submitted!</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Your sports registration has been recorded successfully. Please save your application tracking code:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[#0b2e5b] text-xl font-extrabold tracking-wide">
                  {submittedCode}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setSubmittedCode(null)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                  <button
                    onClick={() => {
                      const codeToTrack = submittedCode;
                      setTrackingCode(codeToTrack);
                      setSearchedCode(codeToTrack);
                      setSearchAttempted(true);
                      setActiveTab("Track");
                      setSubmittedCode(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Track Status Now</span>
                  </button>
                </div>
              </div>
            ) : isAllRegistrationsClosed ? (
              <div className="p-8 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-3 animate-fadeIn">
                <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Registrations Are Temporarily Closed</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Online student candidate intake is currently closed for all academic years by the Sports Directorate. Please check back later or track an existing application above.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* 1. Sport Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="selectedSport" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. Select Sport Discipline <span className="text-red-500">*</span>
                    </label>
                    {touched.selectedSport && errors.selectedSport && (
                      <span className="text-[11px] text-red-500 font-semibold">{errors.selectedSport}</span>
                    )}
                  </div>
                  <select
                    id="selectedSport"
                    name="selectedSport"
                    value={formData.selectedSport}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange("selectedSport", val);
                      if (errors.selectedSport) {
                        const err = validateField("selectedSport", val);
                        setErrors(prev => ({ ...prev, selectedSport: err }));
                      }
                    }}
                    onBlur={() => handleBlur("selectedSport")}
                    className={`${getInputClass("selectedSport")} cursor-pointer`}
                  >
                    <option value="">-- Select Preferred Sport Discipline --</option>
                    {availableSports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                  {touched.selectedSport && errors.selectedSport && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.selectedSport}</p>
                  )}
                </div>

                {/* 2. Personal & Academic Info */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Student Information
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">
                        Student Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter student full name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className={getInputClass("name")}
                      />
                      {touched.name && errors.name && (
                        <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">
                        College Roll Number <span className="text-red-500">*</span>
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
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Year of Study *</label>
                      <select
                        value={formData.year}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className={getInputClass("year")}
                      >
                        {availableAcademicYears.map(y => (
                          <option key={y} value={y}>
                            {y === '4th Year' ? '4th Year (Final Year)' : y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Department *</label>
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

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Section *</label>
                      <select
                        value={formData.section}
                        onChange={(e) => handleChange("section", e.target.value)}
                        className={getInputClass("section")}
                      >
                        {getAvailableSections(formData.year, formData.department).map(sec => (
                          <option key={sec} value={`Section ${sec}`}>Section {sec}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className={getInputClass("gender")}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">
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

                    <div>
                      <label className="block text-slate-700 text-xs font-semibold mb-1">
                        Contact Phone <span className="text-red-500">*</span>
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
                </div>

                {/* 3. Playing Experience */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Playing Experience <span className="text-red-500">*</span>
                    </label>
                    {touched.playingExperience && errors.playingExperience && (
                      <span className="text-[11px] text-red-500 font-semibold">{errors.playingExperience}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERIENCE_OPTIONS.map((opt) => {
                      const isSelected = formData.playingExperience === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleExperienceSelect(opt)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl text-xs font-semibold text-left transition-all duration-200 border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 border-[#0b2e5b] text-[#0b2e5b] ring-1 ring-[#0b2e5b] shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? 'border-[#0b2e5b] bg-[#0b2e5b]' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-semibold text-slate-900">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional Certificate Upload */}
                  {formData.playingExperience === "Have Playing Experience" && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Upload Experience Certificate <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-medium">PDF only • Maximum 2 MB</span>
                      </div>

                      {!formData.experienceCertificateFileId && !isUploadingCertificate && (
                        <div className="space-y-2">
                          <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-lg hover:border-[#0b2e5b] hover:bg-white transition-all cursor-pointer group bg-white/60">
                            <Upload className="w-7 h-7 text-slate-400 group-hover:text-[#0b2e5b] transition-colors mb-2" />
                            <span className="text-xs font-bold text-[#0b2e5b]">Choose PDF</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">PDF format only • Maximum 2 MB</span>
                            <input
                              key={fileInputKey}
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleCertificateFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      {isUploadingCertificate && (
                        <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg border border-slate-200 text-xs text-[#0b2e5b] font-semibold">
                          <Loader2 className="w-4 h-4 animate-spin text-[#0b2e5b]" />
                          <span>Uploading certificate...</span>
                        </div>
                      )}

                      {formData.experienceCertificateFileId && !isUploadingCertificate && (
                        <div className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate" title={certificateFileName}>
                                {certificateFileName || "experience_certificate.pdf"}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {certificateFileSize || "PDF Document"} • <span className="text-emerald-600 font-semibold">Ready</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {certificatePreviewUrl && (
                              <a
                                href={certificatePreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-md text-[11px] font-bold text-[#0b2e5b] hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="View PDF"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View PDF</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={handleRemoveCertificate}
                              className="px-2.5 py-1.5 rounded-md text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Remove Certificate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error Messages */}
                      {((touched.experienceCertificateFileId && errors.experienceCertificateFileId) || certificateUploadError) && (
                        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{certificateUploadError || errors.experienceCertificateFileId}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting || isAllRegistrationsClosed}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#0b2e5b] hover:bg-[#0d3a73] disabled:opacity-50 text-white transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSubmitting ? (
                    <ButtonSpinner text="Validating & Submitting..." />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Sports Registration</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

        {/* TAB 2: TRACK STATUS */}
        {activeTab === "Track" && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0b2e5b]">Track Application Status</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Enter your Tracking Code (e.g. KKR-2026-XXXX) or College Roll Number to check live application status
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="space-y-4" noValidate>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tracking ID or College Roll Number
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. KKR-2026-1042 or 23JR1A12C1"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value);
                      if (trackError) setTrackError("");
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-slate-800 text-sm focus:bg-white focus:outline-none transition-colors font-mono uppercase tracking-wide ${
                      trackError ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-[#0b2e5b]'
                    }`}
                  />
                  {trackingCode && (
                    <button
                      type="button"
                      onClick={handleClearTrack}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs font-bold cursor-pointer"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isTrackingLoading}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0b2e5b] hover:bg-[#0d3a73] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isTrackingLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Check Status</span>
                    </>
                  )}
                </button>
              </div>
              {trackError && (
                <p className="text-[11px] text-red-500 font-medium">{trackError}</p>
              )}
            </form>

            {/* Loading Indicator */}
            {isTrackingLoading && (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 animate-fadeIn">
                <Loader2 className="w-8 h-8 text-[#0b2e5b] animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">Checking Directorate Records...</h4>
                  <p className="text-xs text-slate-500">Querying live registration database</p>
                </div>
              </div>
            )}

            {/* No Record Found Card */}
            {searchAttempted && !isTrackingLoading && !trackedApp && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">No Application Found</h4>
                  <p className="text-xs text-slate-600">
                    We could not find an application matching <span className="font-mono font-bold text-[#0b2e5b]">"{searchedCode}"</span>.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 bg-white p-3.5 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-1.5">
                  <p className="font-semibold text-slate-700">Please check that:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>The Tracking ID format is correct (e.g. <span className="font-mono font-bold">KKR-2026-XXXX</span>).</li>
                    <li>Or you entered your exact Roll Number (e.g. <span className="font-mono font-bold">23JR1A12C1</span>).</li>
                    <li>If you submitted recently, please verify and try again.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("Apply")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0b2e5b] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Submit New Registration</span>
                </button>
              </div>
            )}

            {/* Tracked Application Card */}
            {!isTrackingLoading && trackedApp && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden space-y-0 animate-fadeIn">
                
                {/* Header Band */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                      {trackedApp.name || trackedApp.studentName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 font-mono">
                        Tracking ID: <span className="font-bold text-[#0b2e5b]">{trackedApp.id || trackedApp.trackingId || trackedApp.rollNumber}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTrackingId(trackedApp.id || trackedApp.trackingId || trackedApp.rollNumber)}
                        title="Copy Tracking ID"
                        className="p-1 rounded-md text-slate-400 hover:text-[#0b2e5b] hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        {copiedTrackingId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto border ${
                    trackedApp.status === 'Approved' || trackedApp.status === 'Active Member'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : trackedApp.status === 'Rejected'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : trackedApp.status === 'Suspended'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {trackedApp.status === 'Approved' || trackedApp.status === 'Active Member' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : trackedApp.status === 'Rejected' ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{trackedApp.status || 'Under Review'}</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Roll Number</span>
                      <span className="font-bold text-slate-700 font-mono tracking-wide mt-0.5 block">
                        {trackedApp.rollNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Year & Department</span>
                      <span className="font-semibold text-slate-700 mt-0.5 block">
                        {trackedApp.year ? `${trackedApp.year} / ` : ''}{trackedApp.department}
                        {trackedApp.section ? ` (${trackedApp.section})` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium">Applied Sport Discipline</span>
                      <span className="font-bold text-[#0b2e5b] mt-0.5 block">
                        {Array.isArray(trackedApp.preferredSports)
                          ? trackedApp.preferredSports.join(', ')
                          : (trackedApp.preferredSports || 'Campus Sports')}
                      </span>
                    </div>

                    {trackedApp.appliedDate && (
                      <div>
                        <span className="text-slate-400 block font-medium">Application Date</span>
                        <span className="font-medium text-slate-600 mt-0.5 block">
                          {trackedApp.appliedDate}
                        </span>
                      </div>
                    )}

                    {trackedApp.playingExperience && (
                      <div>
                        <span className="text-slate-400 block font-medium">Playing Experience</span>
                        <span className="font-medium text-slate-600 mt-0.5 block">
                          {trackedApp.playingExperience}
                        </span>
                      </div>
                    )}

                    {trackedApp.experienceCertificateUrl && (
                      <div>
                        <span className="text-slate-400 block font-medium">Certificate</span>
                        <a
                          href={trackedApp.experienceCertificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-0.5"
                        >
                          <span>View PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Directorate Remarks */}
                  {trackedApp.remarks && (
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-[#0b2e5b] block">Directorate Remarks:</span>
                      <p className="leading-relaxed">{trackedApp.remarks}</p>
                    </div>
                  )}

                  {/* Bottom Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Live verification status from Sports Directorate
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTrackSearch()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0b2e5b] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* Unified Footer */}
      <Footer setActiveSection={() => handleBack()} />

    </div>
  );
}
