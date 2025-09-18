import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Redirect if already authenticated
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    const success = await login(email, password);
    
    if (!success) {
      setError('Email ou senha incorretos');
    }
    
    setLoginLoading(false);
  };

  const fillCredentials = (type: 'admin' | 'operator') => {
    if (type === 'admin') {
      setEmail('admin@solabs.com');
      setPassword('admin123');
    } else {
      setEmail('operador@solabs.com');
      setPassword('operador123');
    }
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img 
            src="/brand/logo-solabs.png" 
            alt="Solabs" 
            className="h-12 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-foreground">Solabs Messages</h1>
          <p className="text-muted-foreground mt-2">Entre com suas credenciais</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loginLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    disabled={loginLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginLoading}
              >
                {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Credenciais de demonstração:
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-left" 
                  onClick={() => fillCredentials('admin')}
                  disabled={loginLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">Super Admin</div>
                    <div className="text-xs text-muted-foreground">admin@solabs.com / admin123</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-left" 
                  onClick={() => fillCredentials('operator')}
                  disabled={loginLoading}
                >
                  <div className="text-left">
                    <div className="font-medium">Operador</div>
                    <div className="text-xs text-muted-foreground">operador@solabs.com / operador123</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};