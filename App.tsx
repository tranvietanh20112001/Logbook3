import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {
  Provider as PaperProvider,
  TextInput,
  Button,
  List,
  Dialog,
  Portal,
} from 'react-native-paper';
import SQLite from 'react-native-sqlite-storage';

// Khởi tạo SQLite database
const db = SQLite.openDatabase(
  {
    name: 'taskDB',
    location: 'default',
  },
  () => {
    console.log('Database opened');
  },
  error => {
    console.log('Error: ', error);
  },
);

// Tạo bảng nếu chưa tồn tại
const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        completed BOOLEAN
      )`,
      [],
      () => console.log('Table created'),
      (tx, error) => {
        console.log('Error creating table: ', error.message);
      },
    );
  });
};

// Chèn task mới
const insertTask = (name: string) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO tasks (name, completed) VALUES (?, ?)`,
      [name, false],
      () => console.log('Task inserted'),
      (tx, error) => {
        console.log('Error inserting task: ', error.message);
      },
    );
  });
};

// Lấy danh sách task
const getTasks = (setTasks: (tasks: any) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM tasks`,
      [],
      (_, result) => {
        const rows = result.rows.raw();
        setTasks(rows);
      },
      (tx, error) => {
        console.log('Error fetching tasks: ', error.message);
      },
    );
  });
};

// Cập nhật task
const updateTask = (id: number, name: string, completed: boolean) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE tasks SET name = ?, completed = ? WHERE id = ?`,
      [name, completed, id],
      () => console.log('Task updated'),
      (tx, error) => {
        console.log('Error updating task: ', error.message);
      },
    );
  });
};

// Xóa task
const deleteTask = (id: number) => {
  db.transaction(tx => {
    tx.executeSql(
      `DELETE FROM tasks WHERE id = ?`,
      [id],
      () => console.log('Task deleted'),
      (tx, error) => {
        console.log('Error deleting task: ', error.message);
      },
    );
  });
};

// Component chính của ứng dụng
const App = () => {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState<
    {id: number; name: string; completed: boolean}[]
  >([]);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    createTable();
    loadTasks();
  }, []);

  const loadTasks = () => {
    getTasks(setTasks);
  };

  const handleAddTask = () => {
    if (taskName) {
      insertTask(taskName);
      setTaskName('');
      loadTasks();
    }
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      updateTask(id, task.name, !completed);
      loadTasks();
    }
  };

  const handleEditTask = (id: number, name: string) => {
    setEditingTaskId(id);
    setEditedName(name);
    setDialogVisible(true);
  };

  const saveEditedTask = () => {
    if (editingTaskId !== null) {
      updateTask(editingTaskId, editedName, false);
      setDialogVisible(false);
      loadTasks();
    }
  };

  const handleDeleteTask = (id: number) => {
    deleteTask(id);
    loadTasks();
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TextInput
          label="Task Name"
          value={taskName}
          onChangeText={setTaskName}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleAddTask} style={styles.button}>
          Add Task
        </Button>

        {/* Tasks cần làm */}
        <Text style={styles.header}>Tasks cần làm</Text>
        <FlatList
          data={tasks.filter(task => !task.completed)} // Chỉ hiển thị task chưa hoàn thành
          renderItem={({item}) => (
            <List.Item
              title={<Text>{item.name}</Text>}
              right={() => (
                <>
                  <Button
                    onPress={() =>
                      handleToggleComplete(item.id, item.completed)
                    }>
                    Done
                  </Button>
                  <Button onPress={() => handleEditTask(item.id, item.name)}>
                    Update
                  </Button>
                  <Button onPress={() => handleDeleteTask(item.id)}>
                    Delete
                  </Button>
                </>
              )}
              onPress={() => handleEditTask(item.id, item.name)}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />

        {/* Tasks đã hoàn thành */}
        <Text style={styles.header}>Tasks đã hoàn thành</Text>
        <FlatList
          data={tasks.filter(task => task.completed)} // Chỉ hiển thị task đã hoàn thành
          renderItem={({item}) => (
            <List.Item
              title={
                <Text style={{textDecorationLine: 'line-through'}}>
                  {item.name}
                </Text>
              } // Gạch ngang tên task
              right={() => (
                <>
                  <Button
                    onPress={() =>
                      handleToggleComplete(item.id, item.completed)
                    }>
                    Have not done
                  </Button>
                  <Button onPress={() => handleEditTask(item.id, item.name)}>
                    Update
                  </Button>
                  <Button onPress={() => handleDeleteTask(item.id)}>
                    Delete
                  </Button>
                </>
              )}
              onPress={() => handleEditTask(item.id, item.name)}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />

        {/* Dialog chỉnh sửa task */}
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
              <Button onPress={saveEditedTask}>Save</Button>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default App;
