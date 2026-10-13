import React, { useState, useMemo } from 'react';
import { useConvexState } from '../../context/ConvexStateContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { AdminTablePageSkeleton } from '../../components/LoadingSkeleton';
import {
  Calendar, Plus, Search, Eye, Edit3, Trash2, ToggleLeft, ToggleRight,
  Users, User, ChevronLeft, ChevronRight, ArrowUpDown, Download,
  CheckCircle, XCircle, Clock, Archive, Send, X, AlertTriangle,
  MapPin, CalendarDays, Tag, Trophy, SlidersHorizontal, RotateCcw,
  Lock, Unlock, Minus, Save, Sparkles
} from 'lucide-react';
import EventImageUploader from '../components/EventImageUploader';
import {
  SPORTS_REGISTRATION_CONFIG,
  SPORTS_LIST,
  getSportConfig,
  parseCustomSportRules
} from '../../constants/sportsEventsConfig';

const STATUS_BADGES = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  archived: { label: 'Archived', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
};

const INITIAL_FORM = {
  title: 'Annual Cricket Championship 2026',
  shortDescription: '',
  fullDescription: '',
  category: 'Cricket',
  customSport: '',
  venue: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  registrationType: 'team',
  minTeamSize: 11,
  maxTeamSize: 16,
  capacity: '',
  registrationOpens: '',
  registrationCloses: '',
  registrationEnabled: true,
  status: 'draft',
  imageUrl: '',
  images: [],
  imageStorageIds: [],
};

const PAGE_SIZE = 10;

export default function EventsAdminPage() {
  const {
    events = [], isLoadingEvents, eventsEnabled,
    createEvent, updateEvent, publishEvent, unpublishEvent, archiveEvent, deleteEvent,
    toggleEventRegistration, eventRegistrations, loadEventRegistrations,
    cancelEventRegistration, restoreEventRegistration, deleteEventRegistration,
    updateSettings, isLoading, settings = {},
  } = useConvexState();
  const { showToast } = useToast();

  // View state
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit' | 'registrations' | 'regDetail'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type, id, title }
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [regPage, setRegPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Discipline Sizing Rules & Per-Event Overrides
  const [allowModeOverride, setAllowModeOverride] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rulesDraft, setRulesDraft] = useState({});
  const [savingRules, setSavingRules] = useState(false);

  // ─── Sport Configuration & Dynamic Sizing ──────────────────────────────
  const customSportRules = useMemo(() => {
    return parseCustomSportRules(settings);
  }, [settings]);

  const currentSportConfig = useMemo(() => {
    return getSportConfig(form.category || 'Cricket', customSportRules);
  }, [form.category, customSportRules]);

  const selectedSportKey = useMemo(() => {
    if (form.category && SPORTS_LIST.includes(form.category)) {
      return form.category;
    }
    if (form.customSport || (form.category && !SPORTS_LIST.includes(form.category))) {
      return 'Other / Custom';
    }
    return 'Cricket';
  }, [form.category, form.customSport]);

  const handleSportChange = (sportName) => {
    const cfg = getSportConfig(sportName, customSportRules);
    const isTeamOnly = cfg.supportedTypes.length === 1 && cfg.supportedTypes[0] === 'team';
    const isIndivOnly = cfg.supportedTypes.length === 1 && cfg.supportedTypes[0] === 'individual';

    let nextType = form.registrationType;
    if (isTeamOnly) {
      nextType = 'team';
    } else if (isIndivOnly) {
      nextType = 'individual';
    } else if (!cfg.supportedTypes.includes(nextType)) {
      nextType = cfg.defaultType;
    }

    setForm((prev) => {
      const sportCategory = sportName === 'Other / Custom' ? (prev.customSport || '') : sportName;
      const newTitle = (!prev.title || prev.title.startsWith('Annual') || prev.title.startsWith('Inter-College'))
        ? `Annual ${sportCategory || 'Sports'} Championship 2026`
        : prev.title;

      return {
        ...prev,
        category: sportCategory,
        customSport: sportName === 'Other / Custom' ? prev.customSport : '',
        registrationType: nextType,
        minTeamSize: nextType === 'team' ? cfg.minTeamSize : prev.minTeamSize,
        maxTeamSize: nextType === 'team' ? cfg.maxTeamSize : prev.maxTeamSize,
        title: newTitle,
      };
    });
  };

  // ─── Discipline Rules Modal Handlers ──────────────────────────────────
  const openRulesModal = () => {
    const draft = {};
    SPORTS_LIST.forEach((sport) => {
      const base = SPORTS_REGISTRATION_CONFIG[sport];
      const custom = customSportRules[sport] || {};
      draft[sport] = {
        minTeamSize: custom.minTeamSize !== undefined ? Number(custom.minTeamSize) : base.minTeamSize,
        maxTeamSize: custom.maxTeamSize !== undefined ? Number(custom.maxTeamSize) : base.maxTeamSize,
        supportedTypes: custom.supportedTypes ? [...custom.supportedTypes] : [...base.supportedTypes],
        defaultType: custom.defaultType || base.defaultType,
      };
    });
    setRulesDraft(draft);
    setShowRulesModal(true);
  };

  const handleUpdateRuleDraft = (sport, field, value) => {
    setRulesDraft((prev) => ({
      ...prev,
      [sport]: {
        ...prev[sport],
        [field]: value,
      },
    }));
  };

  const handleToggleDraftType = (sport, type) => {
    setRulesDraft((prev) => {
      const current = prev[sport]?.supportedTypes || ['team'];
      let nextTypes;
      if (current.includes(type)) {
        if (current.length === 1) {
          showToast('Sport must support at least one registration mode', 'warning');
          return prev;
        }
        nextTypes = current.filter((t) => t !== type);
      } else {
        nextTypes = [...current, type];
      }
      const defaultType = nextTypes.includes(prev[sport]?.defaultType)
        ? prev[sport]?.defaultType
        : nextTypes[0];
      return {
        ...prev,
        [sport]: {
          ...prev[sport],
          supportedTypes: nextTypes,
          defaultType,
        },
      };
    });
  };

  const handleResetSingleSportDraft = (sport) => {
    const base = SPORTS_REGISTRATION_CONFIG[sport];
    setRulesDraft((prev) => ({
      ...prev,
      [sport]: {
        minTeamSize: base.minTeamSize,
        maxTeamSize: base.maxTeamSize,
        supportedTypes: [...base.supportedTypes],
        defaultType: base.defaultType,
      },
    }));
    showToast(`${sport} reset to official regulation bounds in draft`, 'info');
  };

  const handleSaveDisciplineRules = async () => {
    for (const sport of SPORTS_LIST) {
      const rule = rulesDraft[sport];
      if (!rule) continue;
      if (rule.minTeamSize < 1) {
        showToast(`Min team size for ${sport} must be at least 1`, 'error');
        return;
      }
      if (rule.maxTeamSize < rule.minTeamSize) {
        showToast(`Max team size for ${sport} must be ≥ min team size (${rule.minTeamSize})`, 'error');
        return;
      }
      if (!rule.supportedTypes || rule.supportedTypes.length === 0) {
        showToast(`Please select at least one supported mode for ${sport}`, 'error');
        return;
      }
    }

    setSavingRules(true);
    try {
      await updateSettings({
        sport_sizing_rules: JSON.stringify(rulesDraft),
      });
      showToast('Discipline sizing rules saved successfully!', 'success');
      setShowRulesModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save rules', 'error');
    } finally {
      setSavingRules(false);
    }
  };

  const handleResetAllDisciplineRules = async () => {
    setSavingRules(true);
    try {
      await updateSettings({
        sport_sizing_rules: '',
      });
      const draft = {};
      SPORTS_LIST.forEach((sport) => {
        const base = SPORTS_REGISTRATION_CONFIG[sport];
        draft[sport] = {
          minTeamSize: base.minTeamSize,
          maxTeamSize: base.maxTeamSize,
          supportedTypes: [...base.supportedTypes],
          defaultType: base.defaultType,
        };
      });
      setRulesDraft(draft);
      showToast('All sports reset to official regulation sizing rules', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reset rules', 'error');
    } finally {
      setSavingRules(false);
    }
  };

  // ─── Toggle Events Section ────────────────────────────────────────────
  const handleToggleEvents = async () => {
    try {
      await updateSettings({ eventsEnabled: eventsEnabled ? 'false' : 'true' });
      showToast(eventsEnabled ? 'Events section disabled' : 'Events section enabled', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to toggle events', 'error');
    }
  };

  // ─── Form Handlers ────────────────────────────────────────────────────
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.category || !form.category.trim()) return 'Please select or enter a sport.';
    if (!form.title.trim()) return 'Event title is required.';
    if (!form.shortDescription.trim()) return 'Short description is required.';
    if (!form.eventDate) return 'Event date is required.';
    if (form.registrationType === 'team') {
      if (!form.minTeamSize || form.minTeamSize < 1) return 'Minimum team size must be at least 1.';
      if (!form.maxTeamSize || form.maxTeamSize < form.minTeamSize) return 'Max team size must be ≥ min team size.';
    }
    if (form.registrationOpens && form.registrationCloses) {
      if (new Date(form.registrationCloses) <= new Date(form.registrationOpens)) {
        return 'Registration closing date must be after opening date.';
      }
    }
    return null;
  };

  const handleCreate = async () => {
    const error = validateForm();
    if (error) return showToast(error, 'error');
    setSaving(true);
    try {
      const sportName = form.category.trim();
      const eventImages = form.images && form.images.length > 0
        ? form.images.slice(0, 2)
        : (form.imageUrl ? [form.imageUrl] : []);
      const { customSport: _customSport, ...formPayload } = form;
      await createEvent({
        ...formPayload,
        category: sportName,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        minTeamSize: form.registrationType === 'team' ? Number(form.minTeamSize) : undefined,
        maxTeamSize: form.registrationType === 'team' ? Number(form.maxTeamSize) : undefined,
        imageUrl: eventImages[0] || form.imageUrl || '',
        images: eventImages,
        imageStorageIds: form.imageStorageIds || [],
      });
      showToast(`Event created for ${sportName}!`, 'success');
      setView('list');
      setForm({ ...INITIAL_FORM });
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    const error = validateForm();
    if (error) return showToast(error, 'error');
    setSaving(true);
    try {
      const sportName = form.category.trim();
      const eventImages = form.images && form.images.length > 0
        ? form.images.slice(0, 2)
        : (form.imageUrl ? [form.imageUrl] : []);
      const { customSport: _customSport, ...formPayload } = form;
      await updateEvent(selectedEvent._id, {
        ...formPayload,
        category: sportName,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        minTeamSize: form.registrationType === 'team' ? Number(form.minTeamSize) : undefined,
        maxTeamSize: form.registrationType === 'team' ? Number(form.maxTeamSize) : undefined,
        imageUrl: eventImages[0] || form.imageUrl || '',
        images: eventImages,
        imageStorageIds: form.imageStorageIds || [],
      });
      showToast('Event updated successfully!', 'success');
      setView('list');
      setSelectedEvent(null);
    } catch (err) {
      showToast(err.message || 'Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (event) => {
    setSelectedEvent(event);
    const isStandardSport = event.category && SPORTS_LIST.includes(event.category);
    const sportCfg = getSportConfig(event.category, customSportRules);
    const isOverride = !sportCfg.supportedTypes.includes(event.registrationType);
    setAllowModeOverride(isOverride);
    const eventImages = (event.images && event.images.length > 0)
      ? event.images
      : (event.imageUrl ? [event.imageUrl] : []);
    setForm({
      title: event.title || '',
      shortDescription: event.shortDescription || '',
      fullDescription: event.fullDescription || '',
      category: event.category || 'Cricket',
      customSport: !isStandardSport && event.category ? event.category : '',
      venue: event.venue || '',
      eventDate: event.eventDate || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      registrationType: event.registrationType || 'team',
      minTeamSize: event.minTeamSize ?? sportCfg.minTeamSize,
      maxTeamSize: event.maxTeamSize ?? sportCfg.maxTeamSize,
      capacity: event.capacity || '',
      registrationOpens: event.registrationOpens || '',
      registrationCloses: event.registrationCloses || '',
      registrationEnabled: event.registrationEnabled ?? true,
      status: event.status || 'draft',
      imageUrl: event.imageUrl || eventImages[0] || '',
      images: eventImages,
      imageStorageIds: event.imageStorageIds || [],
    });
    setView('edit');
  };

  const openRegistrations = (event) => {
    setSelectedEvent(event);
    loadEventRegistrations(event._id);
    setRegPage(1);
    setView('registrations');
  };

  // ─── Confirmation Dialogs ─────────────────────────────────────────────
  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      switch (confirmAction.type) {
        case 'delete':
          await deleteEvent(confirmAction.id);
          showToast('Event deleted', 'success');
          break;
        case 'archive':
          await archiveEvent(confirmAction.id);
          showToast('Event archived', 'success');
          break;
        case 'publish':
          await publishEvent(confirmAction.id);
          showToast('Event published!', 'success');
          break;
        case 'unpublish':
          await unpublishEvent(confirmAction.id);
          showToast('Event unpublished', 'success');
          break;
        case 'toggleReg':
          await toggleEventRegistration(confirmAction.id);
          showToast('Registration toggled', 'success');
          break;
        case 'cancelReg':
          await cancelEventRegistration(confirmAction.id);
          showToast('Registration cancelled', 'success');
          loadEventRegistrations(selectedEvent._id);
          break;
        case 'restoreReg':
          await restoreEventRegistration(confirmAction.id);
          showToast('Registration restored', 'success');
          loadEventRegistrations(selectedEvent._id);
          break;
        case 'deleteReg':
          await deleteEventRegistration(confirmAction.id);
          showToast('Registration deleted', 'success');
          loadEventRegistrations(selectedEvent._id);
          break;
        default:
          break;
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  // ─── Filtered & Sorted Events ─────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q) ||
          (e.venue || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [events, searchQuery, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pagedEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ─── Registration Data ────────────────────────────────────────────────
  const regs = eventRegistrations || [];
  const regTotalPages = Math.max(1, Math.ceil(regs.length / PAGE_SIZE));
  const pagedRegs = regs.slice((regPage - 1) * PAGE_SIZE, regPage * PAGE_SIZE);

  // ─── Export ───────────────────────────────────────────────────────────
  const handleExportRegistrations = () => {
    if (regs.length === 0) return showToast('No registrations to export', 'warning');
    try {
      const XLSX = require('xlsx');
      const data = regs.map((r) => ({
        'Registration ID': r._id,
        'Type': r.registrationType,
        'Name': r.fullName || r.teamName || '',
        'Team Name': r.teamName || '',
        'Email': r.email,
        'Phone': r.phone,
        'College': r.college || '',
        'Team Size': r.teamSize || '',
        'Status': r.status,
        'Registered': r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
      XLSX.writeFile(wb, `event-registrations-${selectedEvent?.title?.replace(/\s+/g, '-') || 'export'}.xlsx`);
      showToast('Export downloaded!', 'success');
    } catch {
      showToast('Export failed. XLSX library may not be available.', 'error');
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────
  if (isLoading || isLoadingEvents) return <AdminTablePageSkeleton />;

  // ─── FORM VIEW ────────────────────────────────────────────────────────
  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { setView('list'); setSelectedEvent(null); setForm({ ...INITIAL_FORM }); }} className="p-2 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{view === 'create' ? 'Create Event' : 'Edit Event'}</h2>
              <p className="text-[10px] text-[var(--text-muted)]">{view === 'create' ? 'Add a new event to the system' : `Editing: ${selectedEvent?.title}`}</p>
            </div>
          </div>
          <button
            onClick={view === 'create' ? handleCreate : handleUpdate}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            {view === 'create' ? 'Create Event' : 'Save Changes'}
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sport & Basic Information */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Sport & Basic Details
            </h3>

            {/* Sport Dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                Sport Discipline *
              </label>
              <select
                value={selectedSportKey}
                onChange={(e) => handleSportChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/30"
              >
                {SPORTS_LIST.map((sport) => {
                  const cfg = SPORTS_REGISTRATION_CONFIG[sport];
                  const typeLabel = cfg.supportedTypes.length === 1
                    ? (cfg.supportedTypes[0] === 'team' ? `Team (${cfg.minTeamSize}–${cfg.maxTeamSize})` : 'Individual')
                    : `Individual / Team (${cfg.minTeamSize}–${cfg.maxTeamSize})`;
                  return (
                    <option key={sport} value={sport}>
                      {sport} — {typeLabel}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* If Other / Custom Sport, show text input */}
            {selectedSportKey === 'Other / Custom' && (
              <FormField
                label="Custom Sport Name *"
                value={form.customSport || ''}
                onChange={(v) => {
                  handleFormChange('customSport', v);
                  handleFormChange('category', v);
                }}
                placeholder="Enter custom sport discipline"
              />
            )}

            {/* Sport Regulation Summary Badge */}
            <div className="p-3 rounded-lg bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-xs space-y-1">
              <div className="font-bold text-[#0b2e5b] dark:text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {currentSportConfig.name} Regulation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-200/70 dark:bg-blue-500/20 text-[#0b2e5b] dark:text-blue-200">
                  {currentSportConfig.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {currentSportConfig.description}
              </p>
            </div>

            <FormField
              label="Event Title *"
              value={form.title}
              onChange={(v) => handleFormChange('title', v)}
              placeholder={`e.g., Annual ${form.category || 'Cricket'} Championship 2026`}
            />
            <FormField
              label="Short Description *"
              value={form.shortDescription}
              onChange={(v) => handleFormChange('shortDescription', v)}
              placeholder="Brief one-line summary of the event"
            />
            <FormTextarea
              label="Full Description & Rules"
              value={form.fullDescription}
              onChange={(v) => handleFormChange('fullDescription', v)}
              placeholder="Detailed rules, match formats, eligibility criteria, fixtures schedule, etc."
            />
          </div>

          {/* Event Details */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Event Details</h3>
            <FormField label="Event Date *" type="date" value={form.eventDate} onChange={(v) => handleFormChange('eventDate', v)} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Time" type="time" value={form.startTime} onChange={(v) => handleFormChange('startTime', v)} />
              <FormField label="End Time" type="time" value={form.endTime} onChange={(v) => handleFormChange('endTime', v)} />
            </div>
            <FormField label="Venue" value={form.venue} onChange={(v) => handleFormChange('venue', v)} placeholder="e.g., Main Sports Ground / Indoor Stadium" icon={<MapPin className="w-3.5 h-3.5" />} />
            <FormField label="Capacity (Max Registrations)" type="number" value={form.capacity} onChange={(v) => handleFormChange('capacity', v)} placeholder="Leave empty for unlimited" />
          </div>

          {/* Registration Settings */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4" /> Registration & Team Sizing
            </h3>

            {/* Registration Type Toggle */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Registration Mode *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllowModeOverride((prev) => !prev)}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      allowModeOverride
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:text-[var(--text-primary)]'
                    }`}
                    title="Unlock to allow Single or Team mode regardless of default discipline rules"
                  >
                    {allowModeOverride ? <Unlock className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3" />}
                    {allowModeOverride ? 'Mode Unlocked' : 'Unlock Override'}
                  </button>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {allowModeOverride
                      ? 'Override Active'
                      : currentSportConfig.supportedTypes.length === 1
                        ? `Locked to ${currentSportConfig.supportedTypes[0] === 'team' ? 'Team' : 'Individual'}`
                        : 'Single & Team'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!allowModeOverride && !currentSportConfig.supportedTypes.includes('individual')}
                  onClick={() => handleFormChange('registrationType', 'individual')}
                  className={`p-3 rounded-lg border-2 text-xs font-bold text-center transition-all ${
                    form.registrationType === 'individual'
                      ? 'border-[#0d3a73] bg-[#0d3a73]/5 text-[#0d3a73] dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
                      : !allowModeOverride && !currentSportConfig.supportedTypes.includes('individual')
                        ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  Single User
                  {!allowModeOverride && !currentSportConfig.supportedTypes.includes('individual') && (
                    <span className="block text-[9px] font-normal text-amber-600 dark:text-amber-400 mt-0.5">
                      Team sport only
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!allowModeOverride && !currentSportConfig.supportedTypes.includes('team')}
                  onClick={() => {
                    handleFormChange('registrationType', 'team');
                    if (!form.minTeamSize || form.minTeamSize < 1) {
                      handleFormChange('minTeamSize', currentSportConfig.minTeamSize);
                    }
                    if (!form.maxTeamSize || form.maxTeamSize < form.minTeamSize) {
                      handleFormChange('maxTeamSize', currentSportConfig.maxTeamSize);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 text-xs font-bold text-center transition-all ${
                    form.registrationType === 'team'
                      ? 'border-[#0d3a73] bg-[#0d3a73]/5 text-[#0d3a73] dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
                      : !allowModeOverride && !currentSportConfig.supportedTypes.includes('team')
                        ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  Team
                  {!allowModeOverride && !currentSportConfig.supportedTypes.includes('team') && (
                    <span className="block text-[9px] font-normal text-amber-600 dark:text-amber-400 mt-0.5">
                      Individual only
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Team Size Fields (Configured based on selected sport with full admin control) */}
            {form.registrationType === 'team' && (
              <div className="space-y-3.5 p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Team Size Bounds</span>
                    {(Number(form.minTeamSize) !== Number(currentSportConfig.minTeamSize) || Number(form.maxTeamSize) !== Number(currentSportConfig.maxTeamSize)) && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                        Custom Bounds
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Discipline Default: <strong>{currentSportConfig.minTeamSize}–{currentSportConfig.maxTeamSize}</strong>
                    </span>
                    {(Number(form.minTeamSize) !== Number(currentSportConfig.minTeamSize) || Number(form.maxTeamSize) !== Number(currentSportConfig.maxTeamSize)) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleFormChange('minTeamSize', currentSportConfig.minTeamSize);
                          handleFormChange('maxTeamSize', currentSportConfig.maxTeamSize);
                          showToast(`Reset to ${currentSportConfig.name} defaults (${currentSportConfig.minTeamSize}–${currentSportConfig.maxTeamSize})`, 'info');
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        title="Reset to discipline standard values"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Min Team Size with Stepper */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                      Min Team Size (Players) *
                    </label>
                    <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden focus-within:ring-2 focus-within:ring-[#0d3a73]/20">
                      <button
                        type="button"
                        onClick={() => handleFormChange('minTeamSize', Math.max(1, (Number(form.minTeamSize) || 2) - 1))}
                        disabled={Number(form.minTeamSize) <= 1}
                        className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30 transition-colors"
                        title="Decrease minimum team size"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={form.maxTeamSize || 50}
                        value={form.minTeamSize}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 1);
                          handleFormChange('minTeamSize', val);
                          if (form.maxTeamSize < val) {
                            handleFormChange('maxTeamSize', val);
                          }
                        }}
                        className="w-full text-center py-2 bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = (Number(form.minTeamSize) || 1) + 1;
                          handleFormChange('minTeamSize', nextVal);
                          if (form.maxTeamSize < nextVal) {
                            handleFormChange('maxTeamSize', nextVal);
                          }
                        }}
                        className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                        title="Increase minimum team size"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                      Min players required to register
                    </span>
                  </div>

                  {/* Max Team Size with Stepper */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                      Max Team Size (Players) *
                    </label>
                    <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden focus-within:ring-2 focus-within:ring-[#0d3a73]/20">
                      <button
                        type="button"
                        onClick={() => handleFormChange('maxTeamSize', Math.max(Number(form.minTeamSize) || 1, (Number(form.maxTeamSize) || 2) - 1))}
                        disabled={Number(form.maxTeamSize) <= Number(form.minTeamSize)}
                        className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30 transition-colors"
                        title="Decrease maximum team size"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={form.minTeamSize || 1}
                        max="100"
                        value={form.maxTeamSize}
                        onChange={(e) => {
                          const val = Math.max(Number(form.minTeamSize) || 1, Number(e.target.value) || 1);
                          handleFormChange('maxTeamSize', val);
                        }}
                        className="w-full text-center py-2 bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleFormChange('maxTeamSize', (Number(form.maxTeamSize) || 2) + 1)}
                        className="px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                        title="Increase maximum team size"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                      Max allowed players (incl. captain & reserves)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
                  <span>
                    Teams registering must submit between <strong>{form.minTeamSize || 2}</strong> and <strong>{form.maxTeamSize || 10}</strong> members.
                  </span>
                  <button
                    type="button"
                    onClick={openRulesModal}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline shrink-0"
                  >
                    Edit Discipline Defaults
                  </button>
                </div>
              </div>
            )}

            {/* Registration Period */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Registration Opens" type="datetime-local" value={form.registrationOpens} onChange={(v) => handleFormChange('registrationOpens', v)} />
              <FormField label="Registration Closes" type="datetime-local" value={form.registrationCloses} onChange={(v) => handleFormChange('registrationCloses', v)} />
            </div>
          </div>

          {/* Publication & Media */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Tag className="w-4 h-4" /> Publication & Media</h3>
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/30"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            {/* Rich Event Images Uploader (up to 2) */}
            <EventImageUploader
              images={form.images?.length > 0 ? form.images : (form.imageUrl ? [form.imageUrl] : [])}
              imageStorageIds={form.imageStorageIds || []}
              onChange={({ images: newImages, imageStorageIds: newStorageIds, imageUrl: newPrimaryUrl }) => {
                setForm(prev => ({
                  ...prev,
                  images: newImages,
                  imageStorageIds: newStorageIds,
                  imageUrl: newPrimaryUrl,
                }));
              }}
              disabled={saving}
            />
          </div>
        </div>

        {/* Global Discipline Sizing Rules Modal */}
        {showRulesModal && (
          <DisciplineRulesModal
            isOpen={showRulesModal}
            onClose={() => setShowRulesModal(false)}
            draft={rulesDraft}
            onUpdateDraft={handleUpdateRuleDraft}
            onToggleDraftType={handleToggleDraftType}
            onResetSingleSport={handleResetSingleSportDraft}
            onResetAll={handleResetAllDisciplineRules}
            onSave={handleSaveDisciplineRules}
            saving={savingRules}
          />
        )}
      </div>
    );
  }

  // ─── REGISTRATIONS VIEW ───────────────────────────────────────────────
  if (view === 'registrations' && selectedEvent) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { setView('list'); setSelectedEvent(null); }} className="p-2 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Registrations</h2>
              <p className="text-[10px] text-[var(--text-muted)]">{selectedEvent.title} · {regs.filter(r => r.status === 'confirmed').length} confirmed</p>
            </div>
          </div>
          <button onClick={handleExportRegistrations} className="px-4 py-2 rounded-lg text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] flex items-center gap-2 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        {/* Registration Detail Modal */}
        {selectedReg && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedReg(null)}>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Registration Details</h3>
                <button onClick={() => setSelectedReg(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)]"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 text-xs">
                {selectedReg.registrationType === 'team' ? (
                  <>
                    <DetailRow label="Team Name" value={selectedReg.teamName} />
                    <DetailRow label="Captain" value={selectedReg.fullName} />
                    <DetailRow label="Team Size" value={selectedReg.teamSize} />
                  </>
                ) : (
                  <DetailRow label="Full Name" value={selectedReg.fullName} />
                )}
                <DetailRow label="Email" value={selectedReg.email} />
                <DetailRow label="Phone" value={selectedReg.phone} />
                {selectedReg.college && <DetailRow label="College" value={selectedReg.college} />}
                {selectedReg.gender && <DetailRow label="Gender" value={selectedReg.gender} />}
                <DetailRow label="Status" value={selectedReg.status} />
                <DetailRow label="Registered" value={selectedReg.createdAt ? new Date(selectedReg.createdAt).toLocaleString() : '—'} />

                {/* Team Members */}
                {selectedReg.registrationType === 'team' && selectedReg.teamMembers?.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-color)]">
                    <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-2">Team Members</h4>
                    <div className="space-y-1.5">
                      {selectedReg.teamMembers.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-card-subtle)] text-[11px]">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.role === 'captain' ? 'bg-amber-500/15 text-amber-600' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {m.role === 'captain' ? 'C' : (i + 1)}
                          </span>
                          <span className="font-semibold text-[var(--text-primary)]">{m.name}</span>
                          {m.email && <span className="text-[var(--text-muted)]">· {m.email}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {regs.length === 0 ? (
          <EmptyState title="No Registrations Yet" description="No one has registered for this event yet." icon={Users} />
        ) : (
          <>
            {/* Table */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[var(--bg-card-subtle)] border-b border-[var(--border-color)]">
                      <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">#</th>
                      <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">
                        {selectedEvent.registrationType === 'team' ? 'Team' : 'Name'}
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Email</th>
                      <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Phone</th>
                      {selectedEvent.registrationType === 'team' && (
                        <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Size</th>
                      )}
                      <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Date</th>
                      <th className="px-4 py-3 text-right font-bold text-[var(--text-secondary)] uppercase text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRegs.map((reg, idx) => (
                      <tr key={reg._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td className="px-4 py-3 text-[var(--text-muted)]">{(regPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                          {selectedEvent.registrationType === 'team' ? reg.teamName : reg.fullName}
                          {selectedEvent.registrationType === 'team' && <div className="text-[10px] text-[var(--text-muted)]">Capt: {reg.fullName}</div>}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{reg.email}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{reg.phone}</td>
                        {selectedEvent.registrationType === 'team' && (
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{reg.teamSize || '—'}</td>
                        )}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${reg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setSelectedReg(reg)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="View Details">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {reg.status === 'confirmed' ? (
                              <button onClick={() => setConfirmAction({ type: 'cancelReg', id: reg._id, title: reg.fullName || reg.teamName })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400" title="Cancel">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button onClick={() => setConfirmAction({ type: 'restoreReg', id: reg._id, title: reg.fullName || reg.teamName })} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Restore">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => setConfirmAction({ type: 'deleteReg', id: reg._id, title: reg.fullName || reg.teamName })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {regTotalPages > 1 && (
              <Pagination page={regPage} totalPages={regTotalPages} onChange={setRegPage} />
            )}
          </>
        )}

        {/* Confirm Dialog */}
        {confirmAction && <ConfirmDialog action={confirmAction} onConfirm={executeConfirmAction} onCancel={() => setConfirmAction(null)} />}
      </div>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2"><Calendar className="w-5 h-5" /> Events Management</h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Create and manage events, track registrations</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Discipline Sizing Rules */}
          <button
            onClick={openRulesModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
            title="Configure min and max team size limits and allowed registration modes across all sports disciplines"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Discipline Sizing Rules
          </button>

          {/* Global Toggle */}
          <button
            onClick={handleToggleEvents}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              eventsEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
            }`}
          >
            {eventsEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Events {eventsEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => {
              setView('create');
              const defCfg = getSportConfig('Cricket', customSportRules);
              setAllowModeOverride(false);
              setForm({
                ...INITIAL_FORM,
                minTeamSize: defCfg.minTeamSize,
                maxTeamSize: defCfg.maxTeamSize,
              });
              setSelectedEvent(null);
            }}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Create Event
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)]"
          />
        </div>
        <button
          onClick={() => {
            if (sortField === 'createdAt') {
              setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
            } else {
              setSortField('createdAt');
              setSortDir('desc');
            }
          }}
          className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
          title="Toggle sort order"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Yet"
          description="Create your first event to start accepting registrations."
          icon={Calendar}
        />
      ) : (
        <>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--bg-card-subtle)] border-b border-[var(--border-color)]">
                    <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Event</th>
                    <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Type</th>
                    <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Status</th>
                    <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Reg.</th>
                    <th className="px-4 py-3 text-left font-bold text-[var(--text-secondary)] uppercase text-[10px]">Capacity</th>
                    <th className="px-4 py-3 text-right font-bold text-[var(--text-secondary)] uppercase text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedEvents.map((event) => {
                    const badge = STATUS_BADGES[event.status] || STATUS_BADGES.draft;
                    return (
                      <tr key={event._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* Thumbnail preview */}
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)] shrink-0 flex items-center justify-center">
                              {event.imageUrl || (event.images && event.images[0]) ? (
                                <img
                                  src={event.imageUrl || event.images[0]}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Calendar className="w-5 h-5 text-[var(--text-muted)] opacity-50" />
                              )}
                              {event.images && event.images.length > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded text-[8.5px] font-bold bg-black/75 text-white leading-tight">
                                  2
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[var(--text-primary)] max-w-[200px] truncate" title={event.title}>
                                {event.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {event.category && (
                                  <span className="flex items-center gap-1 text-[10px] text-[#0b2e5b] dark:text-blue-400 font-semibold">
                                    <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>{event.category}</span>
                                  </span>
                                )}
                                {event.images && event.images.length > 1 && (
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                    2 photos
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            event.registrationType === 'team'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                          }`}>
                            {event.registrationType === 'team' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {event.registrationType === 'team'
                              ? `Team (${event.minTeamSize || 2}–${event.maxTeamSize || 10})`
                              : 'Individual'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${event.registrationEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                            {event.registrationEnabled ? 'Open' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {event.registrationCount || 0}{event.capacity ? ` / ${event.capacity}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openRegistrations(event)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="View Registrations">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(event)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Edit">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {event.status === 'draft' ? (
                              <button onClick={() => setConfirmAction({ type: 'publish', id: event._id, title: event.title })} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Publish">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            ) : event.status === 'published' ? (
                              <button onClick={() => setConfirmAction({ type: 'unpublish', id: event._id, title: event.title })} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Unpublish">
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                            <button onClick={() => setConfirmAction({ type: 'toggleReg', id: event._id, title: event.title })} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]" title="Toggle Registration">
                              {event.registrationEnabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            </button>
                            {event.status !== 'archived' && (
                              <button onClick={() => setConfirmAction({ type: 'archive', id: event._id, title: event.title })} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500" title="Archive">
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => setConfirmAction({ type: 'delete', id: event._id, title: event.title })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
        </>
      )}

      {/* Confirm Dialog */}
      {confirmAction && <ConfirmDialog action={confirmAction} onConfirm={executeConfirmAction} onCancel={() => setConfirmAction(null)} />}

      {/* Global Discipline Sizing Rules Modal */}
      {showRulesModal && (
        <DisciplineRulesModal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          draft={rulesDraft}
          onUpdateDraft={handleUpdateRuleDraft}
          onToggleDraftType={handleToggleDraftType}
          onResetSingleSport={handleResetSingleSportDraft}
          onResetAll={handleResetAllDisciplineRules}
          onSave={handleSaveDisciplineRules}
          saving={savingRules}
        />
      )}
    </div>
  );
}

// ── Shared Sub-Components ─────────────────────────────────────────────────────

function DisciplineRulesModal({
  isOpen,
  onClose,
  draft,
  onUpdateDraft,
  onToggleDraftType,
  onResetSingleSport,
  onResetAll,
  onSave,
  saving,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between flex-wrap gap-3 bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Sport Discipline Sizing & Participation Rules
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Set minimum & maximum team size limits and permitted registration modes per sport discipline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table / List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#0b2e5b] dark:text-blue-300">
                Discipline-Level Defaults
              </p>
              <p className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                Changes saved here will apply automatically as the default team sizing and allowed modes when creating or editing events for these sports. You can still customize sizes per event if needed.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {SPORTS_LIST.map((sport) => {
              const rule = draft[sport] || {};
              const base = SPORTS_REGISTRATION_CONFIG[sport];
              const isModified =
                rule.minTeamSize !== base.minTeamSize ||
                rule.maxTeamSize !== base.maxTeamSize ||
                JSON.stringify(rule.supportedTypes?.slice().sort()) !== JSON.stringify(base.supportedTypes.slice().sort());

              const supportsIndiv = rule.supportedTypes?.includes('individual');
              const supportsTeam = rule.supportedTypes?.includes('team');

              return (
                <div
                  key={sport}
                  className={`p-4 rounded-xl border transition-all ${
                    isModified
                      ? 'border-purple-300 dark:border-purple-800/80 bg-purple-50/30 dark:bg-purple-950/10'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Sport Info */}
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{sport}</h4>
                        {isModified && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                            Customized
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        Official Regulation: {base.minTeamSize}–{base.maxTeamSize} players ({base.tag})
                      </p>
                    </div>

                    {/* Sizing & Modes */}
                    <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
                      {/* Allowed Modes */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Modes:</span>
                        <button
                          type="button"
                          onClick={() => onToggleDraftType(sport, 'individual')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                            supportsIndiv
                              ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500 dark:text-blue-300'
                              : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-slate-400'
                          }`}
                        >
                          Single
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleDraftType(sport, 'team')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                            supportsTeam
                              ? 'bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-500/20 dark:border-purple-500 dark:text-purple-300'
                              : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-slate-400'
                          }`}
                        >
                          Team
                        </button>
                      </div>

                      {/* Min Team Size */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Min:</span>
                        <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden">
                          <button
                            type="button"
                            disabled={Number(rule.minTeamSize) <= 1}
                            onClick={() => onUpdateDraft(sport, 'minTeamSize', Math.max(1, (Number(rule.minTeamSize) || 2) - 1))}
                            className="px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30"
                            title="Decrease min team size"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={rule.maxTeamSize || 50}
                            value={rule.minTeamSize ?? 2}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              onUpdateDraft(sport, 'minTeamSize', val);
                              if (rule.maxTeamSize < val) {
                                onUpdateDraft(sport, 'maxTeamSize', val);
                              }
                            }}
                            className="w-12 text-center text-xs font-bold text-[var(--text-primary)] bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = (Number(rule.minTeamSize) || 1) + 1;
                              onUpdateDraft(sport, 'minTeamSize', val);
                              if (rule.maxTeamSize < val) {
                                onUpdateDraft(sport, 'maxTeamSize', val);
                              }
                            }}
                            className="px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
                            title="Increase min team size"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Max Team Size */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Max:</span>
                        <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden">
                          <button
                            type="button"
                            disabled={Number(rule.maxTeamSize) <= Number(rule.minTeamSize)}
                            onClick={() => onUpdateDraft(sport, 'maxTeamSize', Math.max(Number(rule.minTeamSize) || 1, (Number(rule.maxTeamSize) || 2) - 1))}
                            className="px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30"
                            title="Decrease max team size"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min={rule.minTeamSize || 1}
                            max="100"
                            value={rule.maxTeamSize ?? 10}
                            onChange={(e) => {
                              const val = Math.max(Number(rule.minTeamSize) || 1, Number(e.target.value) || 1);
                              onUpdateDraft(sport, 'maxTeamSize', val);
                            }}
                            className="w-12 text-center text-xs font-bold text-[var(--text-primary)] bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateDraft(sport, 'maxTeamSize', (Number(rule.maxTeamSize) || 2) + 1)}
                            className="px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)]"
                            title="Increase max team size"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Reset Button */}
                      {isModified && (
                        <button
                          type="button"
                          onClick={() => onResetSingleSport(sport)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
                          title="Reset this sport to regulation default"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={onResetAll}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All to Regulation
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Discipline Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text', icon }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-8' : 'pl-3'} pr-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)] transition-colors`}
        />
      </div>
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#0d3a73]/20 placeholder:text-[var(--text-muted)] resize-none transition-colors"
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-[var(--text-muted)] font-medium min-w-[90px]">{label}</span>
      <span className="text-[var(--text-primary)] font-semibold">{value || '—'}</span>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="text-xs text-[var(--text-muted)] font-medium px-3">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ConfirmDialog({ action, onConfirm, onCancel }) {
  const messages = {
    delete: { title: 'Delete Event', desc: 'This will permanently delete this event and all its registrations.', color: 'text-red-600 dark:text-red-400' },
    archive: { title: 'Archive Event', desc: 'This event will be archived and hidden from public view.', color: 'text-amber-600 dark:text-amber-400' },
    publish: { title: 'Publish Event', desc: 'This event will become visible on the public website.', color: 'text-emerald-600 dark:text-emerald-400' },
    unpublish: { title: 'Unpublish Event', desc: 'This event will be moved back to draft status.', color: 'text-amber-600 dark:text-amber-400' },
    toggleReg: { title: 'Toggle Registration', desc: 'This will toggle registration open/closed for this event.', color: 'text-blue-600 dark:text-blue-400' },
    cancelReg: { title: 'Cancel Registration', desc: 'This registration will be marked as cancelled.', color: 'text-red-600 dark:text-red-400' },
    restoreReg: { title: 'Restore Registration', desc: 'This registration will be restored to confirmed status.', color: 'text-emerald-600 dark:text-emerald-400' },
    deleteReg: { title: 'Delete Registration', desc: 'This registration will be permanently removed.', color: 'text-red-600 dark:text-red-400' },
  };
  const msg = messages[action.type] || { title: 'Confirm', desc: 'Are you sure?', color: '' };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className={`w-5 h-5 ${msg.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{msg.title}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">{msg.desc}</p>
            {action.title && <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">"{action.title}"</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border-color)] transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  );
}
