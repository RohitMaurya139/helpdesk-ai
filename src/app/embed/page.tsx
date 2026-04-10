import EmbedClient from "@/components/EmbedClient";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export default async function EmbedPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  return <EmbedClient ownerId={session.user.id} />;
}
