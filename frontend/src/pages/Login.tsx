import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t('common.error'),
        description: t('auth.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast({
        title: t('common.success'),
        description: t('auth.loginSuccess'),
      });
      
      // Redirect based on user role (you can enhance this)
      navigate('/customer/dashboard');
    } catch (error) {
      toast({
        title: t('common.loginFailed'),
        description: error instanceof Error ? error.message : t('auth.invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('auth.welcomeBack')}</h1>
          <p className="text-muted-foreground">{t('auth.signInMessage')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('forms.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('forms.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('forms.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('forms.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full btn-hero"
            disabled={isLoading}
          >
            {isLoading ? t('auth.signingIn') : t('actions.signIn')}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <Link 
            to="/forgot-password" 
            className="text-sm text-primary hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;