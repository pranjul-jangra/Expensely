import { Component, useState } from "react";


const ErrorHandler = ({ message }) => {
  const [isLightTheme, setIsLightTheme] = useState(JSON.parse(localStorage.getItem("expenselyTheme") || true));

  // Theme style
  const bgColor = isLightTheme ? "bg-zinc-50/5 text-black/85" : "bg-black/90 text text-white/85";
  const grayText = isLightTheme ? "text-gray-700" : "text-gray-400";

  return (
    <div className={`flex flex-col items-center justify-center h-screen text-center px-4 ${bgColor}`}>
      <h1 className="text-2xl font-semibold mb-4 text-red-600">Error</h1>
      <p className={`mb-6 ${grayText} max-w-md`}>{message}</p>

      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer" onClick={() => window.location.reload()} >Reload Page</button>
    </div>
  )
}


// Error Boundary
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, messageToUser: "" };
  }

  // React lifecycle hook to update error state
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // React lifecycle hook to log or process the actual error
  componentDidCatch(error, errorInfo) {
    let messageToUser = "Something went wrong. Please try again.";

    const errorMsg = (error?.message || "").toLowerCase();

    if (errorMsg.includes("memory") || errorMsg.includes("heap")) {
      messageToUser = "You are out of memory. Please close the tab and return after a while.";
    } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
      messageToUser = "Network issue. Please check your internet connection.";
    } else if (errorMsg.includes("quota")) {
      messageToUser = "Storage quota exceeded. Please clear some space.";
    } else if (errorMsg.includes("script error")) {
      messageToUser = "An unexpected error occurred while running the app.";
    }

    this.setState({ messageToUser });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorHandler message={this.state.messageToUser} />
    }

    return this.props.children;
  }
}
