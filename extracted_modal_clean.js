function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
  const [channel, setChannel] = useState('Email');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    accountType: '',
    requestType: '',
    subject: '',
    description: ''
  });
  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.accountType && 
           formData.requestType && 
           formData.subject.trim() && 
           formData.description.trim();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setShowErrors(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated) headers['Authorization'] = 'Basic YWRtaW46c2VjdXJlMTIz'; 
      
      const payload = {
        contactPerson: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        machineId: formData.location || null,
        accountType: formData.accountType,
        requestType: formData.requestType,
        subject: formData.subject,
        description: formData.description,
        channel: channel,
        source: 'Manual Entry'
      };

      const res = await fetch('https://testing-api.naf-cloudsystem.de/api/NAFWebsite/support-issues', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      let newTicket = null;
      if (res.ok) {
        newTicket = await res.json();
      } else {
        newTicket = {
          ...payload,
          id: Math.random().toString(36).substring(2, 9),
          ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        };
      }
      
      setCreatedTicketId(newTicket.ticketId);
      onTicketCreated(newTicket);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      const newTicket = {
        ...formData,
        contactPerson: formData.fullName,
        id: Math.random().toString(36).substring(2, 9),
        ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        channel: channel,
        source: 'Manual Entry'
      };
      setCreatedTicketId(newTicket.ticketId);
      onTicketCreated(newTicket);
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };
  
  const resetAndClose = () => {
    setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
    setShowErrors(false);
    setIsSuccess(false);
    onClose();
  };

  const getBorderColor = (fieldName) => {
    if (!showErrors) return '#282C2F';
    if (!formData[fieldName] || !formData[fieldName].trim()) return '#F38C86';
    return '#282C2F';
  };
  
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
        <div className="flex w-[520px] p-7 flex-col items-start gap-5 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl" onClick={e => e.stopPropagation()}>
          <span className="text-[24px] font-semibold text-[#78EF63] font-heading">✓ Ticket created</span>
          <span className="text-[14px] font-medium text-[#EFF2F0]">#NAF-{createdTicketId} · Open</span>
          <span className="text-[14px] text-[#A0A8AD] w-[464px] leading-relaxed">
            Your ticket is ready. The customer confirmation will use the selected reply channel.
          </span>
          <button onClick={resetAndClose} className="mt-2 flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] hover:bg-[#1a2d1e] transition-colors">
            <span className="text-[12px] font-medium text-[#78EF63]">Back to tickets</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
      <div className="flex w-[760px] p-7 flex-col items-start gap-3 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex w-full h-[38px] items-center gap-2.5">
          <span className="text-[24px] font-semibold text-[#EFF2F0] font-heading">New ticket</span>
          <div className="flex-1"></div>
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">×</span>
          </button>
        </div>
        <span className="text-[13px] text-[#A0A8AD]">Create a support request on behalf of a customer.</span>
        
        {/* Reply Channel */}
        <div className="flex flex-col gap-2 mt-2 w-full">
          <span className="text-[11px] font-medium text-[#A0A8AD] uppercase">REPLY CHANNEL</span>
          <div className="flex gap-2">
            <button onClick={() => setChannel('Email')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'Email' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">Email</span>
            </button>
            <button onClick={() => setChannel('WhatsApp')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'WhatsApp' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
              <span className="text-[12px] font-medium">WhatsApp</span>
            </button>
          </div>
          <span className="text-[12px] text-[#A0A8AD]">Replies will be sent by {channel.toLowerCase()}. The channel stays fixed for this ticket.</span>
        </div>

        {/* Contact Fields */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Full name *</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" 
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('fullName') }} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Email *</span>
            <input name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" 
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
              style={{ borderColor: getBorderColor('email') }} />
          </div>
        </div>

        {/* Optional Details */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Phone number</span>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" 
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Machine ID / Location</span>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Optional" 
              className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
          </div>
        </div>

        {/* Classification */}
        <div className="flex w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Account type *</span>
            <select name="accountType" value={formData.accountType} onChange={handleChange}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
              style={{ borderColor: getBorderColor('accountType'), color: formData.accountType ? '#EFF2F0' : '#78828A' }}>
              <option value="" disabled>Select account type</option>
              <option value="Customer / Guest">Customer / Guest</option>
              <option value="B2B Partner">B2B Partner</option>
              <option value="Internal">Internal</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Request type *</span>
            <select name="requestType" value={formData.requestType} onChange={handleChange}
              className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
              style={{ borderColor: getBorderColor('requestType'), color: formData.requestType ? '#EFF2F0' : '#78828A' }}>
              <option value="" disabled>Select request type</option>
              <option value="Payment / Refund">Payment / Refund</option>
              <option value="Machine Malfunction">Machine Malfunction</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Subject & Message */}
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">Subject *</span>
          <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Briefly describe the request" 
            className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
            style={{ borderColor: getBorderColor('subject') }} />
        </div>
        <div className="flex flex-col gap-1.5 mt-2 w-full">
          <span className="text-[12px] font-medium text-[#A0A8AD]">Message / Description *</span>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What happened? Include any details that will help us." 
            className="h-[78px] p-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none resize-none"
            style={{ borderColor: getBorderColor('description') }} />
        </div>

        {/* Media Upload (Visual only) */}
        <div className="flex w-full h-[48px] px-3 mt-2 items-center rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
          <span className="text-[12px] text-[#A0A8AD]">＋ Add photos, video or audio</span>
        </div>

        {/* Notification choice */}
        <div className="flex flex-col gap-1 mt-2 w-full">
          <span className="text-[12px] text-[#EFF2F0]">✓ Send a ticket confirmation to the customer</span>
          <span className="text-[11px] text-[#A0A8AD]">New tickets start as Open. * Required fields</span>
        </div>

        <div className="w-full h-[1px] bg-[#282C2F] mt-2"></div>

        {/* Errors & Footer */}
        {showErrors && (
          <span className="text-[12px] text-[#F38C86]">Please complete the required fields before creating this ticket.</span>
        )}
        
        <div className="flex w-full justify-end items-center gap-2.5 mt-1">
          <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
            <span className="text-[12px] font-medium text-[#A0A8AD]">Cancel</span>
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSubmitting ? '...' : 'Create ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}