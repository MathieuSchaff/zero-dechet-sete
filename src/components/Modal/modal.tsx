// components/Modal.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleClose = () => {
    router.back(); // Retour en arrière
  };

  return (
    <dialog ref={dialogRef} onClose={handleClose}>
      <button onClick={handleClose}>✕</button>
      {children}
    </dialog>
  );
}
