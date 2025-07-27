
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarEvent } from '@/types/calendar';
import { format, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  event: CalendarEvent | null;
  isDeleting: boolean;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  event,
  isDeleting
}: DeleteEventDialogProps) {
  if (!event) return null;

  let startDate: Date;
  
  try {
    startDate = new Date(event.start);
    if (!isValid(startDate)) {
      console.error('Invalid date in DeleteEventDialog:', event.start);
      startDate = new Date(); // Fallback to current date
    }
  } catch (error) {
    console.error('Error parsing date in DeleteEventDialog:', error);
    startDate = new Date(); // Fallback to current date
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja realmente excluir este evento? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="font-medium">{event.summary}</p>
          <p className="text-sm text-muted-foreground">
            {format(startDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt })}
          </p>
          {event.attendees?.some(a => a?.email) && (
            <p className="text-sm text-muted-foreground">
              Participante: {event.attendees.find(a => a?.email)?.email}
            </p>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Excluindo...' : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sim, excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
