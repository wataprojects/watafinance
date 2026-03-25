"use client";

import { Scissors } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface TrimConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: any;
  onConfirm: () => void;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TrimConfirmModal = ({
  isOpen,
  onOpenChange,
  subscription,
  onConfirm,
  isLoading = false,
}: TrimConfirmModalProps) => {
  if (!subscription) return null;

  const handleConfirm = () => {
    if (isLoading) return;
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
        <AlertDialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <Scissors className="w-8 h-8 text-red-400" />
          </div>
          <AlertDialogTitle className="text-xl text-white">
            ¿Quieres cancelar este gasto y ahorrar{" "}
            <span className="text-green-400">
              {formatCurrency(subscription.amount)}/mes
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400 text-center">
            Esto te ayudará a mejorar tu salud financiera. El gasto quedará
            marcado como recortado y no se mostrará en tus totales.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3 sm:gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              "Sí, recortar"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrimConfirmModal;