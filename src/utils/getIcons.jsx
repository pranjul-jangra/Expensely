import {
    FaUniversity, FaWallet, FaBitcoin, FaPiggyBank, FaBuilding, FaLandmark,
    FaMoneyBillWave, FaGem, FaCar, FaHouseUser, FaGraduationCap, FaBriefcase,
    FaClipboardList, FaRegFileAlt, FaKey, FaShieldAlt, FaUserShield
} from "react-icons/fa";
import { GiGoldBar, GiReceiveMoney, GiBank, GiChest, GiPayMoney } from "react-icons/gi";
import { MdWork, MdSavings, MdOutlineEmergency, MdBusiness } from "react-icons/md";
import { RiSecurePaymentFill } from "react-icons/ri";
import { BsBank2, BsSafe2Fill } from "react-icons/bs";



export const getIcon = (method) => {
    const map = {
        "Bank Savings": <FaUniversity />,
        "Recurring Deposits": <FaMoneyBillWave />,
        "Cash": <GiPayMoney />,
        "UPI Wallets": <FaWallet />,
        "Digital Wallets": <FaWallet />,
        "Pension/Provident Fund": <GiReceiveMoney />,
        "Stocks/Equity Shares": <FaPiggyBank />,
        "Mutual Funds": <MdSavings />,
        "Exchange Traded Funds": <FaBuilding />,
        "Index Funds": <FaUniversity />,
        "Derivatives": <FaClipboardList />,
        "Real Estate / Property": <FaHouseUser />,
        "Vehicles": <FaCar />,
        "Gems & Crystalls": <FaGem />,
        "Gold & Precious Metals": <GiGoldBar />,
        "Silver, Platinum, etc": <GiChest />,
        "Art & Collectibles": <FaRegFileAlt />,
        "Cryptocurrencies": <FaBitcoin />,
        "NFTs (Non-Fungible Tokens)": <FaKey />,
        "Digital Domains / Online Assets": <MdWork />,
        "Government Bonds": <GiBank />,
        "Corporate Bonds": <FaUniversity />,
        "Debentures": <BsBank2 />,
        "Treasury Bills": <FaLandmark />,
        "Life Insurance": <FaShieldAlt />,
        "ULIPs (Unit Linked Insurance Plans)": <FaShieldAlt />,
        "Health Insurance": <FaUserShield />,
        "Pension Plans (Annuities)": <RiSecurePaymentFill />,
        "Employee Provident Fund (EPF)": <FaPiggyBank />,
        "Public Provident Fund (PPF)": <MdSavings />,
        "National Pension System (NPS)": <GiReceiveMoney />,
        "Gratuity / Superannuation Funds": <BsSafe2Fill />,
        "Equity in Private Business": <MdBusiness />,
        "Partnership Capital": <FaUniversity />,
        "Royalties or Intellectual Property (IP)": <FaClipboardList />,
        "Education Fund": <FaGraduationCap />,
        "Skill/Certification Fund": <FaGraduationCap />,
        "Scholarship Fund": <FaGraduationCap />,
        "Emergency Fund": <MdOutlineEmergency />,
        "Travel Fund": <FaWallet />,
        "Marriage Fund": <FaWallet />,
        "Home Renovation Fund": <FaHouseUser />,
        "Miscellaneous / Other": <FaWallet />,
    };
    return map[method] || <FaWallet />;
};