import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, User, Bell, Shield, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<any>(null);
  const [orgForm, setOrgForm] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.organization_id) {
      loadOrganization();
    }
  }, [user]);

  const loadOrganization = async () => {
    if (!user?.organization_id) return;

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organization_id)
      .single();

    if (!error && data) {
      setOrganization(data);
      setOrgForm({ name: data.name });
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organization_id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgForm.name })
        .eq('id', user.organization_id);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Guardado',
          description: 'La información de la organización ha sido actualizada',
        });
        loadOrganization();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil y configuración de la organización
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Organization Settings */}
        {user?.role === 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateOrganization} className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Nombre de la organización</Label>
                  <Input 
                    id="org-name" 
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ name: e.target.value })}
                  />
                </div>
                {organization && (
                  <div className="space-y-2">
                    <Label>Slug de la organización</Label>
                    <Input value={organization.slug || ''} disabled className="bg-muted" />
                  </div>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" defaultValue={user?.name} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user?.email} disabled />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Input id="role" defaultValue={user?.role === 'ADMIN' ? 'Administrador' : 'Empleado'} disabled />
            </div>
            {user?.organization?.name && (
              <div>
                <Label htmlFor="organization">Organización</Label>
                <Input id="organization" defaultValue={user.organization.name} disabled />
              </div>
            )}
            <Button>Guardar Cambios</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Configuración de notificaciones disponible próximamente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;