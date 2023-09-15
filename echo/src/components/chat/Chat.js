import { useEffect, useState } from 'react'
import MessageRight from './MessageRight'
import MessageLeft from './MessageLeft'

import LoadingAnimation from '../mainpage/LoadingAnimation'

import { ep } from "../../index";

const api = require('../../api');

function Chat({ currentRoomId }) {
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [messages, setMessages] = useState([]);

  const updateMessages = () => {
    ep.checkMessagesCache(currentRoomId)
      .then((res) => {
        // duplicate array
        setMessages([...res]);
        setLoadingVisibility(false);
      })
      .catch((err) => {
        console.error(err);
        setMessages([]);

        // get messages from api
        api.call("rooms/" + currentRoomId + "/messages")
          .then((res) => {
            console.log("got messages from api", res.json)
            ep.setMessagesCache(res.json, currentRoomId);
          })
          .catch((err) => {
            console.error(err);
            setLoadingVisibility(false);
            setMessages([]);
          });
      });
  }

  useEffect(() => {
    setLoadingVisibility(true);
    updateMessages();
    if (currentRoomId === 0) {
      setLoadingVisibility(false);
    }
  }, [currentRoomId]);

  useEffect(() => {
    ep.on("receiveChatMessage", "Chat.receiveChatMessage", (newMessage) => {
      // console.log("Chat.receiveChatMessage", newMessage)
      setMessages((routeMessages) => [newMessage, ...routeMessages]);
    });
    ep.on("messagesCacheUpdated", "Chat.messagesCacheUpdated", (messages) => {
      // console.log("Chat.messagesCacheUpdated", messages)
      setMessages([...messages]);
      setLoadingVisibility(false);
    });
    return () => {
      ep.releaseGroup("Chat.receiveChatMessage");
      ep.releaseGroup("Chat.messagesCacheUpdated");
    }
  }, []);

  if (currentRoomId === 0) {
    return (
      <div className='chat'>
        <LoadingAnimation visibility={Boolean(loadingVisibility)} className='loadingAnimation'/>
        <div className='noMessages'>Join a room to open the chat</div>
      </div>
    )
  }
  
  return (
    <div className='chat'>
      <LoadingAnimation visibility={Boolean(loadingVisibility)} className='loadingAnimation'/>

      {messages.length > 0 ? messages.map((message, id) => {
        if (String(message.userId) === String(localStorage.getItem("id"))) {
          return <MessageLeft key={id} message={message} />
        } else {
          return <MessageRight key={id} message={message} />
        }
      }) : <div className='noMessages'>{ Boolean(loadingVisibility) ? "" : "No messages yet" }</div>}
    </div>
  )
}

export default Chat