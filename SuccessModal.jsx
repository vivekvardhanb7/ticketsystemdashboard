import React from 'react';

const SuccessModal = () => {
  return (
    <div className="flex flex-col items-start gap-[20px] rounded-[16px] border border-[#282C2F] bg-[#111315] p-[28px] overflow-hidden w-full max-w-[520px]">
      <div className="text-[#78EF63] font-semibold text-[24px] leading-[32px]">
        ✓  Ticket created
      </div>
      <div className="text-[#EFF2F0] font-medium text-[14px] leading-[20px]">
        #NAF-260922 · Open
      </div>
      <div className="text-[#A0A8AD] font-normal text-[14px] leading-[20px]">
        Your ticket is ready. The customer confirmation will use the selected reply channel.
      </div>
      <button className="flex items-center justify-center gap-[8px] h-[34px] px-[12px] rounded-[7px] border border-[#345135] bg-[#17241A] text-[#78EF63] font-medium text-[12px] leading-[20px]">
        Back to tickets
      </button>
    </div>
  );
};

export default SuccessModal;
