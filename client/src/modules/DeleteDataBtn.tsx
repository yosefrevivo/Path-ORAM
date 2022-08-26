import { useState } from 'react';
import { Modal, Button, Group, LoadingOverlay, Container, TextInput, Paper, Text, Center, Space } from '@mantine/core';
import { BiKey } from "react-icons/bi";
import { showNotification } from '@mantine/notifications';
import { access } from '../global';


async function DeleteData(name: string): Promise<any> {

  await new Promise(resolve => setTimeout(resolve, 400));

  if(name.length < 2) return;

  try{
    
    await access("delete", name, "");

    // show notification.
    showNotification({ 
      color: "teal",
      title: 'Success',
      message: 'Your data removed successfully from the server! 😄',
    });

  } catch (error) {

    console.log(error);
    showNotification({ 
      color: "red",
      title: 'Error',
      message: 'Can\'t delete your data!',
    });
    
  }

 

}

function DeleteDataBtn() {

  const [opened, setOpened] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <Modal centered
        withCloseButton={false}
        opened={opened}
        onClose={() => setOpened(false)}
        transition="fade"
      >
        <LoadingOverlay visible={overlay} />
        <Container>
          <TextInput
            label="Name"
            error={name?.length > 2 || name?.length == 0? "" : "Key length must be at least 2"}
            icon={<BiKey size={16} />}
            placeholder="key to delete"
            required
            style={{"marginBottom": 5}}
            onChange={(btn) => setName(btn.target.value)}
          />

          <Center my="sm">
            <Button color="red"
              onClick={async () => {
                setOverlay(true);
                await DeleteData(name);
                setOverlay(false);
              }}>
                Delete
            </Button>
          </Center>

          <Text size="xs" color="#c4ccc6">* Note The information is deleted locally, you can always overwrite the information with other information. </Text>
          
        </Container>
      </Modal>

      <Group position="center">
        <Button onClick={() => setOpened(true)}>Delete data</Button>
      </Group>
    </>
  );
}

export default DeleteDataBtn;