import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

type Message = {
  user?: string;
  message: string;
  isPublic: boolean;
  msgType: string; // for styling: "playerchange" : gray, "chat": black, "correct_guess": green
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
          isPublic: true,
          msgType: "player_change",
        },
        ...prevMessages,
      ]);
    });
    socket.on("user_left", (message: Message) => {
      setMessages((prevMessages) => [
        {
          message: `${message.user} left the game`,
          isPublic: true,
          msgType: "player_change",
        },
        ...prevMessages,
      ]);
    });
    socket.on("correct_guess", (message: Message) => {
      setMessages((prevMessages) => [
        {
          message: `${message.user} guessed the word correctly!`,
          isPublic: true,
          msgType: "correct_guess",
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

  const renderMessage = (message: Message, index: number) => {
    if (message.msgType === "chat") {
      return (
        <div key={index}>
          {message.isPublic ? (
            <span>
              {message.user && (
                <span className="nes-text is-success">{`${message.user} `}</span>
              )}
              <span className="break-words">{message.message}</span>
            </span>
          ) : (
            <span className="bg-[#92cc41] text-white px-2 py-1 rounded-md max-w-full inline-block">
              {message.user && (
                <span className="nes-text">{`${message.user} `}</span>
              )}
              <span className="break-words">{message.message}</span>
            </span>
          )}
        </div>
      );
    } else if (message.msgType === "player_change") {
      return (
        <div key={index}>
          <span className="text-gray-500 break-words">{message.message}</span>
        </div>
      );
    } else if (message.msgType === "correct_guess") {
      return (
        <div key={index}>
          <span className="text-[#92cc41] break-words">{message.message}</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-h-full h-full text-xs md:min-w-64">
      <div className="!p-4 flex-grow overflow-y-auto flex flex-col-reverse gap-2 nes-container bg-white">
        {messages.length === 0 ? (
          <div className="text-center">No messages yet</div>
        ) : (
          messages.map(
            (
              message,
              index // check render messages differently based on whehter or not they're public
            ) => renderMessage(message, index)
          )
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
            className="flex-grow !p-1 nes-input focus:outline-none bg-white"
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
