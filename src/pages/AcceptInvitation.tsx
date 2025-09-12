import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signUp, getInvitationByToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Receipt, Users } from 'lucide-react';
import type { Invitation } from '@/types/database';

const AcceptInvitation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<{
    id: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
    status: string;
    organizations?: { name: string };
  } | null>(null);
  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Token de invitación no válido',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    const loadInvitation = async () => {
      const { data, error } = await getInvitationByToken(token);
      if (error || !data) {
        toast({
          title: 'Error',
          description: 'Invitación no encontrada o expirada',
          variant: 'destructive',
        });
        navigate('/auth');
      } else {
        setInvitation(data);
      }
    };

    loadInvitation();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (form.password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(
        invitation.email, 
        form.password, 
        form.name, 
        undefined, 
        token
      );
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '¡Bienvenido!',
          description: 'Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.',
        });
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando invitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-financial rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">ExpenseWise</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Invitación a {invitation.organizations?.name}</h2>
          </div>
          <p className="text-muted-foreground">
            Has sido invitado a unirte a la organización como {invitation.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-financial">
            <CardHeader>
              <CardTitle>Completa tu registro</CardTitle>
              <CardDescription>
                Crea tu cuenta para acceder a ExpenseWise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitation.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  variant="hero"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;