import React, { useState } from 'react';
import LanguageDropdown from './LanguageDropdown';

// Reusable Stat Component
const QueueStat = ({ label, value, subtitle, valueColor = "text-[#EFF2F0]" }) => (
  <div className="flex-1 p-4 flex flex-col items-start gap-1 min-w-[150px]">
    <div className="text-[#A0A8AD] text-xs font-normal leading-[20px]">{label}</div>
    <div className="flex items-center gap-3">
      <div className={`text-[26px] font-semibold leading-[35px] ${valueColor}`}>{value}</div>
      <div className="text-[#A0A8AD] text-[11px] font-normal leading-[20px]">{subtitle}</div>
    </div>
  </div>
);

// Reusable Filter Button Component
const FilterButton = ({ label, count, active, isAction, isSuccess }) => {
  let bgClass = "bg-transparent";
  let borderClass = "border-[#282C2F]";
  let textClass = "text-[#A0A8AD]";

  if (active) {
    bgClass = "bg-[#17241A]";
    borderClass = "border-[#345135]";
    textClass = "text-[#78EF63]";
  } else if (isSuccess) {
    bgClass = "bg-[#78EF63]";
    borderClass = "border-[#345135]";
    textClass = "text-[#0C0D0E]";
  } else if (isAction) {
    bgClass = "bg-[#131416]";
    borderClass = "border-[#26292E]";
    textClass = "text-[#A8ADB8]";
  }

  return (
    <div className={`flex h-[34px] px-3 items-center gap-2 rounded-[7px] border ${borderClass} ${bgClass} cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap`}>
      <span className={`text-xs font-medium leading-[20px] ${textClass}`}>
        {label} {count !== undefined && <span className="ml-1">{count}</span>}
      </span>
    </div>
  );
};

// Reusable Ticket Row Component
const TicketRow = ({ ticket, isSelected, onClick }) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center w-full min-h-[80px] p-4 md:px-4 gap-4 md:gap-0 border-b border-[#282C2F] ${isSelected ? 'bg-[#17241A]' : 'bg-transparent hover:bg-[#15181A]'} transition-colors cursor-pointer`}>
      {/* Reference / Created */}
      <div className="flex flex-col items-start w-full md:w-[160px] shrink-0">
        <div className="text-[#EFF2F0] text-xs font-medium leading-[20px]">{ticket.reference}</div>
        <div className="text-[#A0A8AD] text-[11px] font-normal leading-[20px]">{ticket.created}</div>
        <div className={`${ticket.channelColor || 'text-[#A0A8AD]'} text-[11px] font-normal leading-[20px]`}>{ticket.channel}</div>
      </div>
      
      {/* Subject / Description */}
      <div className="flex flex-col items-start w-full md:w-[430px] shrink-0">
        <div className="text-[#EFF2F0] text-[13px] font-medium leading-[20px] truncate w-full">{ticket.subject}</div>
        <div className="text-[#A0A8AD] text-[11px] font-normal leading-[20px] truncate w-full">{ticket.description}</div>
        <div className={`${ticket.media === 'No media' ? 'text-[#78828A]' : 'text-[#A0A8AD]'} text-[11px] font-normal leading-[20px]`}>{ticket.media}</div>
      </div>

      {/* Requester / Account */}
      <div className="flex flex-col items-start w-full md:w-[270px] shrink-0">
        <div className="text-[#EFF2F0] text-[13px] font-medium leading-[20px]">{ticket.requester}</div>
        <div className="text-[#A0A8AD] text-[11px] font-normal leading-[20px]">{ticket.email}</div>
        <div className={`${ticket.accountTypeColor || 'text-[#A0A8AD]'} text-[11px] font-normal leading-[20px]`}>{ticket.accountType}</div>
      </div>

      {/* Machine / Location */}
      <div className="flex flex-col items-start w-full md:w-[230px] shrink-0">
        <div className={`${ticket.machine === 'Not provided' ? 'text-[#78828A]' : 'text-[#EFF2F0]'} text-xs font-normal leading-[20px]`}>{ticket.machine}</div>
        <div className="text-[#A0A8AD] text-[11px] font-normal leading-[20px]">{ticket.location}</div>
      </div>

      {/* Request Type */}
      <div className="flex flex-col items-start w-full md:w-[260px] shrink-0">
        <div className="text-[#EFF2F0] text-xs font-normal leading-[20px]">{ticket.requestType}</div>
      </div>

      {/* Status */}
      <div className="flex flex-col items-start w-full md:w-[154px] shrink-0">
        <div className={`${ticket.statusColor} text-xs font-medium leading-[20px]`}>{ticket.status}</div>
      </div>
    </div>
  );
};

export default function AdminDashboardView({ tickets, onNewTicket, onTicketClick }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  
  const mappedTickets = tickets.map(t => ({
    id: t.id,
    reference: '#' + t.ticketId,
    created: new Date(t.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    channel: t.source || t.channel || 'Website form',
    channelColor: 'text-[#78EF63]',
    subject: t.subject,
    description: t.message || '',
    media: t.attachments && t.attachments.length > 0 ? t.attachments.length + ' files' : 'No media',
    requester: t.requesterName || 'Unknown',
    email: t.requesterEmail || t.email || 'No email',
    accountType: t.accountType || 'Customer / Guest',
    accountTypeColor: 'text-[#A0A8AD]',
    machine: t.machineId || 'Not provided',
    location: t.machineLocation || '-',
    requestType: t.requestType || 'Support',
    status: t.status,
    statusColor: t.status === 'OPEN' ? 'text-[#78EF63]' : (t.status === 'IN_PROGRESS' ? 'text-[#F1B568]' : 'text-[#A0A8AD]')
  }));


  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0C0D0E] p-4 md:p-5 gap-5 font-['Satoshi',sans-serif]">
      {/* Header */}
      <header className="flex w-full justify-between items-center shrink-0 mb-2">
        <div className="flex items-center gap-[10px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#5CEB47"/>
          </svg>
          <span className="text-[#EDF0F2] text-[17px] font-semibold">NAF Support</span>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="relative">
            <div onClick={() => setLangOpen(!langOpen)} className="flex h-[38px] px-3 items-center gap-2 rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#A0A8AD"/>
                <path d="M2 8H14M8 2C11.3333 5.33333 11.3333 10.6667 8 14C4.66667 10.6667 4.66667 5.33333 8 2Z" stroke="#A0A8AD"/>
              </svg>
              <span className="text-[#A0A8AD] text-[13px] font-medium">Language: English ↓</span>
            </div>
            {langOpen && (
              <div className="absolute top-[46px] right-0 z-50">
                <LanguageDropdown />
              </div>
            )}
          </div>
          <div className="flex py-2 px-3 items-start gap-[6px] rounded-lg border border-[#26292E] bg-[#131416] cursor-pointer hover:bg-[#1a1b1e]">
            <span className="text-[#A8ADB8] text-[11px] font-medium">Admin</span>
          </div>
        </div>
      </header>

      {/* Dashboard / Overview Info */}
      <div className="flex flex-col md:flex-row md:items-center w-full gap-3 md:gap-0 justify-between">
        <div className="flex flex-col items-start gap-1 flex-1">
          <h1 className="text-[#EFF2F0] text-[28px] font-semibold leading-[38px] m-0">Support workspace</h1>
          <p className="text-[#A0A8AD] text-[13px] font-normal leading-[20px] m-0">Every request. One queue. Website form, email and WhatsApp.</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterButton label="21 Sep 2026" />
          <div onClick={onNewTicket}><FilterButton label="+ New ticket" isSuccess /></div>
        </div>
      </div>

      {/* Queue Overview stats */}
      <div className="flex flex-wrap w-full rounded-[10px] border border-[#282C2F] bg-[#111315] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#282C2F]">
        <QueueStat label="Open" value={tickets.filter(t => t.status === "OPEN").length} subtitle="Awaiting response" />
        <QueueStat label="In Progress" value={tickets.filter(t => t.status === "IN_PROGRESS").length} subtitle="Being handled" />
        <QueueStat label="Closed" value={tickets.filter(t => t.status === "CLOSED").length} subtitle="Closed today" valueColor="text-[#78EF63]" />
      </div>

      {/* Unified Queue Component */}
      <div className="flex flex-col w-full rounded-[10px] border border-[#282C2F] bg-[#111315] overflow-hidden">
        {/* Queue Controls */}
        <div className="flex flex-col p-4 gap-4 border-b border-[#282C2F]">
          {/* Views & Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <FilterButton label="All active" count="37" active />
            <FilterButton label="Open" count="24" />
            <FilterButton label="In Progress" count="13" />
            <FilterButton label="Closed" count="12" />
            <div className="flex-1 min-w-[20px]" />
            <div className="flex w-full md:w-[322px] h-[36px] px-3 items-center gap-2 shrink-0 rounded-[7px] border border-[#282C2F]">
              <input type="text" placeholder="Search name, email, phone, reference…" className="bg-transparent border-none outline-none text-[#A0A8AD] text-xs font-medium w-full" />
            </div>
            <FilterButton label="Columns" />
            <FilterButton label="Filter" />
          </div>

          {/* Intake and classification filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <FilterButton label="All channels" count="37" active />
            <FilterButton label="Website form" count="19" />
            <FilterButton label="Email" count="10" />
            <FilterButton label="WhatsApp" count="8" />
            <div className="hidden md:block w-6 h-[1px]" />
            <FilterButton label="Request type ↓" />
            <FilterButton label="Account type ↓" />
            <FilterButton label="Status ↓" />
          </div>
        </div>

        {/* Ticket Table */}
        <div className="flex flex-col w-full overflow-x-auto">
          {/* Column Headings */}
          <div className="hidden md:flex w-full min-w-[1500px] h-[40px] px-4 items-center bg-[#15181A] border-b border-[#282C2F]">
            <div className="w-[160px] text-[#A0A8AD] text-[10px] font-medium leading-[20px] uppercase">Reference / Created</div>
            <div className="w-[430px] text-[#A0A8AD] text-[10px] font-medium leading-[20px] uppercase">Subject / Description</div>
            <div className="w-[270px] text-[#A0A8AD] text-[10px] font-medium leading-[20px] uppercase">Requester / Account</div>
            <div className="w-[230px] text-[#A0A8AD] text-[10px] font-medium leading-[20px] uppercase">Machine / Location</div>
            <div className="w-[260px] text-[#A0A8AD] text-[10px] font-medium leading-[20px] uppercase">Request Type</div>
            <div className="w-[154px] text-[#A0A8AD] text-[10px] font-medium leading-[20px] uppercase">Status</div>
          </div>

          {/* Ticket Rows */}
          <div className="flex flex-col w-full min-w-full md:min-w-[1500px]">
            {mappedTickets.map((ticket) => (
              <TicketRow 
                key={ticket.id} 
                ticket={ticket} 
                isSelected={selectedTicket === ticket.id} onClick={() => onTicketClick(tickets.find(t => t.id === ticket.id))} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
