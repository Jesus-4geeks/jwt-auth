export const initialStore = () => {
  return {
    message: null,
    // Authentication state
    user: JSON.parse(sessionStorage.getItem('user')) || null,
    token: sessionStorage.getItem('token') || null,
    isAuthenticated: !!sessionStorage.getItem('token'),
    // Original todos state
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type) {
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };

    // Authentication actions
    case 'login_success':
      // Save to sessionStorage
      sessionStorage.setItem('token', action.payload.token);
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...store,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true
      };

    case 'logout':
      // Clear sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return {
        ...store,
        user: null,
        token: null,
        isAuthenticated: false
      };

    case 'update_user':
      // Update user info
      sessionStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...store,
        user: action.payload
      };

    case 'set_auth_loading':
      return {
        ...store,
        authLoading: action.payload
      };

    default:
      throw Error('Unknown action: ' + action.type);
  }    
}