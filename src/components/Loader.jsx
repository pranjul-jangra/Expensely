const ExpenselyTextLoader = () => {
  const letters = "EXPENSELY".split("");

  return (
    <div className="loader-container">
      <div className="expensely-loader">
        {letters.map((letter, index) => (
          <span key={index} className="loader-letter" style={{ animationDelay: `${index * 0.15}s` }}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};



export default function Loader() {
  return (
    <main className={`w-screen h-dvh fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px] bg-black/20`}>
      <ExpenselyTextLoader />
    </main>
  );
}
