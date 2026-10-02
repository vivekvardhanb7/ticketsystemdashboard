import React from 'react';

const NewTicketModal = ({ onClose }) => {
  return (
    <div className="flex flex-col items-start gap-3 p-7 rounded-2xl border border-[#282C2F] bg-[#111315] overflow-hidden w-full max-w-[760px] font-sans">
      {/* Modal header */}
      <div className="flex w-full h-[38px] items-center gap-2.5 overflow-hidden relative">
        <div className="text-[#EFF2F0] text-2xl font-semibold leading-8 ">
          New ticket
        </div>
        <div className="flex h-px items-start flex-1 overflow-hidden relative"></div>
        <button 
          onClick={onClose}
          className="flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors focus:outline-none"
        >
          <span className="text-[#A0A8AD] text-xs font-medium leading-5 ">×</span>
        </button>
      </div>

      <div className="text-[#A0A8AD] text-[13px] font-normal leading-5 ">
        Create a support request on behalf of a customer.
      </div>

      {/* Reply channel */}
      <div className="flex w-full flex-col items-start gap-2 overflow-hidden relative mt-1">
        <div className="text-[#A0A8AD] text-[11px] font-medium leading-5 uppercase tracking-wide ">
          REPLY CHANNEL
        </div>
        <div className="flex w-full items-start gap-2 overflow-hidden relative">
          <button className="flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] focus:outline-none">
            <span className="text-[#78EF63] text-xs font-medium leading-5 ">Email</span>
          </button>
          <button className="flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#282C2F] hover:bg-[#1A1D20] transition-colors focus:outline-none">
            <span className="text-[#A0A8AD] text-xs font-medium leading-5 ">WhatsApp</span>
          </button>
        </div>
        <div className="text-[#A0A8AD] text-xs font-normal leading-5 ">
          Replies will be sent by email. The channel stays fixed for this ticket.
        </div>
      </div>

      {/* Contact fields */}
      <div className="flex flex-col md:flex-row w-full items-start gap-4 overflow-hidden relative mt-1">
        <div className="flex flex-col items-start gap-1.5 flex-1 w-full overflow-hidden relative">
          <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Full name *</label>
          <input 
            type="text" 
            placeholder="Enter full name" 
            className="flex w-full h-[42px] px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all placeholder:text-[#78828A]"
          />
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1 w-full overflow-hidden relative">
          <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Email *</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            className="flex w-full h-[42px] px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all placeholder:text-[#78828A]"
          />
        </div>
      </div>

      {/* Optional details */}
      <div className="flex flex-col md:flex-row w-full items-start gap-4 overflow-hidden relative">
        <div className="flex flex-col items-start gap-1.5 flex-1 w-full overflow-hidden relative">
          <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Phone number</label>
          <input 
            type="text" 
            placeholder="Optional" 
            className="flex w-full h-[42px] px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all placeholder:text-[#78828A]"
          />
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1 w-full overflow-hidden relative">
          <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Machine ID / Location</label>
          <input 
            type="text" 
            placeholder="Optional" 
            className="flex w-full h-[42px] px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all placeholder:text-[#78828A]"
          />
        </div>
      </div>

      {/* Classification */}
      <div className="flex flex-col md:flex-row w-full items-start gap-4 overflow-hidden relative">
        <div className="flex flex-col items-start gap-1.5 flex-1 w-full overflow-hidden relative">
          <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Account type *</label>
          <div className="relative w-full h-[42px]">
            <select className="appearance-none flex w-full h-full px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all cursor-pointer">
              <option value="" disabled selected hidden>Select account type  ↓</option>
              <option value="1">Type 1</option>
              <option value="2">Type 2</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#78828A]">
              ↓
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 flex-1 w-full overflow-hidden relative">
          <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Request type *</label>
          <div className="relative w-full h-[42px]">
            <select className="appearance-none flex w-full h-full px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all cursor-pointer">
              <option value="" disabled selected hidden>Select request type  ↓</option>
              <option value="1">Support</option>
              <option value="2">Billing</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#78828A]">
              ↓
            </div>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="flex w-full flex-col items-start gap-1.5 overflow-hidden relative mt-1">
        <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Subject *</label>
        <input 
          type="text" 
          placeholder="Briefly describe the request" 
          className="flex w-full h-[42px] px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all placeholder:text-[#78828A]"
        />
      </div>

      {/* Message / Description */}
      <div className="flex w-full flex-col items-start gap-1.5 overflow-hidden relative">
        <label className="text-[#A0A8AD] text-xs font-medium leading-5 ">Message / Description *</label>
        <textarea 
          placeholder="What happened? Include any details that will help us." 
          className="flex w-full h-[78px] px-3 py-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[#78828A] text-[13px] font-normal leading-5  outline-none resize-none focus:border-[#78EF63] focus:ring-1 focus:ring-[#78EF63]/50 transition-all placeholder:text-[#78828A]"
        />
      </div>

      {/* Upload media */}
      <button className="flex w-full h-[48px] px-3 items-center gap-3 rounded-[7px] border border-[#282C2F] hover:bg-[#1A1D20] transition-colors focus:outline-none">
        <span className="text-[#A0A8AD] text-xs font-normal leading-5 ">＋ Add photos, video or audio</span>
      </button>

      {/* Notification choice */}
      <div className="flex w-full flex-col items-start gap-1 overflow-hidden relative mt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="w-[14px] h-[14px] rounded-[3px] border border-[#78EF63] bg-[#78EF63] flex items-center justify-center">
            <span className="text-[#0C0D0E] text-[10px] font-bold">✓</span>
          </div>
          <span className="text-[#EFF2F0] text-xs font-normal leading-5 ">
            Send a ticket confirmation to the customer
          </span>
        </label>
        <div className="text-[#A0A8AD] text-[11px] font-normal leading-5  ml-5">
          New tickets start as Open. * Required fields
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#282C2F] relative my-1"></div>

      {/* Modal footer */}
      <div className="flex w-full h-[38px] justify-end items-center gap-2.5 overflow-hidden relative">
        <button 
          onClick={onClose}
          className="flex h-[34px] px-4 items-center gap-2 rounded-[7px] border border-[#282C2F] hover:bg-[#1A1D20] transition-colors focus:outline-none text-[#A0A8AD] text-xs font-medium leading-5 "
        >
          Cancel
        </button>
        <button className="flex h-[34px] px-4 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:bg-[#6bd658] transition-colors focus:outline-none text-[#0C0D0E] text-xs font-medium leading-5 ">
          Create ticket
        </button>
      </div>
    </div>
  );
};

export default NewTicketModal;
\n