import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Shield, Mail, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createInvitation, getInvitations } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, Invitation } from '@/types/database';

const Employees = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'EMPLOYEE' as 'EMPLOYEE' | 'ADMIN' });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadEmployees();
      loadInvitations();
    }
  }, [user]);

  const loadEmployees = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEmployees(data);
    }
  };

  const loadInvitations = async () => {
    const { data, error } = await getInvitations();
    if (!error && data) {
      setInvitations(data as Invitation[]);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await createInvitation(inviteForm.email, inviteForm.role);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Invitación enviada',
          description: `Se ha enviado una invitación a ${inviteForm.email}`,
        });
        
        // Generate invitation link
        const inviteLink = `${window.location.origin}/accept-invitation?token=${data.token}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(inviteLink).then(() => {
          toast({
            title: 'Enlace copiado',
            description: 'El enlace de invitación ha sido copiado al portapapeles',
          });
        });

        setInviteForm({ email: '', role: 'EMPLOYEE' });
        setIsDialogOpen(false);
        loadInvitations();
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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground">Solo los administradores pueden ver esta página</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y empleados de tu organización
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invitar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar nuevo empleado</DialogTitle>
              <DialogDescription>
                Envía una invitación por email para que se una a tu organización
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email del empleado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="empleado@empresa.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employees List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Empleados Activos ({employees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <p className="text-xs text-muted-foreground">{employee.department || 'Sin departamento'}</p>
                    </div>
                    <Badge variant={employee.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {employee.role === 'ADMIN' ? 'Admin' : 'Empleado'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay empleados registrados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invitaciones Pendientes ({invitations.filter(i => i.status === 'PENDING').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.filter(i => i.status === 'PENDING').length > 0 ? (
              <div className="space-y-4">
                {invitations
                  .filter(i => i.status === 'PENDING')
                  .map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {invitation.role === 'ADMIN' ? 'Admin' : 'Empleado'}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Expira: {new Date(invitation.expires_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const inviteLink = `${window.location.origin}/accept-invitation?token=${invitation.token}`;
                          navigator.clipboard.writeText(inviteLink);
                          toast({
                            title: 'Enlace copiado',
                            description: 'El enlace de invitación ha sido copiado al portapapeles',
                          });
                        }}
                      >
                        Copiar enlace
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay invitaciones pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employees;