import dark from '../../assets/dark.png';
import light from '../../assets/light.png';


export default function Theme({ isLightTheme, toggleTheme }) {
    // Theme style
    const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
    const borderColor = isLightTheme ? "border-gray-300" : "border-white/8";
    const grayText = isLightTheme ? "text-gray-500" : "text-gray-400";
    const hoverShadow = isLightTheme ? "hover:shadow-gray-300" : "hover:shadow-gray-600";

    return (
        <main className={`min-h-dvh px-10 max-md:px-3 ${bgColor} pt-6 pb-12 transition-colors duration-200`}>
            <h1 className='text-2xl font-bold tracking-wide'>Appearance</h1>
            <p className={`${grayText} mb-6`}>Consider using dark mode at night for better visibility and to reduce eye strain.</p>

            <article className='flex flex-col gap-6 *:w-full *:max-w-2xl *:border *:rounded-xl *:p-3'>
                {/* Dark mode */}
                <div className={`flex flex-col items-center ${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                    <img src={dark} alt="Dark mode" loading='eager' className='rounded-lg mb-3' onClick={() => toggleTheme(false)} />
                    <div className='flex gap-0.5 items-center' onClick={() => toggleTheme(false)}>
                        <input type="radio" name='theme' id="dark" className='accent-black' checked={!isLightTheme} />
                        <label htmlFor="dark" className='text-sm font-semibold tracking-wide pb-0.5'>Dark mode</label>
                    </div>
                </div>

                {/* Light mode */}
                <div className={`flex flex-col items-center ${borderColor} hover:shadow ${hoverShadow} transition-shadow duration-150`}>
                    <img src={light} alt="Light mode" loading='eager' className='rounded-lg mb-3' onClick={() => toggleTheme(true)} />
                    <div className='flex gap-0.5 items-center' onClick={() => toggleTheme(true)}>
                        <input type="radio" name='theme' id="light" className='accent-black' checked={isLightTheme} />
                        <label htmlFor="light" className='text-sm font-semibold tracking-wide pb-0.5'>Light mode</label>
                    </div>
                </div>
            </article>
        </main>
    )
}
