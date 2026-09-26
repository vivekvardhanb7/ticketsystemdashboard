import re

with open('NewTicketModal.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

replacement = '''export default function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    machineId: '',
    accountType: '',
    requestType: '',
    subject: '',
    message: '',
    sendConfirmation: true,
  });
  const [attachments, setAttachments] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // basic submit logic
    setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex flex-col items-start gap-[20px] rounded-[16px] border border-[#282C2F] bg-[#111315] p-[28px] overflow-hidden w-full max-w-[520px]">
          <div className="text-[#78EF63] font-semibold text-[24px] leading-[32px]">✓  Ticket created</div>
          <div className="text-[#EFF2F0] font-medium text-[14px] leading-[20px]">#NAF-NEW · Open</div>
          <div className="text-[#A0A8AD] font-normal text-[14px] leading-[20px]">Your ticket is ready.</div>
          <button onClick={() => { setShowSuccess(false); onClose(); }} className="flex items-center justify-center gap-[8px] h-[34px] px-[12px] rounded-[7px] border border-[#345135] bg-[#17241A] text-[#78EF63] font-medium text-[12px] leading-[20px]">
            Back to tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
'''

code = code.replace('const NewTicketModal = ({ onClose }) => {\\n  return (', replacement)
code = code.replace('<button className="flex h-[34px] px-4 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:bg-[#6bd658] transition-colors focus:outline-none text-[#0C0D0E] text-xs font-medium leading-5 font-inter">\\n          Create ticket\\n        </button>', '<button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] px-4 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#78EF63] hover:bg-[#6bd658] transition-colors focus:outline-none text-[#0C0D0E] text-xs font-medium leading-5 font-inter">{isSubmitting ? "Creating..." : "Create ticket"}</button>')

with open('NewTicketModal.jsx', 'w', encoding='utf-8') as f:
    f.write(code + "\\n")
