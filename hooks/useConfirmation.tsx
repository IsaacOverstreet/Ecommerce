import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Config = {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function useConfirmation() {
  const [openConfirmation, setConfirmation] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  function confirm({ message, onConfirm, onCancel }: Config) {
    setConfig({ message, onConfirm, onCancel });
    setConfirmation(true);
  }

  function handleConfirm() {
    config?.onConfirm();
    setConfirmation(false);
  }

  function handleCancel() {
    config?.onCancel?.();
    setConfirmation(false);
  }

  function ConfirmationDialog() {
    if (!openConfirmation || !config) return null;
    return (
      <Dialog open={openConfirmation} onOpenChange={setConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
          </DialogHeader>
          <DialogDescription>{config.message}</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              No
            </Button>
            <Button onClick={handleConfirm}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return { confirm, ConfirmationDialog };
}
