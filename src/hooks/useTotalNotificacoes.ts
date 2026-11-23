import { somarPendencias } from "@/components/notificacoes/notificacoes.data";
import { useConvites } from "@/contexts/ConvitesContext";
import { useNotifications } from "@/contexts/NotificationsContext";

export function useTotalNotificacoes(): number {
  const { unreadCount } = useNotifications();
  const { convites } = useConvites();
  return somarPendencias(unreadCount, convites.length);
}
