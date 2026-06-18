import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Sun, Moon, Loader2 } from 'lucide-react';
import { fetchLocationFromCoordinates, getCurrentPosition } from '@/lib/geolocation';
import { loginSchema, signupSchema } from '@/lib/validation';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const detectLocation = async (setLocation: (location: string) => void) => {
    setDetectingLocation(true);
    try {
      const position = await getCurrentPosition();
      const result = await fetchLocationFromCoordinates(position.coords.latitude, position.coords.longitude);
      if (result.success) {
        setLocation(result.location);
        toast({ title: "Location detected", description: result.location });
      }
    } catch {
      toast({ title: "Location error", description: "Please enter manually", variant: "destructive" });
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) errors[err.path[0].toString()] = err.message; });
      setLoginErrors(errors);
      return;
    }

    setIsLoading(true);
    const { error } = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({ title: "Login failed", description: error, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back!", description: "Successfully logged in." });
    navigate('/home');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    const result = signupSchema.safeParse({ name: signupName, email: signupEmail, password: signupPassword, phone: signupPhone, location: signupLocation });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) errors[err.path[0].toString()] = err.message; });
      setSignupErrors(errors);
      return;
    }

    setIsLoading(true);
    const { error } = await signup(signupName, signupEmail, signupPassword, signupPhone, signupLocation);
    setIsLoading(false);

    if (error) {
      toast({ title: "Signup failed", description: error, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome to Dreamers!", description: "Account created successfully." });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="absolute top-4 right-4">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">🌱 Dreamers App</CardTitle>
          <CardDescription>Environmental Impact Tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required maxLength={255} />
                  {loginErrors.email && <p className="text-sm text-destructive">{loginErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required maxLength={100} />
                  {loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={signupName} onChange={(e) => setSignupName(e.target.value)} required maxLength={100} />
                  {signupErrors.name && <p className="text-sm text-destructive">{signupErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required maxLength={255} />
                  {signupErrors.email && <p className="text-sm text-destructive">{signupErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required maxLength={100} />
                  {signupErrors.password && <p className="text-sm text-destructive">{signupErrors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="flex gap-2">
                    <Input value={signupLocation} onChange={(e) => setSignupLocation(e.target.value)} maxLength={500} />
                    <Button type="button" variant="outline" size="icon" onClick={() => detectLocation(setSignupLocation)} disabled={detectingLocation}>
                      {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
