"use client";

import ChatWindow from "@/components/ChatWindow";
import { useSupabase } from "@/components/SupabaseProvider";
import { motion } from "framer-motion";

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = params;
  const { user } = useSupabase();

  if (!user) {
    return (
      <motion.p
        className="text-center text-zinc-400 mt-20 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tenés que iniciar sesión para ver esta conversación.
      </motion.p>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ChatWindow
        conversationId={conversationId}
        currentUserId={user.id}
      />
    </motion.div>
  );
}
