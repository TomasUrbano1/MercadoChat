import ChatWindow from "@/components/ChatWindow";

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return (
    <ChatWindow
      conversationId={params.conversationId}
      currentUserId="demo-user"
    />
  );
}