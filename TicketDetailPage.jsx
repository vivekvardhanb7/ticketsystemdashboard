import React from 'react';

export default function TicketDetailPage() {
  return (
    <div className="flex flex-col min-h-screen w-full p-4 md:p-6 gap-5 bg-[#09090A] text-white overflow-x-hidden font-sans">
      
      {/* Ticket Header */}
      <div className="flex flex-col md:flex-row w-full min-h-[70px] justify-between items-start md:items-center gap-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[14px]">
          <button onClick={onBack} className="flex py-[9px] px-[12px] items-center gap-[6px] rounded-[10px] border border-[#282C2F] bg-[#111315] text-[#B2B8C2] font-medium text-[12px] hover:bg-white/5 transition-colors">
            ← Back
          </button>
          <div className="flex flex-col items-start gap-[5px]">
            <h1 className="text-[#EBEDF2] text-[20px] font-semibold m-0 leading-tight">
              #{ticket.ticketId} · {ticket.subject}
            </h1>
            <span className="text-[#737885] text-[11px] font-normal">
              {ticket.source || "Website form"} · {ticket.requesterName} · Created {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          <div className="flex py-[9px] px-[13px] items-center gap-[6px] rounded-[10px] border border-[#245229] bg-[#122614] text-[#61ED54] text-[11px] font-medium">
            Open
          </div>
          <button className="flex h-[34px] px-[12px] items-center gap-[8px] rounded-[7px] border border-[#345135] bg-[#78EF63] text-[#0C0D0E] text-[12px] font-medium hover:opacity-90 transition-opacity">
            Start progress
          </button>
          <button className="flex py-[9px] px-[13px] items-center gap-[6px] rounded-[10px] border border-[#572629] bg-[#291214] text-[#F58C91] text-[11px] font-medium hover:bg-[#3a181b] transition-colors">
            Close ticket
          </button>
        </div>
      </div>

      {/* Ticket Workspace */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full flex-grow">
        
        {/* Ticket Context (Left Sidebar) */}
        <div className="flex flex-col items-start gap-[12px] w-full lg:w-[340px] flex-shrink-0">
          
          {/* Ticket Details Card */}
          <div className="flex flex-col p-4 gap-[14px] w-full rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <h2 className="text-[#D1D6DE] text-[12px] font-semibold m-0">Ticket details</h2>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Source</span>
              <span className="text-[#52D170] text-[10px] font-medium">Website form</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Request type</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">Payment / Refund</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Account type</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">Customer / Guest</span>
            </div>
          </div>

          {/* Requester Card */}
          <div className="flex flex-col p-4 gap-[14px] w-full rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <h2 className="text-[#D1D6DE] text-[12px] font-semibold m-0">Requester</h2>
            <span className="text-[#E8EBF0] text-[13px] font-semibold">Sarah Klein</span>
            <span className="text-[#7A808C] text-[10px] font-normal">sarah.klein@example.com</span>
            <span className="text-[#7A808C] text-[10px] font-normal">+49 170 555 1122</span>
            <span className="text-[#A0A8AD] text-[11px] font-normal">Customer / Guest</span>
          </div>

          {/* Related Context Card */}
          <div className="flex flex-col p-4 gap-[14px] w-full rounded-[14px] border border-[#212429] bg-[#0C0C0E]">
            <h2 className="text-[#D1D6DE] text-[12px] font-semibold m-0">Related context</h2>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Transaction</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">TX-883147</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Payment</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">Visa •••• 4242</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Amount</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">€8.40</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Machine</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">NAF-VM-0231</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Location</span>
              <span className="text-[#B8BDC7] text-[10px] font-medium">Landratsamt Freiberg</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-[#6B707D] text-[10px] font-normal">Machine status</span>
              <span className="text-[#61E557] text-[10px] font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Conversation Workspace (Right Side) */}
        <div className="flex flex-col items-start gap-[12px] w-full lg:flex-1">
          
          {/* Conversation Header */}
          <div className="flex w-full h-[44px] justify-between items-center flex-shrink-0">
            <h2 className="text-[#E5E8ED] text-[14px] font-semibold m-0">Conversation</h2>
            <span className="text-[#6E7380] text-[10px] font-normal">Website form → Email replies</span>
          </div>

          {/* Conversation Timeline */}
          
          <div className="flex flex-col py-1 gap-[12px] w-full flex-grow">
            {/* Original message */}
            <div className="flex flex-col p-[14px_16px] gap-[9px] w-full rounded-[14px] border border-[#1C381F] bg-[#0E180F]">
              <div className="flex justify-between items-start w-full">
                <span className="text-[#63E070] text-[10px] font-medium">{ticket.requesterName} · {ticket.source || 'Website form'}</span>
                <span className="text-[#666B78] text-[10px] font-normal">{formatDate(ticket.createdAt)}</span>
              </div>
              <p className="text-[#C4C9D1] text-[12px] font-normal m-0 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
            </div>
            
            {/* Dynamic emails */}
            {emails.map((email, idx) => (
              <div key={idx} className={lex flex-col p-[14px_16px] gap-[9px] w-full rounded-[14px] border border-[#212429] }>
                <div className="flex justify-between items-start w-full">
                  <span className="text-[#87ABE5] text-[10px] font-medium">{email.direction === 'sent' ? 'NAF Support' : email.senderName}</span>
                  <span className="text-[#666B78] text-[10px] font-normal">{formatDate(email.receivedAt)}</span>
                </div>
                <p className="text-[#C4C9D1] text-[12px] font-normal m-0 leading-relaxed whitespace-pre-wrap">{email.bodyContent}</p>
              </div>
            ))}
          </div>

          {/* Reply Composer */}
          <div className="flex flex-col p-[14px] gap-[12px] w-full rounded-[14px] border border-[#212429] bg-[#0B0B0D]">
            
            {/* Reply Modes */}
            <div className="flex items-start gap-[8px]">
              <button className="flex py-[7px] px-[11px] items-start gap-[6px] rounded-[9px] border border-[#26522B] bg-[#142917] hover:bg-[#1a381e] transition-colors">
                <span className="text-[#66EB5C] text-[10px] font-medium">Reply by email</span>
              </button>
              <button className="flex py-[7px] px-[11px] items-start gap-[6px] rounded-[9px] border border-[#24262B] bg-[#0E0F10] hover:bg-[#1a1c1f] transition-colors">
                <span className="text-[#8F94A1] text-[10px] font-medium">Internal note</span>
              </button>
            </div>

            {/* Message Input */}
            <div className="flex w-full p-[14px] items-start gap-[8px] rounded-[10px] bg-[#080809]">
              <textarea 
                className="w-full bg-transparent border-none outline-none text-[#575C66] placeholder:text-[#575C66] text-[11px] font-normal resize-none focus:ring-0" 
                placeholder="Write a reply to Sarah…"
                rows={3}
              ></textarea>
            </div>

            {/* Composer Footer */}
            <div className="flex justify-between items-center w-full">
              <span className="text-[#575C66] text-[9px] font-normal">
                To: sarah.klein@example.com · Replies stay on email.
              </span>
              <button className="flex py-[8px] px-[14px] items-center gap-[6px] rounded-[9px] bg-[#47EB3D] hover:bg-[#3eca35] transition-colors">
                <span className="text-[#050A05] text-[10px] font-semibold">Send reply</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
