Created At: 2026-09-23T08:53:30+05:30
Completed At: 2026-09-23T08:53:31+05:30
File Path: `file:///c:/Users/vivek/Desktop/LD%20Projects/ticketsupportfinal/src/App.jsx`
Total Lines: 1849
Total Bytes: 85506
Showing lines 1592 to 1849
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1592: function NewTicketModal({ isOpen, onClose, onTicketCreated, isAuthenticated }) {
1593:   const [channel, setChannel] = useState('Email');
1594:   const [formData, setFormData] = useState({
1595:     fullName: '',
1596:     email: '',
1597:     phone: '',
1598:     location: '',
1599:     accountType: '',
1600:     requestType: '',
1601:     subject: '',
1602:     description: ''
1603:   });
1604:   const [showErrors, setShowErrors] = useState(false);
1605:   const [isSuccess, setIsSuccess] = useState(false);
1606:   const [createdTicketId, setCreatedTicketId] = useState('');
1607:   const [isSubmitting, setIsSubmitting] = useState(false);
1608:   
1609:   if (!isOpen) return null;
1610: 
1611:   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
1612: 
1613:   const validate = () => {
1614:     return formData.fullName.trim() && 
1615:            formData.email.trim() && 
1616:            formData.accountType && 
1617:            formData.requestType && 
1618:            formData.subject.trim() && 
1619:            formData.description.trim();
1620:   };
1621: 
1622:   const handleSubmit = async () => {
1623:     if (!validate()) {
1624:       setShowErrors(true);
1625:       return;
1626:     }
1627:     
1628:     setIsSubmitting(true);
1629:     
1630:     try {
1631:       const headers = { 'Content-Type': 'application/json' };
1632:       if (isAuthenticated) headers['Authorization'] = 'Basic YWRtaW46c2VjdXJlMTIz'; 
1633:       
1634:       const payload = {
1635:         contactPerson: formData.fullName,
1636:         email: formData.email,
1637:         phone: formData.phone || null,
1638:         location: formData.location || null,
1639:         machineId: formData.location || null,
1640:         accountType: formData.accountType,
1641:         requestType: formData.requestType,
1642:         subject: formData.subject,
1643:         description: formData.description,
1644:         channel: channel,
1645:         source: 'Manual Entry'
1646:       };
1647: 
1648:       const res = await fetch('https://testing-api.naf-cloudsystem.de/api/NAFWebsite/support-issues', {
1649:         method: 'POST',
1650:         headers,
1651:         body: JSON.stringify(payload)
1652:       });
1653:       
1654:       let newTicket = null;
1655:       if (res.ok) {
1656:         newTicket = await res.json();
1657:       } else {
1658:         newTicket = {
1659:           ...payload,
1660:           id: Math.random().toString(36).substring(2, 9),
1661:           ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
1662:           status: 'OPEN',
1663:           createdAt: new Date().toISOString(),
1664:         };
1665:       }
1666:       
1667:       setCreatedTicketId(newTicket.ticketId);
1668:       onTicketCreated(newTicket);
1669:       setIsSuccess(true);
1670:     } catch (err) {
1671:       console.error(err);
1672:       const newTicket = {
1673:         ...formData,
1674:         contactPerson: formData.fullName,
1675:         id: Math.random().toString(36).substring(2, 9),
1676:         ticketId: Math.floor(100000 + Math.random() * 900000).toString(),
1677:         status: 'OPEN',
1678:         createdAt: new Date().toISOString(),
1679:         channel: channel,
1680:         source: 'Manual Entry'
1681:       };
1682:       setCreatedTicketId(newTicket.ticketId);
1683:       onTicketCreated(newTicket);
1684:       setIsSuccess(true);
1685:     }
1686:     
1687:     setIsSubmitting(false);
1688:   };
1689:   
1690:   const resetAndClose = () => {
1691:     setFormData({ fullName: '', email: '', phone: '', location: '', accountType: '', requestType: '', subject: '', description: '' });
1692:     setShowErrors(false);
1693:     setIsSuccess(false);
1694:     onClose();
1695:   };
1696: 
1697:   const getBorderColor = (fieldName) => {
1698:     if (!showErrors) return '#282C2F';
1699:     if (!formData[fieldName] || !formData[fieldName].trim()) return '#F38C86';
1700:     return '#282C2F';
1701:   };
1702:   
1703:   if (isSuccess) {
1704:     return (
1705:       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
1706:         <div className="flex w-[520px] p-7 flex-col items-start gap-5 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl" onClick={e => e.stopPropagation()}>
1707:           <span className="text-[24px] font-semibold text-[#78EF63] font-heading">✓ Ticket created</span>
1708:           <span className="text-[14px] font-medium text-[#EFF2F0]">#NAF-{createdTicketId} · Open</span>
1709:           <span className="text-[14px] text-[#A0A8AD] w-[464px] leading-relaxed">
1710:             Your ticket is ready. The customer confirmation will use the selected reply channel.
1711:           </span>
1712:           <button onClick={resetAndClose} className="mt-2 flex h-[34px] px-3 items-center gap-2 rounded-[7px] border border-[#345135] bg-[#17241A] hover:bg-[#1a2d1e] transition-colors">
1713:             <span className="text-[12px] font-medium text-[#78EF63]">Back to tickets</span>
1714:           </button>
1715:         </div>
1716:       </div>
1717:     );
1718:   }
1719: 
1720:   return (
1721:     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
1722:       <div className="flex w-[760px] p-7 flex-col items-start gap-3 rounded-[16px] border border-[#282C2F] bg-[#111315] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
1723:         {/* Header */}
1724:         <div className="flex w-full h-[38px] items-center gap-2.5">
1725:           <span className="text-[24px] font-semibold text-[#EFF2F0] font-heading">New ticket</span>
1726:           <div className="flex-1"></div>
1727:           <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
1728:             <span className="text-[12px] font-medium text-[#A0A8AD]">×</span>
1729:           </button>
1730:         </div>
1731:         <span className="text-[13px] text-[#A0A8AD]">Create a support request on behalf of a customer.</span>
1732:         
1733:         {/* Reply Channel */}
1734:         <div className="flex flex-col gap-2 mt-2 w-full">
1735:           <span className="text-[11px] font-medium text-[#A0A8AD] uppercase">REPLY CHANNEL</span>
1736:           <div className="flex gap-2">
1737:             <button onClick={() => setChannel('Email')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'Email' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
1738:               <span className="text-[12px] font-medium">Email</span>
1739:             </button>
1740:             <button onClick={() => setChannel('WhatsApp')} className={`flex h-[34px] px-3 items-center rounded-[7px] border transition-colors ${channel === 'WhatsApp' ? 'border-[#345135] bg-[#17241A] text-[#78EF63]' : 'border-[#282C2F] text-[#A0A8AD]'}`}>
1741:               <span className="text-[12px] font-medium">WhatsApp</span>
1742:             </button>
1743:           </div>
1744:           <span className="text-[12px] text-[#A0A8AD]">Replies will be sent by {channel.toLowerCase()}. The channel stays fixed for this ticket.</span>
1745:         </div>
1746: 
1747:         {/* Contact Fields */}
1748:         <div className="flex w-full gap-4 mt-2">
1749:           <div className="flex flex-col gap-1.5 flex-1">
1750:             <span className="text-[12px] font-medium text-[#A0A8AD]">Full name *</span>
1751:             <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter full name" 
1752:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
1753:               style={{ borderColor: getBorderColor('fullName') }} />
1754:           </div>
1755:           <div className="flex flex-col gap-1.5 flex-1">
1756:             <span className="text-[12px] font-medium text-[#A0A8AD]">Email *</span>
1757:             <input name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" 
1758:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
1759:               style={{ borderColor: getBorderColor('email') }} />
1760:           </div>
1761:         </div>
1762: 
1763:         {/* Optional Details */}
1764:         <div className="flex w-full gap-4 mt-2">
1765:           <div className="flex flex-col gap-1.5 flex-1">
1766:             <span className="text-[12px] font-medium text-[#A0A8AD]">Phone number</span>
1767:             <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" 
1768:               className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
1769:           </div>
1770:           <div className="flex flex-col gap-1.5 flex-1">
1771:             <span className="text-[12px] font-medium text-[#A0A8AD]">Machine ID / Location</span>
1772:             <input name="location" value={formData.location} onChange={handleChange} placeholder="Optional" 
1773:               className="h-[42px] px-3 rounded-[7px] border border-[#282C2F] bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none" />
1774:           </div>
1775:         </div>
1776: 
1777:         {/* Classification */}
1778:         <div className="flex w-full gap-4 mt-2">
1779:           <div className="flex flex-col gap-1.5 flex-1">
1780:             <span className="text-[12px] font-medium text-[#A0A8AD]">Account type *</span>
1781:             <select name="accountType" value={formData.accountType} onChange={handleChange}
1782:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
1783:               style={{ borderColor: getBorderColor('accountType'), color: formData.accountType ? '#EFF2F0' : '#78828A' }}>
1784:               <option value="" disabled>Select account type</option>
1785:               <option value="Customer / Guest">Customer / Guest</option>
1786:               <option value="B2B Partner">B2B Partner</option>
1787:               <option value="Internal">Internal</option>
1788:             </select>
1789:           </div>
1790:           <div className="flex flex-col gap-1.5 flex-1">
1791:             <span className="text-[12px] font-medium text-[#A0A8AD]">Request type *</span>
1792:             <select name="requestType" value={formData.requestType} onChange={handleChange}
1793:               className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] outline-none cursor-pointer"
1794:               style={{ borderColor: getBorderColor('requestType'), color: formData.requestType ? '#EFF2F0' : '#78828A' }}>
1795:               <option value="" disabled>Select request type</option>
1796:               <option value="Payment / Refund">Payment / Refund</option>
1797:               <option value="Machine Malfunction">Machine Malfunction</option>
1798:               <option value="General Inquiry">General Inquiry</option>
1799:             </select>
1800:           </div>
1801:         </div>
1802: 
1803:         {/* Subject & Message */}
1804:         <div className="flex flex-col gap-1.5 mt-2 w-full">
1805:           <span className="text-[12px] font-medium text-[#A0A8AD]">Subject *</span>
1806:           <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Briefly describe the request" 
1807:             className="h-[42px] px-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none"
1808:             style={{ borderColor: getBorderColor('subject') }} />
1809:         </div>
1810:         <div className="flex flex-col gap-1.5 mt-2 w-full">
1811:           <span className="text-[12px] font-medium text-[#A0A8AD]">Message / Description *</span>
1812:           <textarea name="description" value={formData.description} onChange={handleChange} placeholder="What happened? Include any details that will help us." 
1813:             className="h-[78px] p-3 rounded-[7px] border bg-[#0C0D0E] text-[13px] text-[#EFF2F0] placeholder:text-[#78828A] outline-none resize-none"
1814:             style={{ borderColor: getBorderColor('description') }} />
1815:         </div>
1816: 
1817:         {/* Media Upload (Visual only) */}
1818:         <div className="flex w-full h-[48px] px-3 mt-2 items-center rounded-[7px] border border-[#282C2F] cursor-pointer hover:bg-white/5 transition-colors">
1819:           <span className="text-[12px] text-[#A0A8AD]">＋ Add photos, video or audio</span>
1820:         </div>
1821: 
1822:         {/* Notification choice */}
1823:         <div className="flex flex-col gap-1 mt-2 w-full">
1824:           <span className="text-[12px] text-[#EFF2F0]">✓ Send a ticket confirmation to the customer</span>
1825:           <span className="text-[11px] text-[#A0A8AD]">New tickets start as Open. * Required fields</span>
1826:         </div>
1827: 
1828:         <div className="w-full h-[1px] bg-[#282C2F] mt-2"></div>
1829: 
1830:         {/* Errors & Footer */}
1831:         {showErrors && (
1832:           <span className="text-[12px] text-[#F38C86]">Please complete the required fields before creating this ticket.</span>
1833:         )}
1834:         
1835:         <div className="flex w-full justify-end items-center gap-2.5 mt-1">
1836:           <button onClick={resetAndClose} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#282C2F] hover:bg-white/5 transition-colors">
1837:             <span className="text-[12px] font-medium text-[#A0A8AD]">Cancel</span>
1838:           </button>
1839:           <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-[34px] px-3 items-center justify-center rounded-[7px] border border-[#345135] bg-[#78EF63] hover:opacity-90 transition-opacity disabled:opacity-50">
1840:             {isSubmitting ? '...' : 'Create ticket'}
1841:           </button>
1842:         </div>
1843:       </div>
1844:     </div>
1845:   );
1846: }
1847: 
1848: 
1849: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
