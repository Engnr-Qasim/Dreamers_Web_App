import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon } from "lucide-react";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";

const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/home", { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🌱 Dreamers App
          </CardTitle>
          <CardDescription>Environmental Impact Tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <SignIn
                routing="hash"
                signUpUrl="#signup"
                afterSignInUrl="/home"
                redirectUrl="/home"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full border-0 p-0",
                    formButtonPrimary:
                      "w-full bg-primary hover:bg-primary/90 text-primary-foreground",
                    footerAction: "hidden",
                    socialButtonsBlockButton:
                      "w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                    socialButtonsBlockButtonText: "text-foreground",
                  },
                }}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUp
                routing="hash"
                signInUrl="#login"
                afterSignUpUrl="/home"
                redirectUrl="/home"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none w-full border-0 p-0",
                    formButtonPrimary:
                      "w-full bg-primary hover:bg-primary/90 text-primary-foreground",
                    socialButtonsBlockButton:
                      "w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                    socialButtonsBlockButtonText: "text-foreground",
                  },
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
