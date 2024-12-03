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

const database = SQLite.openDatabase(
  {
    name: 'bangTask2',
    location: 'default',
  },
  () => {
    console.log('Tao bang moi thanh cong');
  },
  error => {
    console.log('Loi: ', error);
  },
);

const taoBang = () => {
  database.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS nhiemvu (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        tenNhiemvu TEXT, 
        trangthaihoanthien BOOLEAN
      )`,
      [],
      () => console.log('Tao bang thanh cong'),
      (tx, error) => {
        console.log('Loi tao bang: ', error.message);
      },
    );
  });
};

const taoNhiemVuMoi = (tenNhiemvu: string) => {
  database.transaction(tx => {
    tx.executeSql(
      `INSERT INTO nhiemvu (tenNhiemvu, trangthaihoanthien) VALUES (?, ?)`,
      [tenNhiemvu, false],
      () => console.log('Tao nhiem vu thanh cong'),
      (tx, error) => {
        console.log('Loi them moi bang: ', error.message);
      },
    );
  });
};

const layCacNhiemVu = (setcacNhiemVu: (cacNhiemVu: any) => void) => {
  database.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM nhiemvu`,
      [],
      (_, result) => {
        const rows = result.rows.raw();
        setcacNhiemVu(rows);
      },
      (tx, error) => {
        console.log('Loi lay task: ', error.message);
      },
    );
  });
};

const capnhatNhiemvu = (
  id: number,
  tenNhiemvu: string,
  trangthaihoanthien: boolean,
) => {
  database.transaction(tx => {
    tx.executeSql(
      `UPDATE nhiemvu SET tenNhiemvu = ?, trangthaihoanthien = ? WHERE id = ?`,
      [tenNhiemvu, trangthaihoanthien, id],
      () => console.log('Nhiem vu cap nhat thanh cong'),
      (tx, error) => {
        console.log('Loi khi cap nhat nhiem vu: ', error.message);
      },
    );
  });
};

const xoaTask = (id: number) => {
  database.transaction(tx => {
    tx.executeSql(
      `DELETE FROM nhiemvu WHERE id = ?`,
      [id],
      () => console.log('nhiem vu duoc xoa thanh cong'),
      (tx, error) => {
        console.log('loi khi xoa nhiem vu: ', error.message);
      },
    );
  });
};

const App = () => {
  const [tenNhiemVu, settenNhiemVu] = useState('');
  const [cacNhiemVu, setcacNhiemVu] = useState<
    {id: number; tenNhiemvu: string; trangthaihoanthien: boolean}[]
  >([]);
  const [ishienthiDialog, sethienthiDialog] = useState(false);
  const [tenChinhsua, settenChinhsua] = useState('');
  const [idNhiemvuDuocchinhsua, setidNhiemvuDuocchinhsua] = useState<
    number | null
  >(null);

  useEffect(() => {
    taoBang();
    loadcacNhiemVu();
  }, []);

  const loadcacNhiemVu = () => {
    layCacNhiemVu(setcacNhiemVu);
  };

  const tenThemMoiNhiemVu = () => {
    if (tenNhiemVu) {
      taoNhiemVuMoi(tenNhiemVu);
      settenNhiemVu('');
      loadcacNhiemVu();
    }
  };

  const handleToggleComplete = (id: number, trangthaihoanthien: boolean) => {
    const task = cacNhiemVu.find(task => task.id === id);
    if (task) {
      capnhatNhiemvu(id, task.tenNhiemvu, !trangthaihoanthien);
      loadcacNhiemVu();
    }
  };

  const handleCapnhatNhiemvu = (id: number, tenNhiemvu: string) => {
    setidNhiemvuDuocchinhsua(id);
    settenChinhsua(tenNhiemvu);
    sethienthiDialog(true);
  };

  const luuNhiemvuDuoccapnhat = () => {
    if (idNhiemvuDuocchinhsua !== null) {
      capnhatNhiemvu(idNhiemvuDuocchinhsua, tenChinhsua, false);
      sethienthiDialog(false);
      loadcacNhiemVu();
    }
  };

  const handlexoaTask = (id: number) => {
    xoaTask(id);
    loadcacNhiemVu();
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TextInput
          label="Task Name"
          value={tenNhiemVu}
          onChangeText={settenNhiemVu}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={tenThemMoiNhiemVu}
          style={styles.button}>
          Add Task
        </Button>

        <Text style={styles.header}>Incoming Tasks</Text>
        <FlatList
          data={cacNhiemVu.filter(task => !task.trangthaihoanthien)}
          renderItem={({item}) => (
            <List.Item
              title={<Text>{item.tenNhiemvu}</Text>}
              right={() => (
                <>
                  <Button
                    onPress={() =>
                      handleToggleComplete(item.id, item.trangthaihoanthien)
                    }>
                    Done
                  </Button>
                  <Button
                    onPress={() =>
                      handleCapnhatNhiemvu(item.id, item.tenNhiemvu)
                    }>
                    Update
                  </Button>
                  <Button onPress={() => handlexoaTask(item.id)}>Delete</Button>
                </>
              )}
              onPress={() => handleCapnhatNhiemvu(item.id, item.tenNhiemvu)}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />

        <Text style={styles.header}>Finished Tasks</Text>
        <FlatList
          data={cacNhiemVu.filter(task => task.trangthaihoanthien)}
          renderItem={({item}) => (
            <List.Item
              title={
                <Text style={{textDecorationLine: 'line-through'}}>
                  {item.tenNhiemvu}
                </Text>
              }
              right={() => (
                <>
                  <Button
                    onPress={() =>
                      handleToggleComplete(item.id, item.trangthaihoanthien)
                    }>
                    Have not done
                  </Button>
                  <Button
                    onPress={() =>
                      handleCapnhatNhiemvu(item.id, item.tenNhiemvu)
                    }>
                    Update
                  </Button>
                  <Button onPress={() => handlexoaTask(item.id)}>Delete</Button>
                </>
              )}
              onPress={() => handleCapnhatNhiemvu(item.id, item.tenNhiemvu)}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />

        <Portal>
          <Dialog
            visible={ishienthiDialog}
            onDismiss={() => sethienthiDialog(false)}>
            <Dialog.Title>Edit Task</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Task Name"
                value={tenChinhsua}
                onChangeText={settenChinhsua}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={luuNhiemvuDuoccapnhat}>Save</Button>
              <Button onPress={() => sethienthiDialog(false)}>Cancel</Button>
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
