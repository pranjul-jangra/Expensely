import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar'
import MainBody from '../components/MainBody';
import Transaction from '../components/Transaction'
import SavingsOverview from '../components/SavingsOverview';
import Footer from '../components/Footer';
import { fetchUser } from '../utils/commonFetchers';


export default function Dashboard({ isLightTheme }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  // Fetch user if page refreshed
  useEffect(() => {
    if (!user?.name || !user?.email) {
      (async () => {
        try {
          await fetchUser();

        } catch (error) {
          console.error("Error gettinguser on profile page:", error);
          navigate("/signup", { replace: true });
        }
      })()
    }
  }, [user]);

  // Theme style
  const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";


  return (
    <>
      <main className={`min-h-dvh ${bgColor} px-10 max-md:px-3`}>
        <Navbar isLightTheme={isLightTheme} />
        <MainBody isLightTheme={isLightTheme} />
        <Transaction isLightTheme={isLightTheme} />
        <SavingsOverview isLightTheme={isLightTheme} />
      </main>

      <Footer isLightTheme={isLightTheme} />
    </>
  )
}
