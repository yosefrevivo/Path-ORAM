import { useState } from 'react';
import { Modal, Button, Group, LoadingOverlay, Container, TextInput, Textarea, Center } from '@mantine/core';
import { BiKey, BiPlus } from "react-icons/bi";
import { showNotification } from '@mantine/notifications';
import { access } from '../global';


async function SubmitData(name: string, data: string) {

  if(name.length < 2 || data.length == 0) return;
  
  try{
    
    
    await access("write", name, data);
    
    // show notification.
    showNotification({ 
      color: "teal",
      title: 'Success',
      message: 'Your data saved successfully! 😄',
    });

  } catch (error) {

    console.log(error);
    showNotification({ 
      color: "red",
      title: 'Error',
      message: 'Can\'t save your data!',
    });
    
  }

}

function SaveDataBtn() {

  const [opened, setOpened] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [name, setName] = useState("");
  const [data, setData] = useState("");

  return (
    <>
      <Modal centered
        withCloseButton={false}
        opened={opened}
        onClose={() => setOpened(false)}
        //title="Enter data to save on the server"
        transition="fade"
      >
        <LoadingOverlay visible={overlay} />
        <Container>
          <TextInput
            error={name?.length > 2 || name?.length == 0? "" : "Key length must be at least 2"}
            label="Name"
            icon={<BiKey size={16} />}
            placeholder="Your key name"
            required
            style={{"marginBottom": 5}}
            onChange={(btn) => setName(btn.target.value)}
          />

          <Textarea
            label="Data"
            placeholder="Your data"
            required
            style={{"marginBottom": 20}}
            onChange={(btn) => setData(btn.target.value)}

          />

          <Center>
            <Button
              onClick={async () => {
                setOverlay(true);
                await SubmitData(name, data);
                setOverlay(false);
                setOpened(false);
              }}>
                Submit
            </Button>
          </Center>
          
        </Container>
      </Modal>

      <Group position="center">
        <Button onClick={() => setOpened(true)}>Save new data</Button>
      </Group>
    </>
  );
}

export default SaveDataBtn;