import { useState } from 'react';
import { Modal, Button, Group, LoadingOverlay, Container, TextInput, Paper, Text, Center, Space } from '@mantine/core';
import { BiKey } from "react-icons/bi";
import { showNotification } from '@mantine/notifications';
import { access } from '../global';

async function GetData(name: string): Promise<any> {

  if(name.length < 2) return;

  // await new Promise(resolve => setTimeout(resolve, 400));

  try{

    let data = await access("read", name, "");

    // show notification.
    showNotification({ 
      color: data? "teal": "yellow",
      title: data? 'Success': "Attention",
      message: data? 'Data retrieved successfully! 😄': `There isn't any data saved for key name - ${name}`,
    });

    return data;

  } catch (error) {

    console.log(error);
    showNotification({ 
      color: "red",
      title: 'Error',
      message: 'Can\'t retrieve  your data!',
    });
    
  }

 

}

function GetDataBtn(props: any) {

  const [opened, setOpened] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [name, setName] = useState("");
  const [data, setData] = useState("");

  return (
    <>
      <Modal centered
        withCloseButton={false}
        opened={opened}
        onClose={() => {setOpened(false); setData("");}}
        //title="Enter data to get from the server"
        transition="fade"
      >
        <LoadingOverlay visible={overlay} />
        <Container>
          <TextInput
            label="Name"
            icon={<BiKey size={16} />}
            error={name?.length > 2 || name?.length == 0? "" : "Key length must be at least 2"}
            placeholder="Your key to retrieve the data"
            required
            style={{"marginBottom": 5}}
            onChange={(btn) => setName(btn.target.value)}
          />

          {data? <Paper shadow="xs" radius="md" p="lg" my="lg">
            <Text>{data}</Text>
          </Paper>: <></>}

          <Center my="sm">
            <Button
              onClick={async () => {
                setOverlay(true);
                setData(await GetData(name));
                setOverlay(false);
              }}>
                Submit
            </Button>
          </Center>
          
        </Container>
      </Modal>

      <Group position="center">
        <Button onClick={() => setOpened(true)}>Get data</Button>
      </Group>
    </>
  );
}

export default GetDataBtn;