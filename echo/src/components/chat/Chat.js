import { useEffect, useState } from 'react'
import MessageRight from './MessageRight'
import MessageLeft from './MessageLeft'

import LoadingAnimation from '../mainpage/LoadingAnimation'

import { ep } from "../../index";

const api = require('../../api');

function Chat({ currentRoomId }) {
  const [loadingVisibility, setLoadingVisibility] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setLoadingVisibility(true);

    ep.checkMessagesCache(currentRoomId)
      .then((res) => {
        console.log("got messages from cache", res)
        setMessages(res);
        setLoadingVisibility(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingVisibility(false);
        setMessages([]);

        // get messages from api
        api.call("rooms/" + currentRoomId + "/messages")
          .then((res) => {
            setLoadingVisibility(false);
            console.log("got messages from api", res.json)
            const messages = ep.setMessagesCache(res.json, currentRoomId);
            setMessages(messages);
            console.log("messages", res.json)
          })
          .catch((err) => {
            console.error(err);
            setLoadingVisibility(false);
            setMessages([]);
          });
      });
  }, [currentRoomId])

  console.log("created room chat with id", currentRoomId)

  const addMessage = (message) => {
    console.log("Chat.receiveChatMessage", message)

    // sort messages by insertDate
    // messages = messages.sort((a, b) => {
    //   return new Date(a.insertDate) - new Date(b.insertDate);
    // });

    setMessages((messages) => [message, ...messages]);
  }

  useEffect(() => {
    // ep.on("roomClicked", "Chat.roomClicked", (data) => {
    //   console.log("roomClicked", data)
    // });

    ep.on("receiveChatMessage", "Chat.receiveChatMessage", addMessage);

    return () => {
      ep.releaseGroup("Chat.receiveChatMessage");
    }
  }, [])
  
  return (
    <div className='chat'>
      <LoadingAnimation visibility={Boolean(loadingVisibility)} className='loadingAnimation'/>
      {/* <LoadingAnimation visibility={Boolean(true)} className='loadingAnimation'/> */}

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