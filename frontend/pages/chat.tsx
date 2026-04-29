import Head from "next/head";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <>
      <Head>
        <title>Chat - Ouwibo Agent</title>
        <meta name="description" content="Chat with Ouwibo AI Agent" />
      </Head>
      <ChatInterface />
    </>
  );
}
