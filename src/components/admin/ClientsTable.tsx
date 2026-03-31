import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ClientsTable({ clients, isLoading, onRefresh }: ClientsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const itemsPerPage = 10;

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/admin');
      
      await supabaseAdmin.from('expenses').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('incomes').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('debts').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('loans').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('investments').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('patrimony').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('user_financial_profiles').delete().eq('user_id', clientToDelete.id);
      await supabaseAdmin.from('profiles').delete().eq('id', clientToDelete.id);
      await supabaseAdmin.auth.admin.deleteUser(clientToDelete.id);

      toast({
        title: 'Cliente eliminado',
        description: 'El cliente y todos sus datos han sido eliminados',
      });
      
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
          {filteredClients.length} clientes
        </Badge>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">Cliente</TableHead>
              <TableHead className="text-slate-400 font-medium">Email</TableHead>
              <TableHead className="text-slate-400 font-medium">Fecha de Registro</TableHead>
              <TableHead className="text-slate-400 font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-400">No se encontraron clientes</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-700">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm">
                          {getInitials(client.first_name, client.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">
                          {client.first_name || 'Usuario'} {client.last_name || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">{client.email}</TableCell>
                  <TableCell className="text-slate-400">
                    {formatDate(client.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                        className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/clients/${client.id}?edit=true`)}
                        className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(client)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
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
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
            {Math.min(currentPage * itemsPerPage, filteredClients.length)} de{' '}
            {filteredClients.length} clientes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400 px-2">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar cliente?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Esta acción eliminará al cliente "{clientToDelete?.first_name} {clientToDelete?.last_name}" 
              y todos sus datos financieros. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
