
import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Appointment, AppointmentFormData } from '@/types/calendar';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { AppointmentType } from '@/services/calendarApi';

interface AppointmentsSectionProps {
  appointmentType: AppointmentType;
}

export function AppointmentsSection({ appointmentType }: AppointmentsSectionProps) {
  const appointments: Appointment[] = [];
  const isAddDialogOpen = false;
  const setIsAddDialogOpen = (open: boolean) => {};
  const isEditDialogOpen = false;
  const setIsEditDialogOpen = (open: boolean) => {};
  const isDeleteDialogOpen = false;
  const setIsDeleteDialogOpen = (open: boolean) => {};
  const currentAppointment = null;
  const formData = {
    petName: '',
    ownerName: '',
    phone: '',
    date: new Date(),
    service: '',
    status: 'pendente' as 'confirmado' | 'pendente' | 'cancelado',
    notes: ''
  } as AppointmentFormData;
  const setFormData = (data: AppointmentFormData) => {};
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); };
  const confirmDelete = () => {};

  // Helper function to safely format dates
  const safeFormatDate = (date: Date | null | undefined, formatString: string): string => {
    if (!date || !isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatString, { locale: pt });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">
        Marcar na Agenda
      </h2>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Novo Agendamento
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Nome do Pet</Label>
                <Input id="petName" value={formData.petName} onChange={e => setFormData({
                ...formData,
                petName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome do Proprietário</Label>
                <Input id="ownerName" value={formData.ownerName} onChange={e => setFormData({
                ...formData,
                ownerName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data e Hora</Label>
                <div className="flex">
                  <Input 
                    id="date" 
                    type="datetime-local" 
                    value={isValid(formData.date) ? format(formData.date, "yyyy-MM-dd'T'HH:mm") : ''} 
                    onChange={e => {
                      const newDate = e.target.value ? new Date(e.target.value) : new Date();
                      setFormData({
                        ...formData,
                        date: newDate
                      });
                    }} 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <select id="service" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.service} onChange={e => setFormData({
                ...formData,
                service: e.target.value
              })} required>
                  <option value="Banho e Tosa">Banho e Tosa</option>
                  <option value="Banho">Banho</option>
                  <option value="Tosa">Tosa</option>
                  <option value="Consulta Veterinária">Consulta Veterinária</option>
                  <option value="Vacinação">Vacinação</option>
                  <option value="Exames de Rotina">Exames de Rotina</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.status} onChange={e => setFormData({
                ...formData,
                status: e.target.value as 'confirmado' | 'pendente' | 'cancelado'
              })} required>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" value={formData.notes} onChange={e => setFormData({
              ...formData,
              notes: e.target.value
            })} />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Agendamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Atualize os dados do agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-petName">Nome do Pet</Label>
                <Input id="edit-petName" value={formData.petName} onChange={e => setFormData({
                ...formData,
                petName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-ownerName">Nome do Proprietário</Label>
                <Input id="edit-ownerName" value={formData.ownerName} onChange={e => setFormData({
                ...formData,
                ownerName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input id="edit-phone" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-date">Data e Hora</Label>
                <div className="flex">
                  <Input 
                    id="edit-date" 
                    type="datetime-local" 
                    value={isValid(formData.date) ? format(formData.date, "yyyy-MM-dd'T'HH:mm") : ''} 
                    onChange={e => {
                      const newDate = e.target.value ? new Date(e.target.value) : new Date();
                      setFormData({
                        ...formData,
                        date: newDate
                      });
                    }} 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service">Serviço</Label>
                <select id="edit-service" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.service} onChange={e => setFormData({
                ...formData,
                service: e.target.value
              })} required>
                  <option value="Banho e Tosa">Banho e Tosa</option>
                  <option value="Banho">Banho</option>
                  <option value="Tosa">Tosa</option>
                  <option value="Consulta Veterinária">Consulta Veterinária</option>
                  <option value="Vacinação">Vacinação</option>
                  <option value="Exames de Rotina">Exames de Rotina</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select id="edit-status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.status} onChange={e => setFormData({
                ...formData,
                status: e.target.value as 'confirmado' | 'pendente' | 'cancelado'
              })} required>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Input id="edit-notes" value={formData.notes} onChange={e => setFormData({
              ...formData,
              notes: e.target.value
            })} />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Atualizar Agendamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {currentAppointment && (
            <div className="py-4">
              <p><strong>Pet:</strong> {currentAppointment.petName}</p>
              <p><strong>Proprietário:</strong> {currentAppointment.ownerName}</p>
              <p><strong>Data/Hora:</strong> {safeFormatDate(currentAppointment.date, "dd/MM/yyyy 'às' HH:mm")}</p>
              <p><strong>Serviço:</strong> {currentAppointment.service}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
