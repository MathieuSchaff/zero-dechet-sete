// import Image from "next/image";
// import styles from "./page.module.css";
//
import { createSupabaseServer } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";
import Link from "next/link";
// import { Button } from "@radix-ui/themes"; // ou ton import shadcn si tu préfères
import styles from "./page.module.css";
import * as Dialog from "@radix-ui/react-dialog";

export default async function HomePage() {
  const cookieStore = await cookies();
  // const supabase = await createSupabaseServer(cookieStore)
  return (
    <main>
      {/* <Dialog.Root>
        <Dialog.Trigger className="btn">Ouvrir</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay" />
          <Dialog.Content className="content">
            <Dialog.Title>Bienvenue 👋</Dialog.Title>
            <Dialog.Description>
              Ceci est une modale Radix dans une page Next.js.
            </Dialog.Description>
            <Dialog.Close className="btn-close">Fermer</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root> */}
    </main>
  );
}
