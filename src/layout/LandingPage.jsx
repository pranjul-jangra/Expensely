import { useEffect } from "react";
import { useNavigate } from "react-router";
import { fetchUser } from "../utils/commonFetchers";



const LandingPage = ({ isLightTheme }) => {
  const navigate = useNavigate();

  // Fetch user
  useEffect(() => {
    (async () => {
      try{
        await fetchUser();
        navigate('/dashboard', { replace: true });

      }catch(error){
        console.log("Error fetching user:", error);
        navigate('/signup', { replace: true });
      }
    })()
  }, []);


  // Theme style
  const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";

  return <main className={`min-h-screen w-full ${bgColor}`}></main>
};

export default LandingPage;
