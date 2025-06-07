import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

type Message = {
  user?: string;
  message: string;
  isPublic: boolean;
};

type User = {
  username: string
}

export default function GameChat({user} : {user: string | undefined}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activePlayers, setActivePlayers] = useState<Map<string, boolean>>(new Map<string, boolean>());
  const [input, setInput] = useState("");

  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (message: Message, rawActivePlayers: string) => {
      // insert new message into messages
      setMessages((prevMessages) => [message, ...prevMessages]);
      
      if (rawActivePlayers != null) {
        console.log(rawActivePlayers)
        
        // convert JSON to a Map
        const parsedArray: [string, boolean][] = JSON.parse(rawActivePlayers);
        const playersMap = new Map<string, boolean>(parsedArray);

         // set activePlayers
        setActivePlayers(playersMap);
        console.log(playersMap);
      }
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
    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, [socket]);

  let username = (typeof user !== "undefined") ? user : "";
  
  // if user hasn't guessed the word yet, filter out the non public messages
  // let newMessages = messages.filter((msg) => msg.isPublic)

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
                    <>
                      {message.user && (
                        <span className="nes-text is-success">{`${message.user} `}</span>
                      )}
                      <span>{message.message}</span>
                    </> 
                  :
                    <>
                      { message.user && (
                        <span className="nes-text is-success">{`${message.user} `}</span>
                      )}
                      <span className="bg-green">{message.message + "HIDE"}</span>
                    </>
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
