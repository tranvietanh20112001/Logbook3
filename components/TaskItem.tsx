import React, {useState} from 'react';
import {
  List,
  Checkbox,
  Button,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import {Text} from 'react-native'; // Import Text from react-native

interface TaskItemProps {
  id: number;
  name: string;
  completed: boolean;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (id: number, newName: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  id,
  name,
  completed,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}) => {
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleEdit = () => {
    onEditTask(id, editedName);
    setDialogVisible(false);
  };

  return (
    <>
      <List.Item
        title={<Text>{name}</Text>} // Wrap the task name in <Text>
        left={() => (
          <Checkbox
            status={completed ? 'checked' : 'unchecked'}
            onPress={() => onToggleComplete(id, completed)}
          />
        )}
        right={() => (
          <>
            <Button onPress={() => setDialogVisible(true)}>Edit</Button>
            <Button onPress={() => onDeleteTask(id)}>Delete</Button>
          </>
        )}
      />
      {/* Edit Task Dialog */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Edit Task</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Task Name"
              value={editedName}
              onChangeText={setEditedName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleEdit}>Save</Button>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default TaskItem;
