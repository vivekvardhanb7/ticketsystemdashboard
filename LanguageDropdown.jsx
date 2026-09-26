import React from 'react';

const LanguageDropdown = () => {
  return (
    <div className="flex w-[284px] p-4 flex-col items-start gap-3 rounded-[10px] border border-[#282C2F] bg-[#111315] overflow-hidden">
      <div className="text-[#EFF2F0] font-semibold text-[14px] leading-[20px]">
        Interface language
      </div>
      <div className="flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] overflow-hidden cursor-pointer">
        <div className="text-[#78EF63] font-medium text-[12px] leading-[20px]">
          English  ✓
        </div>
      </div>
      <div className="flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#282C2F] opacity-55 overflow-hidden cursor-not-allowed">
        <div className="text-[#A0A8AD] font-medium text-[12px] leading-[20px]">
          Deutsch · Coming later
        </div>
      </div>
      <div className="w-full text-[#A0A8AD] font-normal text-[11px] leading-[20px]">
        German will be the default at launch.
      </div>
    </div>
  );
};

export default LanguageDropdown;
