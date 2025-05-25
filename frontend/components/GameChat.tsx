import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

type Message = {
  user?: string;
  message: string;
};

export default function GameChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (message: Message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });
    socket.on("user_joined", (message: Message) => {
      setMessages((prevMessages) => [
        { message: `${message.user} joined the game` },
        ...prevMessages,
      ]);
    });
    socket.on("user_left", (message: Message) => {
      setMessages((prevMessages) => [
        { message: `${message.user} left the game` },
        ...prevMessages,
      ]);
    });
    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-[800px] w-[400px]">
      <div className="flex-grow overflow-y-auto flex flex-col-reverse p-4 gap-2">
        {messages.length === 0 ? (
          <div className="text-center">No messages yet</div>
        ) : (
          messages.map((message, index) => (
            <div key={index}>
              {message.user && (
                <span className="font-bold">{`${message.user}: `}</span>
              )}
              <span>{message.message}</span>
            </div>
          ))
        )}
      </div>
      <div className="p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              socket?.emit("send_message", input);
              setInput("");
            }
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-2 border "
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
