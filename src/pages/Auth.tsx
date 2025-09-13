import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { signIn, signUp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { loginSchema, signupSchema, LoginFormData, SignupFormData } from '@/lib/validations';
import { Loader2, Receipt, TrendingUp, Users, Shield } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });
  
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          title: 'Error de inicio de sesión',
          description: error.message === 'Invalid login credentials' 
            ? 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Bienvenido',
          description: 'Has iniciado sesión correctamente',
        });
        navigate('/dashboard');
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

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      const { error } = await signUp(data.email, data.password, data.name, data.organizationName);
      
      if (error) {
        toast({
          title: 'Error de registro',
          description: error.message === 'User already registered' 
            ? 'Este email ya está registrado. Intenta iniciar sesión.'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Cuenta creada',
          description: 'Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.',
        });
        // Switch to login tab
        const loginTab = document.querySelector('[data-state="inactive"]') as HTMLElement;
        loginTab?.click();
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

  const plans = [
    {
      name: 'Gratuito',
      price: '0€',
      period: '/mes',
      description: 'Para empezar',
      features: [
        'Hasta 50 gastos/mes',
        '1 usuario',
        'Análisis básico de recibos',
        'Exportación CSV',
        'Soporte por email'
      ],
      buttonText: 'Comenzar gratis',
      variant: 'outline' as const
    },
    {
      name: 'Profesional',
      price: '29€',
      period: '/mes',
      description: 'Para equipos pequeños',
      features: [
        'Gastos ilimitados',
        'Hasta 10 usuarios',
        'IA avanzada con Gemini',
        'Analíticas completas',
        'Exportación múltiple',
        'Flujos de aprobación',
        'Soporte prioritario'
      ],
      buttonText: 'Prueba gratuita',
      variant: 'hero' as const,
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99€',
      period: '/mes',
      description: 'Para grandes empresas',
      features: [
        'Todo lo de Profesional',
        'Usuarios ilimitados',
        'API personalizada',
        'Integraciones ERP',
        'Auditoría avanzada',
        'SLA garantizado',
        'Soporte 24/7'
      ],
      buttonText: 'Contactar ventas',
      variant: 'financial' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-financial rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">ExpenseWise</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gestiona los gastos de tu empresa con inteligencia artificial. 
            Análisis automático de recibos, aprobaciones digitales y analíticas avanzadas.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">IA Avanzada</h3>
            <p className="text-muted-foreground">Extrae datos automáticamente de recibos y facturas con Gemini AI</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Analíticas</h3>
            <p className="text-muted-foreground">Dashboards completos con métricas financieras y tendencias</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Seguridad</h3>
            <p className="text-muted-foreground">Cumplimiento RGPD y auditoría completa de todas las acciones</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="shadow-financial">
            <CardHeader>
              <CardTitle>Accede a tu cuenta</CardTitle>
              <CardDescription>
                Inicia sesión o crea una cuenta nueva para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="tu@empresa.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || !loginForm.formState.isValid}
                        variant="hero"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          'Iniciar Sesión'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Juan Pérez"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la organización</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Mi Empresa S.L."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="tu@empresa.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar contraseña</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || !signupForm.formState.isValid}
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
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planes que se adaptan a tu empresa</h2>
            <p className="text-muted-foreground">Desde startups hasta grandes corporaciones</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-financial' : 'shadow-card'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="text-2xl font-bold">{plan.name}</div>
                    <div className="text-3xl font-bold text-primary mt-2">
                      {plan.price}<span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{plan.description}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.variant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;