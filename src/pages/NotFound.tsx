import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Lottie from "lottie-react";
import NotFoundAnimation from "@/assets/lottie/404.json";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-4xl flex flex-col items-center">
        {/* Lottie Animation */}
        <Lottie
          animationData={NotFoundAnimation}
          loop={true}
          className="size-auto mb-6"
        />
        <Button
          variant="default"
          className="text-white uppercase hover:text-white/90 text-base"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
