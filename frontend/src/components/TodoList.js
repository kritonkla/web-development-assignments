import React, { useState, useEffect } from 'react';
import { FaTrash, FaCheck, FaSignOutAlt, FaPlus, FaClipboardList, FaCoffee, FaCalendarAlt} from 'react-icons/fa';

const CEI_LOGO_URL = "https://cei.kmitl.ac.th/wp-content/uploads/2024/09/cropped-ceip-fav-1.png"; 
const API_URL = process.env.REACT_APP_API_URL;

function TodoList({ username, onLogout }) {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newTargetDate, setNewTargetDate] = useState('');
    const [activeTab, setActiveTab] = useState('todo')

    useEffect(() => {
        fetchTodos();
        // eslint-disable-next-line
    }, [username]);

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_URL}/todos/${username}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Database data:",response)
                if (data.length>0) {
                    console.log("First Task Keys:", Object.keys(data[0]));
                }
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
                body: JSON.stringify({ username, task: newTask, target_date: newTargetDate || null }),
            });
            if (response.ok) {
                const newTodo = await response.json();
                setTodos([newTodo, ...todos]);
                setNewTask('');
            }
        } catch (err) { console.error(err); }
    };

    const filteredTodos = todos.filter(todo => {
        const status = Number(todo.done);
        if (activeTab === 'todo') return status === 0;
        if (activeTab === 'doing') return status === 2;
        if (activeTab === 'done') return status === 1;
        return true;
    });

    const handleToggleStatus = async(id, CurrentStatus) => {
        const nextStatus = getNextStatus(CurrentStatus);
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'applicaTion/json'},
                body: JSON.stringify({done: nextStatus}),
            });
            if (response.ok) {
                setTodos(todos.map(todo =>
                    todo.id === id ? {...todo, done: nextStatus} : todo
                ));
            }
        } catch (err) {console.error(err); }
    }

    const getNextStatus = (CurrentStatus) => {
        const status = Number(CurrentStatus);
        if (status === 0) return 2;
        if (status === 2) return 1;
        return 0;
    }

    const handleDeleteTodo = async (id) => {
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setTodos(todos.filter(todo => todo.id !== id));
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
            {/* Header: Sticky at top so it's always visible */}
            <div className='grid grid-cols-3 items-center p-6 bg-white border-b border-gray-100 dark:bg-gray-600 dark:border-gray-700 shadow-sm transition-colors duration-300'>
                <div className='justify-self-start'>
                </div>
                <div className='justify-self-center'>
                    <img src={CEI_LOGO_URL} alt="CEi" className='h-7'/>
                </div>
                <div className='justify-self-end flex items-center gap-3'>
                    <button
                        onClick={() => { localStorage.removeItem('todo_username'); onLogout(); }}
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                        aria-label='Logout'
                    >
                        <FaSignOutAlt size={20}/>
                    </button>
                </div>
            </div>


            {/* Input Area */}
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    My Tasks
                </h1>
                <form onSubmit={handleAddTodo} className="relative">
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="w-full p-4 pr-14 rounded-2xl border-none shadow-sm bg-white dark:bg-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <div className='flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm w-fit px-4'>
                        <FaCalendarAlt className='text-gray-400'/>
                        <input
                            type="datetime-local"
                            className='bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none'
                            value={newTargetDate}
                            onChange={(e) => setNewTargetDate(e.target.value)}
                        />
                    </div>
                </form>
            </div>

            <div className='flex px-6 gap-2 mt-2'>
                {['todo','doing','done'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                            activeTab === tab
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}         
                    >
                        {tab}
                    </button>
                ))}
                
            </div>

            {/* Scrollable List */}
            {/* flex-1 overflow-y-auto: Takes remaining height and scrolls internally */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                {filteredTodos.map(todo => (
                    <div 
                        key={todo.id} 
                        className={`group p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between
                            ${todo.done ? 'bg-gray-50 border-transparent dark:bg-gray-600' : 'bg-white dark:bg-gray-600 border-gray-100 dark:border-gray-400 shadow-sm'}
                        `}
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            <button
                                onClick={() => handleToggleStatus(todo.id,todo.done)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                    ${todo.done === 1 ? 'bg-green-500 border-green-500 text-white' : ''}
                                    ${todo.done === 2 ? 'bg-yellow-400 border-yellow-400 text-white' : ''}
                                    ${todo.done === 0 ? 'border-gray-300 dark:white text-transparent hover:border-green-500' : ''}
                                    `}
                                >
                                    {todo.done === 1 && <FaCheck size={10} />}
                                    {todo.done === 2 && <span className='animate-pulse text-[8px]'>•••</span>}

                            </button>

                            
                            <div className="flex flex-col min-w-0">
                                {/* truncate: Adds '...' if text is too long for mobile screen */}
                                <span className={`font-medium text-sm truncate ${todo.done === 1 ? 'line-through text-gray-400' : 'text-gray-700 dark:text-white'}`}>
                                    {todo.task}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(todo.updated).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-0.5">
                                    Target: {new Date(todo.target_date).toLocaleString()}
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
                
                {filteredTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-12 mb-12 text-center">
                        <div className='bg-blue-50 p-6 rounded-full mb-4 shadow-sm'>
                            <FaClipboardList className='text-blue-300 w-16 h-16 dark:invert'/>
                        </div>

                        <h3 className='text-xl font-bold text-gray-700 dark:text-white mb-2'>
                            All caught up!
                        </h3>

                        <p className='text-gray-400 max-w-[200px] text-sm flex items-center justify-center gap-2'>
                            Time to relax <FaCoffee className='text-yellow-500'/>  
                        </p>

                    </div>
                )}
            </div>
        </div>
    );
}

export default TodoList;