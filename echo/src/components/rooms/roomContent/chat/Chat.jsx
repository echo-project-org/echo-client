import { useEffect, useState } from 'react';

import { Container, styled } from '@mui/material';

import MessageRight from './MessageRight'
import MessageLeft from './MessageLeft'
import LoadingAnimation from '@components/mainpage/LoadingAnimation'

import { ee, ep, storage } from "@root/index";

const api = require('@lib/api');
const { error, info } = require('@lib/logger');

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
    info("[Chat] Getting messages list");
    ep.checkMessagesCache(currentRoomId)
      .then((res) => {
        // duplicate array
        setMessages([...res]);
        setLoadingVisibility(false);
      })
      .catch((err) => {
        error(err);
        setMessages([]);

        // get messages from api
        api.call("rooms/" + currentRoomId + "/" + storage.get('serverId') + "/messages")
          .then((res) => {
            ep.setMessagesCache({ messages: res.json, roomId: currentRoomId });
          })
          .catch((err) => {
            error(err);
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
    ee.on("receiveChatMessage", "Chat.receiveChatMessage", (newMessage) => {
      // check if message contains <br>, if so replace with \n
      setMessages((routeMessages) => [newMessage, ...routeMessages]);
    });
    ee.on("messagesCacheUpdated", "Chat.messagesCacheUpdated", (messages) => {
      setMessages([...messages]);
      setLoadingVisibility(false);
    });
    return () => {
      ee.releaseGroup("Chat.receiveChatMessage");
      ee.releaseGroup("Chat.messagesCacheUpdated");
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
          if (String(message.userId) === String(sessionStorage.getItem("id"))) {
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