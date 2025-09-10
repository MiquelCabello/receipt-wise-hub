import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon } from 'lucide-react';

const Upload = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Subir Ticket</h1>
      
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Análisis de Recibos con IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UploadIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-2">Funcionalidad de subida en desarrollo</p>
            <p className="text-muted-foreground">
              La integración con Gemini AI está configurada y lista para analizar recibos automáticamente
            </p>
            <Button variant="hero" className="mt-4">
              Próximamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;