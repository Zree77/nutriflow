import  { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api';

// TIMEZONE SAFE FORMATTER (Fixes the IST to UTC date shift bug)
const toLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PauseDeliveryModal({ isOpen, onClose, preSelectedDate, onPauseSuccess, activeSubscriptionId }) {
  console.log('[PauseDeliveryModal DEBUG] received activeSubscriptionId prop:', activeSubscriptionId);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRescheduledDate, setSelectedRescheduledDate] = useState(null);
  const [rescheduleOptions, setRescheduleOptions] = useState([]);
  const [isPausing, setIsPausing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const [pauseInfo, setPauseInfo] = useState({
    remainingPauses: 2,
    usedPauses: 0,
    pausesLimit: 2,
    pausedDates: [],
    subscriptionStartDate: "",
    subscriptionEndDate: "",
  });

  const [tomorrowMeal] = useState({
    name: "Berry Granola Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop",
    deliverySlot: "8:00 AM - 9:30 AM"
  });

  const [datesList, setDatesList] = useState([]);

  const checkIsPastCutoff = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const dayBefore = new Date(targetDate);
    dayBefore.setDate(targetDate.getDate() - 1);
    dayBefore.setHours(19, 0, 0, 0);
    return now.getTime() >= dayBefore.getTime();
  };

  const checkIsPaused = (date) => {
    if (!date || !pauseInfo.pausedDates) return false;
    const dateStr = toLocalDateString(date);
    return pauseInfo.pausedDates.includes(dateStr);
  };

  const checkIsOutsideSubscription = (date) => {
    if (!pauseInfo.subscriptionStartDate || !pauseInfo.subscriptionEndDate) return false;
    const dateStr = toLocalDateString(date);
    return dateStr < pauseInfo.subscriptionStartDate || dateStr > pauseInfo.subscriptionEndDate;
  };

  const generateDatesList = () => {
    const list = [];
    let count = 0;
    let dayOffset = 1;

    while (count < 5) {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        list.push(d);
        count++;
      }
      dayOffset++;
    }
    setDatesList(list);

    let preSelect = null;
    if (preSelectedDate) {
      const parsedPre = new Date(preSelectedDate);
      if (!checkIsPaused(parsedPre) && !checkIsPastCutoff(parsedPre) && !checkIsOutsideSubscription(parsedPre)) {
        preSelect = parsedPre;
      }
    }
    if (!preSelect) {
      preSelect = list.find(d => !checkIsPaused(d) && !checkIsPastCutoff(d) && !checkIsOutsideSubscription(d));
    }
    setSelectedDate(preSelect || list[0]);
  };

  // Generate only the next 3 weekday options after selectedDate
  useEffect(() => {
    if (selectedDate) {
      const options = [];
      let count = 0;
      let dayOffset = 1;
      while (count < 3) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + dayOffset);
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          options.push(d);
          count++;
        }
        dayOffset++;
      }
      setRescheduleOptions(options);
      setSelectedRescheduledDate(options[0]);
    } else {
      setRescheduleOptions([]);
      setSelectedRescheduledDate(null);
    }
  }, [selectedDate, pauseInfo.pausedDates]);

  const fetchStatus = async () => {
    console.log('[PauseDeliveryModal] fetchStatus called. activeSubscriptionId =', activeSubscriptionId);
    if (!activeSubscriptionId) {
      console.warn('[PauseDeliveryModal] No activeSubscriptionId — skipping fetchStatus');
      return;
    }
    try {
      const url = `/subscriptions/pauses/status?subscriptionId=${activeSubscriptionId}`;
      console.log('[PauseDeliveryModal] GET', url);
      const res = await api.get(url);
      console.log('[PauseDeliveryModal] Pause status response:', res.data);
      if (res.data && res.data.success) {
        const data = res.data.data;
        setPauseInfo({
          remainingPauses: data.canPause ? (2 - (data.pausesUsed ?? 0)) : 0,
          usedPauses: data.pausesUsed ?? 0,
          pausesLimit: data.pausesLimit ?? 2,
          pausedDates: (data.pauseableDays || [])
            .filter(d => !d.canPause)
            .map(d => d.date),
          subscriptionStartDate: data.subscriptionStartDate || "",
          subscriptionEndDate: data.subscriptionEndDate || "",
        });
      }
    } catch (err) {
      console.error('[PauseDeliveryModal] fetchStatus error:', err.response?.data || err.message || err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatusMsg("");
      setIsError(false);

      // 1. Generate date list IMMEDIATELY — no delay
      generateDatesList();

      // 2. Fetch backend status safely & independently
      if (activeSubscriptionId) {
        fetchStatus();
      }
    }
  }, [isOpen, activeSubscriptionId]);

  // Re-verify selectedDate validity when pauseInfo loads
  useEffect(() => {
    if (isOpen && datesList.length > 0 && selectedDate) {
      const isCurrentDisabled = checkIsPaused(selectedDate) || checkIsPastCutoff(selectedDate) || checkIsOutsideSubscription(selectedDate);
      if (isCurrentDisabled) {
        const validDate = datesList.find(d => !checkIsPaused(d) && !checkIsPastCutoff(d) && !checkIsOutsideSubscription(d));
        if (validDate) {
          setSelectedDate(validDate);
        }
      }
    }
  }, [pauseInfo]);

  const handlePauseConfirm = async () => {
    if (!selectedDate) return;
    setIsPausing(true);
    setStatusMsg("");
    setIsError(false);

    if (!activeSubscriptionId) {
      setIsError(true);
      setStatusMsg("Unable to identify your subscription. Please refresh the page and try again.");
      setIsPausing(false);
      return;
    }

    if (pauseInfo.remainingPauses <= 0) {
      setIsError(true);
      setStatusMsg("No pauses remaining for this subscription.");
      setIsPausing(false);
      return;
    }

    if (checkIsOutsideSubscription(selectedDate)) {
      setIsError(true);
      setStatusMsg("Selected date is outside your subscription period.");
      setIsPausing(false);
      return;
    }

    if (checkIsPastCutoff(selectedDate)) {
      setIsError(true);
      setStatusMsg("Pause deadline passed. Requests must be placed before 7:00 PM the day before delivery.");
      setIsPausing(false);
      return;
    }

    if (!selectedRescheduledDate) {
      setIsError(true);
      setStatusMsg("Please select a reschedule date before confirming.");
      setIsPausing(false);
      return;
    }

    const originalDateStr = toLocalDateString(selectedDate);
    const rescheduledDateStr = toLocalDateString(selectedRescheduledDate);

    const payload = {
      subscriptionId: activeSubscriptionId,
      originalDate: originalDateStr,
      rescheduledDate: rescheduledDateStr,
    };

    try {
      const res = await api.post('/subscriptions/pauses', payload, { timeout: 8000 });

      if (res.data && res.data.success) {
        const remaining = (payload.subscriptionId ? (2 - (res.data.data?.pausesUsed ?? 0)) : 0);
        setStatusMsg("Successfully paused delivery!");
        onPauseSuccess?.({
          remainingPauses: remaining,
          pausedDate: originalDateStr,
          rescheduledDate: rescheduledDateStr,
          action: 'paused'
        });
        setTimeout(() => onClose(), 1200);
      } else {
        setIsError(true);
        setStatusMsg(res.data?.message || "Failed to pause delivery.");
      }
    } catch (err) {
      setIsError(true);
      let errorMessage = "Failed to pause delivery. Please try again.";

      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please check your network and try again.";
      } else if (err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data === 'string') {
          errorMessage = `Server returned an error (Status ${err.response.status}). Check backend logs.`;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error && data.error.message) {
          errorMessage = data.error.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setStatusMsg(errorMessage);
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async (dateStr) => {
    setIsPausing(true);
    setStatusMsg("");
    setIsError(false);

    const resumePayload = {
      subscriptionId: activeSubscriptionId,
      originalDate: dateStr,
    };

    try {
      const res = await api.post('/subscriptions/pauses/resume', resumePayload, { timeout: 8000 });

      if (res.data && res.data.success) {
        const remaining = (res.data.data.pausesLimit ?? 2) - (res.data.data.pausesUsed ?? 0);
        setStatusMsg("Successfully resumed delivery!");
        onPauseSuccess?.({
          remainingPauses: remaining,
          pausedDate: dateStr,
          rescheduledDate: null,
          action: 'resumed'
        });
        await fetchStatus();
      }
    } catch (err) {
      setIsError(true);
      console.error('[PauseDeliveryModal] Resume Error:', err.response?.data || err.message || err);
      setStatusMsg(err.response?.data?.message || "Failed to resume delivery.");
    } finally {
      setIsPausing(false);
    }
  };

  const formatDateStr = (str) => {
    if (!str) return "";
    const [y, m, d] = str.split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 md:p-8 space-y-6 text-left"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#4DB552] via-[#1F4D2C] to-[#4DB552] rounded-t-[32px]" />

          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <div className="w-12 h-12 rounded-full bg-[#EAF7EB] text-[#1F4D2C] flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold">⏸</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pause Delivery Day</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Skip any delivery day and automatically reschedule the meal to another weekday.
            </p>
          </div>

          {!activeSubscriptionId ? (
            <div className="bg-[#F8FAF5] rounded-3xl p-8 border border-[#D7E9D7] text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#1F4D2C] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading subscription details...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F8FAF5] rounded-3xl p-5 border border-[#D7E9D7] flex flex-col justify-between">
              <div className="flex gap-3.5 items-start">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                  <img src={tomorrowMeal.image} alt={tomorrowMeal.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Meal Highlight</span>
                  <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">{tomorrowMeal.name}</h4>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100/50 mt-4 flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Delivery Window: {tomorrowMeal.deliverySlot}</span>
              </div>
            </div>

            <div className="bg-[#F8FAF5] rounded-3xl p-5 border border-[#D7E9D7] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Pause Date</span>
                <div className="flex gap-2 overflow-x-auto pt-3 pb-2 scrollbar-none flex-nowrap">
                  {datesList.map((date) => {
                    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                    const isPaused = checkIsPaused(date);
                    const isPastCutoff = checkIsPastCutoff(date);
                    const isOutside = checkIsOutsideSubscription(date);
                    const isDisabled = isPaused || isPastCutoff || isOutside;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dateNum = date.getDate();

                    let btnStyle = "bg-white border-gray-200 text-slate-600 hover:border-[#1F4D2C]/30";
                    if (isOutside) {
                      btnStyle = "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed line-through";
                    } else if (isPaused) {
                      btnStyle = "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60";
                    } else if (isPastCutoff) {
                      btnStyle = "bg-gray-50 border-gray-150 text-gray-400 cursor-not-allowed opacity-60";
                    } else if (isSelected) {
                      btnStyle = "bg-[#EAF7EB] border-2 border-[#1F4D2C] text-[#1F4D2C]";
                    }

                    return (
                      <motion.button
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        key={date.toISOString()}
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(date)}
                        className={`min-w-[60px] p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center relative ${btnStyle}`}
                      >
                        <span className={`text-[8px] font-bold uppercase ${isSelected && !isDisabled ? 'text-[#1F4D2C]' : 'text-slate-400'}`}>{dayName}</span>
                        <span className={`text-base font-extrabold mt-0.5 ${isSelected && !isDisabled ? 'text-[#1F4D2C]' : 'text-slate-800'}`}>{dateNum}</span>
                        
                        {isPaused && (
                          <span className="absolute -top-1 -right-1 bg-[#1F4D2C] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">⏸</span>
                        )}
                        {isPastCutoff && !isPaused && (
                          <span className="text-[7px] text-red-500 font-bold mt-0.5">Expired</span>
                        )}
                        {isOutside && (
                          <span className="text-[7px] text-gray-400 font-bold mt-0.5">Inactive</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {selectedDate && !checkIsPaused(selectedDate) && !checkIsPastCutoff(selectedDate) && !checkIsOutsideSubscription(selectedDate) && (
            <div className="bg-[#F8FAF5] rounded-3xl p-5 border border-[#D7E9D7] text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Reschedule Meal to (next 3 available days):</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
                {rescheduleOptions.map((resDate) => {
                  const isResSelected = selectedRescheduledDate && selectedRescheduledDate.toDateString() === resDate.toDateString();
                  const dayName = resDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const dateNum = resDate.getDate();

                  return (
                    <button
                      type="button"
                      key={resDate.toISOString()}
                      onClick={() => setSelectedRescheduledDate(resDate)}
                      className={`min-w-[55px] p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isResSelected
                          ? "bg-[#1F4D2C] border-2 border-[#1F4D2C] text-white font-bold"
                          : "bg-white border-gray-200 text-slate-600 hover:border-[#1F4D2C]/30"
                      }`}
                    >
                      <span className={`text-[8px] font-bold uppercase ${isResSelected ? 'text-white/80' : 'text-slate-400'}`}>{dayName}</span>
                      <span className={`text-base font-extrabold mt-0.5 ${isResSelected ? 'text-white' : 'text-slate-800'}`}>{dateNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pauseInfo.pausedDates && pauseInfo.pausedDates.length > 0 && (
            <div className="bg-[#F8FAF5] rounded-3xl p-6 border border-[#D7E9D7] space-y-3 text-left">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1F4D2C]" />
                <span>Currently Paused Meals</span>
              </h3>
              <div className="space-y-2">
                {pauseInfo.pausedDates.map(dateStr => {
                  const dateObj = new Date(dateStr + "T00:00:00");
                  const isPastCutoff = checkIsPastCutoff(dateObj);
                  return (
                    <div key={dateStr} className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        {isPastCutoff && <span className="text-[10px] text-red-500 font-bold">Cutoff passed</span>}
                      </div>
                      {!isPastCutoff && (
                        <button
                          onClick={() => handleResume(dateStr)}
                          disabled={isPausing}
                          className="px-4 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition border border-red-100 cursor-pointer"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[#F8FAF5] rounded-3xl p-6 border border-[#D7E9D7] space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1F4D2C]" />
              <span>Important Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-500 font-medium">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#1F4D2C]">⏰</span>
                  <p className="leading-relaxed"><strong className="font-bold text-slate-700">Cutoff Time:</strong> Before 7:00 PM the previous day.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#1F4D2C]">📊</span>
                  <p className="leading-relaxed"><strong className="font-bold text-slate-700">Usage Limit:</strong> 2 pauses total for this subscription (lifetime).</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#1F4D2C]">✅</span>
                  <p className="leading-relaxed">Subscription and remaining breakfasts are not affected.</p>
                </div>
                {pauseInfo.remainingPauses > 0 ? (
                  <div className="flex flex-col gap-1 text-green-700 font-bold bg-[#EAF7EB] px-3 py-1.5 rounded-xl border border-[#1F4D2C]/10">
                    <div className="flex items-center gap-1"><span>💡</span><p>{pauseInfo.remainingPauses} of {pauseInfo.pausesLimit} pauses remaining for this subscription.</p></div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-1"><span>⚠️</span><p>No pauses remaining for this subscription.</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>)}

          {statusMsg && (
            <div className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold border ${isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[#EAF7EB] text-[#1F4D2C] border-[#1F4D2C]/10'}`}>
              {isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-white border border-gray-200 text-slate-600 text-sm font-bold cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition text-center">
              Keep Delivery
            </button>
            <button
              onClick={handlePauseConfirm}
              disabled={isPausing || pauseInfo.remainingPauses <= 0 || !selectedDate || checkIsPaused(selectedDate) || checkIsPastCutoff(selectedDate) || checkIsOutsideSubscription(selectedDate)}
              className={`flex-1 py-3.5 rounded-2xl text-white text-sm font-bold cursor-pointer transition text-center flex items-center justify-center gap-2 shadow-lg ${
                pauseInfo.remainingPauses <= 0 || !selectedDate || checkIsPaused(selectedDate) || checkIsPastCutoff(selectedDate) || checkIsOutsideSubscription(selectedDate)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
                  : "bg-[#1F4D2C] hover:bg-[#173C22] shadow-green-950/10"
              }`}
            >
              {isPausing ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Confirm & Pause</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}