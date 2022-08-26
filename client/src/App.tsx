import React, { useState } from 'react';
import './App.css';
import Bear from './modules/modules';
import { Title, Space, Group, Center } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import DeleteDataBtn from './modules/DeleteDataBtn';
import SaveDataBtn from './modules/SaveDataBtn';
import GetDataBtn from './modules/GetDataBtn';

function App() {

  const [words, setWords] = useState([]);

  return (
      <NotificationsProvider position='bottom-center'>
        <div className="App" style={{"margin": 100}}>
          <div style={{ width: "100%", height: "100%" }}>
            <Title order={1} style={{"fontSize": 80}}>Data Bear</Title>
            <Title order={4}>We are here to <u>bear</u> all your secure information</Title>
            <Space h="lg" />
            <Group position='center'>
              <GetDataBtn></GetDataBtn>
              <SaveDataBtn></SaveDataBtn>
              <DeleteDataBtn></DeleteDataBtn>
            </Group>
          </div>
          <Bear></Bear>

        </div>
      </NotificationsProvider>
  );
}

export default App;
