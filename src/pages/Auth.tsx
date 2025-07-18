import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Leaf, Shield, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { DigitalIDLogin } from '@/components/DigitalIDLogin';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { signIn, signUp, user, loginAsDemoUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    icNumber: '',
    phoneNumber: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login Failed",
            description: "Invalid user or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.icNumber, formData.phoneNumber);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account Created",
          description: "Welcome! Automatically signing you in...",
        });
        
        // Automatically sign in with the same credentials
        const { error: signInError } = await signIn(formData.email, formData.password);
        
        if (!signInError) {
          navigate('/');
        } else {
          toast({
            title: "Account Created Successfully",
            description: "Please sign in with your new credentials.",
          });
        }
        
        // Clear form
        setFormData({
          email: '',
          password: '',
          fullName: '',
          confirmPassword: '',
          icNumber: '',
          phoneNumber: ''
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDigitalIDLogin = async () => {
    setLoading(true);
    try {
      console.log("MyDigital ID: Bypassing auth completely...");
      
      // Use the bypass method with the requested user ID
      loginAsDemoUser('00000000-0000-0000-0000-000000000000');
      
      toast({
        title: "MyDigital ID Demo Success!",
        description: "Successfully logged in as demo user!",
      });
      
      // Navigate immediately
      setTimeout(() => {
        navigate('/');
      }, 100);
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* TapirPay Branding */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <img 
              src="/lovable-uploads/f88e9ec6-4a03-4704-a1f3-fa146a541ad8.png" 
              alt="TapirPay Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">TapirPay</h1>
            <p className="text-muted-foreground">No Signal? No Problem. Pay with TapirPay</p>
          </div>
        </div>

        {/* MyDigital ID Login */}
        <DigitalIDLogin onLogin={handleDigitalIDLogin} />

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="w-full">
          <CardContent className="pt-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">User ID</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="text"
                    placeholder="Enter your email, phone number or IC number"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Forgot Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          To reset your password, please email us at:
                        </p>
                        <div className="text-center">
                          <code className="bg-muted px-2 py-1 rounded text-sm">contactus@tapirpay.my</code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Our support team will assist you with password recovery within 24 hours.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name (as per IC)</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name as per IC"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-ic">IC Number</Label>
                  <Input
                    id="signup-ic"
                    name="icNumber"
                    type="text"
                    placeholder="Enter your IC number"
                    value={formData.icNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}