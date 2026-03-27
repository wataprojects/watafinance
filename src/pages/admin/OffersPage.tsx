import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  ExternalLink,
  Switch
} from 'lucide-react';
import { OfferForm } from '@/components/admin/OfferForm';
import { supabase } from '@/integrations/supabase/client';

interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  affiliate_link: string;
  expected_commission: number;
  commission_type: string;
  is_active: boolean;
  created_at: string;
}

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingOffer) {
        const { error } = await supabase
          .from('affiliate_offers')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingOffer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('affiliate_offers')
          .insert(data);

        if (error) throw error;
      }

      await loadOffers();
      setIsDialogOpen(false);
      setEditingOffer(null);
    } catch (err) {
      console.error('Error saving offer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta?')) return;

    try {
      const { error } = await supabase
        .from('affiliate_offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadOffers();
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      const { error } = await supabase
        .from('affiliate_offers')
        .update({ is_active: !offer.is_active })
        .eq('id', offer.id);

      if (error) throw error;
      await loadOffers();
    } catch (err) {
      console.error('Error toggling offer:', err);
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    telecom: 'bg-amber-100 text-amber-700',
    insurance: 'bg-emerald-100 text-emerald-700',
    banking: 'bg-blue-100 text-blue-700',
    investments: 'bg-purple-100 text-purple-700',
    utilities: 'bg-orange-100 text-orange-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Ofertas</h1>
          <p className="text-gray-500">Administra las ofertas de afiliados</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setEditingOffer(null)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
              </DialogTitle>
            </DialogHeader>
            <OfferForm
              offer={editingOffer}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar ofertas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron ofertas
                  </TableCell>
                </TableRow>
              ) : (
                filteredOffers.map(offer => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{offer.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {offer.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[offer.category] || 'bg-gray-100'}>
                        {offer.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {offer.commission_type === 'percentage' 
                        ? `${offer.expected_commission}%`
                        : `€${offer.expected_commission}`}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={() => handleToggleActive(offer)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(offer.affiliate_link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingOffer(offer);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(offer.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}