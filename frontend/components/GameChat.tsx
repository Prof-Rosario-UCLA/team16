import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

type Message = {
  user?: string;
  message: string;
  isPublic: boolean;
};

export default function GameChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (message: Message) => {
      // insert new message into messages
      setMessages((prevMessages) => [message, ...prevMessages]);
    });
    socket.on("user_joined", (message: Message) => {
      setMessages((prevMessages) => [
        { 
          message: `${message.user} joined the game`,
          isPublic: true
        },
        ...prevMessages,
      ]);
    });
    socket.on("user_left", (message: Message) => {
      setMessages((prevMessages) => [
        { 
          message: `${message.user} left the game`,
          isPublic: true
        },
        ...prevMessages,
      ]);
    });
    socket.on("correct_guess", (message: Message) => {
      setMessages((prevMessages) => [
        { 
          message: `${message.user} guessed the word correctly!`,
          isPublic: true
        },
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
    <div className="flex flex-col gap-4 w-full max-h-full h-full text-xs">
      <div className="!p-4 flex-grow overflow-y-auto flex flex-col-reverse gap-2 nes-container bg-white">
        {messages.length === 0 ? (
          <div className="text-center">No messages yet</div>
        ) : (
          messages.map((message, index) => ( // check render messages differently based on whehter or not they're public
            <div key={index}>
              {
                message.isPublic ?
                    <span>
                      {message.user && (
                        <span className="nes-text is-success">{`${message.user} `}</span>
                      )}
                      <span>{message.message}</span>
                    </span> 
                  :
                    <span
                      className="bg-green-300 text-white px-2 py-1 rounded-md inline-block"
                    >
                      { message.user && (
                        <span className="nes-text">{`${message.user} `}</span>
                      )}
                      <span>{message.message}</span>
                    </span>
              }
            </div>
          ))
        )}
      </div>
      <div>
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
            className="flex-grow nes-input focus:outline-none bg-white"
            placeholder="Take a guess!"
          />
          <button type="submit" className="nes-btn is-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
