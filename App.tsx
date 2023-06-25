/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {ToDoItem as ToDoItemComponent} from './components/ToDoItem';
import {ToDoItem} from './models/ToDoItem';
import {
  createTable,
  deleteTodoItem,
  getDBConnection,
  getTodoItems,
  saveTodoItems,
} from './services/db-service';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const loadDataCallback = useCallback(async () => {
    try {
      const initTodos = [
        {id: 0, value: 'go to shop'},
        {id: 1, value: 'eat at least a one healthy foods'},
        {id: 2, value: 'do some exercises'},
      ];
      const db = await getDBConnection();
      await createTable(db); //Criação da tabela
      const storedTodoItems = await getTodoItems(db); //Recuperação dos itens de tarefa pendente do banco de dados
      if (storedTodoItems.length) {
        //Verificação de itens armazenados
        setTodos(storedTodoItems);
      } else {
        await saveTodoItems(db, initTodos); //Inicialização com valores padrão caso não haja itens de tarefa
        setTodos(initTodos);
      }
    } catch (error) {
      console.error(error);
    }
  }, []); //Será executada na inicialização da aplicação

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]); //Chama a função loadDataCallback na inicialização da aplicação

  const addTodo = async () => {
    if (!newTodo.trim()) {
      return;
    } //Verificação de entrada vazia
    try {
      const newTodos = [
        ...todos,
        {
          id: todos.length
            ? todos.reduce((acc, cur) => {
                if (cur.id > acc.id) {
                  return cur;
                }
                return acc;
              }).id + 1
            : 0,
          value: newTodo,
        },
      ]; //Criação de um novo array de tarefas pendentes
      setTodos(newTodos); //Atribuição do novo array de tarefas pendentes
      const db = await getDBConnection(); //Conexão com o banco de dados
      await saveTodoItems(db, newTodos); //Salvando os novos itens no banco de dados
      setNewTodo(''); //Limpeza da entrada
    } catch (error) {
      //Tratamento de erros
      console.error(error);
    }
  };

  const deleteItem = async (id: number) => {
    //Parâmetro de ID
    try {
      const db = await getDBConnection(); //Conexão com o banco de dados
      await deleteTodoItem(db, id); //Excluindo o item do banco de dados
      todos.splice(id, 1); //Removendo o item do array de tarefas pendentes
      setTodos(todos.slice(0)); //Atualização do estado da aplicação
    } catch (error) {
      //Tratamento de erros
      console.error(error);
    }
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={[styles.appTitleView]}>
          <Text style={styles.appTitleText}> ToDo List </Text>
        </View>

        <View>
          {todos.map(todo => (
            <ToDoItemComponent
              key={todo.id}
              todo={todo}
              deleteItem={deleteItem}
            />
          ))}
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={newTodo}
            onChangeText={text => setNewTodo(text)}
          />
          <Button
            onPress={addTodo}
            title="Add ToDo"
            color="#841584"
            accessibilityLabel="add todo item"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appTitleView: {
    marginTop: 20,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  appTitleText: {
    fontSize: 24,
    fontWeight: '800',
  },
  textInputContainer: {
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
    justifyContent: 'flex-end',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
    height: 30,
    margin: 10,
    backgroundColor: 'pink',
  },
});

export default App;
