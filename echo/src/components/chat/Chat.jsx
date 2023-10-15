import { useEffect, useState } from 'react';

import { Container, styled } from '@mui/material';

import MessageRight from './MessageRight'
import MessageLeft from './MessageLeft'
import LoadingAnimation from '../mainpage/LoadingAnimation'

import { ep, storage } from "../../index";
const api = require('../../api');

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    overflow: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    height: "100%",
    width: "100%",
    position: "absolute",
    maxWidth: "calc(100vw - 20rem)",
    padding: "0",
  },
}));

function Chat({ currentRoomId, onMouseDown }) {
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
            ep.setMessagesCache({ messages: res.json, roomId: currentRoomId });
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
      // check if message contains <br>, if so replace with \n
      setMessages((routeMessages) => [newMessage, ...routeMessages]);
    });
    ep.on("messagesCacheUpdated", "Chat.messagesCacheUpdated", (messages) => {
      setMessages([...messages]);
      setLoadingVisibility(false);
    });
    return () => {
      ep.off("receiveChatMessage", "Chat.receiveChatMessage");
      ep.off("messagesCacheUpdated", "Chat.messagesCacheUpdated");
    }
  }, []);

  if (currentRoomId === 0) {
    return (
      <div className='chat' onMouseDown={onMouseDown}>
        <LoadingAnimation visibility={Boolean(loadingVisibility)} className='loadingAnimation'/>
        <StyledContainer>
          <div className='noMessages'>Join a room to open the chat</div>
        </StyledContainer>
      </div>
    )
  }
  
  return (
    <div className='chat' onMouseDown={onMouseDown}>
      <LoadingAnimation visibility={Boolean(loadingVisibility)} className='loadingAnimation'/>

      <StyledContainer>
        {messages.length > 0 ? messages.map((message, id) => {
          if (String(message.userId) === String(storage.get("id"))) {
            return <MessageLeft key={id} message={message} />
          } else {
            return <MessageRight key={id} message={message} />
          }
        }) : <div className='noMessages'>{ Boolean(loadingVisibility) ? "" : "No messages yet" }</div>}
        </StyledContainer>
    </div>
  )
}

export default Chat