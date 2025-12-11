import React, { useState, useEffect } from 'react';
import { FaTrash, FaCheck, FaSignOutAlt, FaPlus } from 'react-icons/fa'; // React Icons

const CEI_LOGO_URL = "https://cei.kmitl.ac.th/wp-content/uploads/2024/09/cropped-ceip-fav-1.png"; 
const API_URL = process.env.REACT_APP_API_URL;

function TodoList({ username, onLogout }) {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        fetchTodos();
        // eslint-disable-next-line
    }, [username]);

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_URL}/todos/${username}`);
            if (response.ok) {
                const data = await response.json();
                setTodos(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            const response = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, task: newTask }),
            });
            if (response.ok) {
                const newTodo = await response.json();
                setTodos([newTodo, ...todos]);
                setNewTask('');
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleDone = async (id, currentDoneStatus) => {
        const newDoneStatus = !currentDoneStatus;
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ done: newDoneStatus }),
            });
            if (response.ok) {
                setTodos(todos.map(todo => 
                    todo.id === id ? { ...todo, done: newDoneStatus } : todo
                ));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteTodo = async (id) => {
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setTodos(todos.filter(todo => todo.id !== id));
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header: Sticky at top so it's always visible */}
            <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
                <img src={CEI_LOGO_URL} alt="CEi" className="h-8" />
                <button 
                    onClick={() => { localStorage.removeItem('todo_username'); onLogout(); }} 
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <FaSignOutAlt size={20} />
                </button>
            </div>

            {/* Input Area */}
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    My Tasks
                </h1>
                <form onSubmit={handleAddTodo} className="relative">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="w-full p-4 pr-14 rounded-2xl border-none shadow-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    {/* Absolute positioning places the button INSIDE the input box */}
                    <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition shadow-md"
                    >
                        <FaPlus />
                    </button>
                </form>
            </div>

            {/* Scrollable List */}
            {/* flex-1 overflow-y-auto: Takes remaining height and scrolls internally */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                {todos.map(todo => (
                    <div 
                        key={todo.id} 
                        className={`group p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between
                            ${todo.done ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-100 shadow-sm'}
                        `}
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            {/* Custom Checkbox Button */}
                            <button 
                                onClick={() => handleToggleDone(todo.id, todo.done)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors 
                                    ${todo.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-green-500'}
                                `}
                            >
                                <FaCheck size={10} />
                            </button>
                            
                            <div className="flex flex-col min-w-0">
                                {/* truncate: Adds '...' if text is too long for mobile screen */}
                                <span className={`font-medium text-sm truncate ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {todo.task}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(todo.updated).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Delete Button - Only shows color on hover/group-hover */}
                        <button 
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
                
                {todos.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 text-sm">
                        No tasks yet. Enjoy your day!
                    </div>
                )}
            </div>
        </div>
    );
}

export default TodoList;